import {
  HiArrowLeft,
  HiArrowPath,
  HiChevronDoubleRight,
  HiPauseCircle,
  HiPlayCircle,
  HiPlus,
  HiStopCircle,
  HiTrash,
} from "react-icons/hi2";
import { calculateTotalElapsedTime } from "./utils/calculateTotalElapsedTime";
import { calculateTimeDifference } from "./utils/calculateTimeDifference";
import { useEffect, useRef, useState } from "react";
import { EditableInput } from "./components/EditableInput";
import { TaskWithOptionalId, db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import { parseTimeToSeconds } from "./utils/parseTimeToSeconds";

function App() {
  const [activeTask, setActiveTask] = useState<TaskWithOptionalId | null>(null);
  const [ticking, setTicking] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { parentID } = useParams<{ parentID?: string }>();
  const taskTable = db.tasks;

  const tasks = useLiveQuery(async () => {
    //
    // Query the DB using our promise based API.
    // The end result will magically become
    // observable.
    //
    if (parentID) {
      return await taskTable
        .filter((task) => task.parentID === Number(parentID))
        .toArray();
    }
    return await taskTable.filter((task) => !task.parentID).toArray();
  }, [parentID]);
  const parentTask = useLiveQuery(async () => {
    if (parentID) {
      return await taskTable.get(Number(parentID));
    }
    return null;
  }, [parentID]);

  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const seconds = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000
        );
        setCount(seconds);
      }, 1000);
    }
    if (!ticking) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [ticking, startTime]);

  const handleStartTask = (task: TaskWithOptionalId) => {
    setActiveTask(task);
    setTicking(true);
    setStartTime(new Date());
    setCount(0);
  };

  const handleEndTask = async () => {
    if (activeTask) {
      await taskTable.put({
        ...activeTask,
        elapsedTime: activeTask.elapsedTime + count,
      });
    }
    setActiveTask(null);
    setTicking(false);
    setCount(0);
    setStartTime(new Date());
  };
  const handleSave = async (task: Partial<TaskWithOptionalId>) => {
    const defaultTask = { name: "Untitled", elapsedTime: 0 };
    if (parentID) {
      const parentTask = await taskTable.get(Number(parentID));
      const childId = (await taskTable.put({
        ...defaultTask,
        ...task,
        parentID: Number(parentID),
      })) as number;

      if (parentTask) {
        const subTasks = parentTask.subTasks || [];
        if (!subTasks.includes(childId)) {
          await taskTable.put({
            ...parentTask,
            subTasks: [...subTasks, childId],
          });
        }
      }

      return;
    }
    await taskTable.put({ ...defaultTask, ...task });
  };
  const handleDelete = async (id: number) => {
    const task = await taskTable.get(id);
    if (task) {
      if (task.parentID) {
        const parentTask = await taskTable.get(task.parentID);
        if (parentTask) {
          await taskTable.put({
            ...parentTask,
            subTasks: parentTask.subTasks?.filter((t) => t !== id),
          });
        }
      }
      if (task.subTasks) {
        const deleteRecursive = async (subTaskId: number) => {
          const subTask = await taskTable.get(subTaskId);
          if (subTask && subTask.subTasks) {
            subTask.subTasks.forEach((subTaskId) => {
              deleteRecursive(subTaskId);
            });
          }
          taskTable.delete(subTaskId);
        };
        await Promise.all(
          task.subTasks.map(async (subTaskId) => {
            await deleteRecursive(subTaskId);
          })
        );
      }
      await taskTable.delete(id);
    }
  };

  return (
    <div>
      {parentTask ? (
        <Link
          className="m-2 text-2xl flex items-center"
          to={parentTask.parentID ? `/task/${parentTask.parentID}` : "/"}
        >
          <HiArrowLeft className="inline-block me-1" />
          Back
        </Link>
      ) : null}
      <div className="p-10">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left w-3/5">Task</th>
              <th className="p-4 text-left w-1/5">Time spent</th>
              <th className="p-4 text-left w-1/5"></th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map((task) => (
              <TaskCell
                key={task.id}
                task={task}
                handleStartTask={handleStartTask}
                handleSave={handleSave}
                handleDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
        <div>
          <button
            type="button"
            className="m-2 flex items-center mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => handleSave({ name: "Untitled" })}
          >
            <HiPlus className="inline-block me-1" />
            Add task
          </button>
        </div>
        <div>
          {activeTask ? (
            <div className="text-2xl select-none">
              <div>Current: {activeTask.name}</div>
              <div>Stopwatch: {calculateTimeDifference(count)}</div>
              <div className="flex">
                {ticking ? (
                  <HiPauseCircle
                    className="p-1 text-5xl"
                    onClick={() => setTicking(false)}
                  />
                ) : (
                  <HiPlayCircle
                    className="p-1 text-5xl"
                    onClick={() => setTicking(true)}
                  />
                )}
                <HiStopCircle
                  className="p-1 text-5xl"
                  onClick={handleEndTask}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const TaskCell = ({
  task,
  handleStartTask,
  handleSave,
  handleDelete,
}: {
  task: TaskWithOptionalId;
  handleStartTask: (task: TaskWithOptionalId) => void;
  handleSave: (task: Partial<TaskWithOptionalId>) => void;
  handleDelete: (id: number) => void;
}) => {
  const [text, setText] = useState(task.name);
  const timeString = useLiveQuery(async () => {
    return calculateTimeDifference(await calculateTotalElapsedTime(task));
  }, [task]);
  const [timeElapsed, setTimeElapsed] = useState(timeString);

  return (
    <tr className="hover:bg-slate-200">
      <td className="p-4 w-3/5">
        <EditableInput
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onBlur={() => {
            handleSave({ ...task, name: text });
          }}
        />
      </td>
      <td className="p-4 w-1/5">
        <EditableInput
          value={timeElapsed || timeString || ""}
          onChange={(e) => setTimeElapsed(e.target.value)}
          onBlur={(e) => {
            const elapsedTime = parseTimeToSeconds(e.target.value);
            handleSave({ ...task, elapsedTime });
            setTimeElapsed("");
          }}
        />
      </td>
      <td className="p-4 w-1/5">
        <div className="flex w-full justify-center items-center">
          <HiPlayCircle
            onClick={() => handleStartTask(task)}
            className="hover:text-blue-500 text-3xl me-1"
          />
          <HiArrowPath
            onClick={() => handleSave({ ...task, elapsedTime: 0 })}
            className="hover:text-blue-500 text-3xl me-1"
          />
          <HiTrash
            onClick={() =>
              task.id &&
              window.confirm(
                "Are you sure you want to delete? This is irreversible and all the sub-tasks with tracked time will be deleted"
              ) &&
              handleDelete(task.id)
            }
            className="hover:text-rose-700 text-3xl me-1"
          />
          <Link
            to={`/task/${task.id}`}
            className="decoration-none text-inherit"
          >
            <HiChevronDoubleRight className="hover:text-blue-500 text-3xl me-1" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default App;
