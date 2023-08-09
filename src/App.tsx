import {
  HiArrowLeft,
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
import {
  LogWithOptionalId,
  TaskWithOptionalId,
  createTask,
  deleteLog,
  deleteTask,
  updateLog,
  updateTask,
  useTask,
} from "./db";
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
  const parentTask = useTask(Number(parentID));
  const tasks = parentTask?.subTasks || [];
  const logs = parentTask?.logs || [];

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
    if (activeTask && activeTask.id) {
      await updateTask(activeTask.id, {
        ...activeTask,
        elapsedTime: activeTask.elapsedTime + count,
      });
    }
    setActiveTask(null);
    setTicking(false);
    setCount(0);
    setStartTime(new Date());
  };

  return (
    <div>
      {parentTask?.id ? (
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
              />
            ))}
            {logs?.map((log) => (
              <LogCell key={log.id} log={log} />
            ))}
          </tbody>
        </table>
        <div>
          <button
            type="button"
            className="m-2 flex items-center mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() =>
              createTask({ name: "Untitled", parentID: parentTask?.id })
            }
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
}: {
  task: TaskWithOptionalId;
  handleStartTask: (task: TaskWithOptionalId) => void;
}) => {
  const [text, setText] = useState(task.name);

  return (
    <tr className="hover:bg-slate-200">
      <td className="p-4 w-3/5">
        <EditableInput
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onBlur={() => {
            if (task.id) updateTask(task.id, { ...task, name: text });
          }}
        />
      </td>
      <td className="p-4 w-1/5">{calculateTimeDifference(task.elapsedTime)}</td>
      <td className="p-4 w-1/5">
        <div className="flex w-full justify-center items-center">
          <HiPlayCircle
            onClick={() => handleStartTask(task)}
            className="hover:text-blue-500 text-3xl me-1"
          />
          <HiTrash
            onClick={() =>
              task.id &&
              window.confirm(
                "Are you sure you want to delete? This is irreversible and all the sub-tasks with tracked time will be deleted"
              ) &&
              deleteTask(task.id)
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
const LogCell = ({ log }: { log: LogWithOptionalId }) => {
  const [text, setText] = useState(log.name);
  const timeString = useLiveQuery(async () => {
    return calculateTimeDifference(await calculateTotalElapsedTime(log));
  }, [log]);
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
            if (log.id) {
              updateLog(log.id, { ...log, name: text });
            }
          }}
        />
      </td>
      <td className="p-4 w-1/5">
        <EditableInput
          value={timeElapsed || timeString || ""}
          onChange={(e) => setTimeElapsed(e.target.value)}
          onBlur={(e) => {
            const elapsedTime = parseTimeToSeconds(e.target.value);
            if (log.id) updateLog(log.id, { ...log, elapsedTime });
            setTimeElapsed("");
          }}
        />
      </td>
      <td className="p-4 w-1/5">
        <div className="flex w-full justify-center items-center">
          <HiTrash
            onClick={() => log.id && deleteLog(log.id)}
            className="hover:text-rose-700 text-3xl me-1"
          />
        </div>
      </td>
    </tr>
  );
};

export default App;
