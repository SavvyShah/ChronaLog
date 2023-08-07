import {
  HiPauseCircle,
  HiPlayCircle,
  HiPlus,
  HiStopCircle,
} from "react-icons/hi2";
import { calculateTotalElapsedTime } from "./utils/calculateTotalElapsedTime";
import { calculateTimeDifference } from "./utils/calculateTimeDifference";
import { useEffect, useRef, useState } from "react";
import { EditableInput } from "./components/EditableInput";
import { TaskWithOptionalId, db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";

function App() {
  const [activeTask, setActiveTask] = useState<TaskWithOptionalId | null>(null);
  const [ticking, setTicking] = useState<boolean>(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskTable = db.tasks;
  const tasks = useLiveQuery(async () => {
    //
    // Query the DB using our promise based API.
    // The end result will magically become
    // observable.
    //
    return await taskTable.toArray();
  });

  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCount((c) => c + 1);
      }, 1000);
    }
    if (!ticking) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [ticking, count]);

  const handleStartTask = (task: TaskWithOptionalId) => {
    setActiveTask(task);
    setTicking(true);
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
  };
  const handleSave = async (task: Partial<TaskWithOptionalId>) => {
    const defaultTask = { task: "Untitled", elapsedTime: 0 };
    await taskTable.put({ ...defaultTask, ...task });
  };

  return (
    <div>
      <div className="p-10">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">Task</th>
              <th className="p-4 text-left">Time spent</th>
              <th className="p-4 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map((task) => (
              <TaskCell
                key={task.id}
                task={task}
                handleStartTask={handleStartTask}
                handleSave={handleSave}
              />
            ))}
          </tbody>
        </table>
        <div>
          <button
            type="button"
            className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => handleSave({ task: "Untitled" })}
          >
            <HiPlus className="inline-block" />
            Add task
          </button>
        </div>
        <div>
          {activeTask ? (
            <div className="text-2xl select-none">
              <div>Current: {activeTask.task}</div>
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
}: {
  task: TaskWithOptionalId;
  handleStartTask: (task: TaskWithOptionalId) => void;
  handleSave: (task: Partial<TaskWithOptionalId>) => void;
}) => {
  const [text, setText] = useState(task.task);

  return (
    <tr className="hover:bg-slate-200">
      <td className="p-4">
        <EditableInput
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onBlur={() => {
            handleSave({ ...task, task: text });
          }}
        />
      </td>
      <td className="p-4">
        {calculateTimeDifference(calculateTotalElapsedTime(task))}
      </td>
      <td className="p-4">
        <HiPlayCircle
          onClick={() => handleStartTask(task)}
          className="hover:text-green-500 text-2xl"
        />
      </td>
    </tr>
  );
};

export default App;
