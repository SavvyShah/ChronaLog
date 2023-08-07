import {
  HiPauseCircle,
  HiPlayCircle,
  HiPlus,
  HiStopCircle,
} from "react-icons/hi2";
import { calculateTotalElapsedTime } from "./utils/calculateTotalElapsedTime";
import { calculateTimeDifference } from "./utils/calculateTimeDifference";
import { useEffect, useRef, useState } from "react";
import { Task } from "./types/core";
import { EditableInput } from "./components/EditableInput";

let uniqId = 10;

const taskData: Task[] = [];

function App() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [appData, setAppData] = useState<Task[]>(taskData);
  const [ticking, setTicking] = useState<boolean>(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    setTicking(true);
  };

  const handleEndTask = () => {
    if (activeTask) {
      setAppData(
        updateElapsedTime(activeTask, activeTask.elapsedTime + count, appData)
      );
    }
    setActiveTask(null);
    setTicking(false);
    setCount(0);
  };
  const handleSave = (task: Partial<Task>) => {
    setAppData(updateOrCreateTask(task, appData));
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
            {appData.map((task) => (
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
  task: Task;
  handleStartTask: (task: Task) => void;
  handleSave: (task: Partial<Task>) => void;
}) => {
  return (
    <tr className="hover:bg-slate-200">
      <td className="p-4">
        <EditableInput
          value={task.task}
          onChange={(e) => {
            handleSave({ ...task, task: e.target.value });
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

function updateElapsedTime(
  task: Task,
  timeValue: number,
  taskData: Task[]
): Task[] {
  // Helper function to update the elapsed time of a task or subtask recursively
  function updateTaskTime(tasks: Task[]): Task[] {
    return tasks.map((t) => {
      if (t.id === task.id) {
        // Update the elapsed time of the target task
        return { ...t, elapsedTime: timeValue };
      } else if (t.subTasks && t.subTasks.length > 0) {
        // Update the subtasks recursively if present
        return { ...t, subTasks: updateTaskTime(t.subTasks) };
      }
      return t;
    });
  }

  // Create a new tree by updating the elapsed time of the specified task
  const updatedTaskData = updateTaskTime(taskData);

  return updatedTaskData;
}

function updateOrCreateTask(task: Partial<Task>, taskData: Task[]): Task[] {
  const defaultTask = { task: "Untitled", elapsedTime: 0, id: uniqId };
  let foundTarget = false;
  // Helper function to update the elapsed time of a task or subtask recursively
  function updateTask(tasks: Task[]): Task[] {
    return tasks.map((t) => {
      if (t.id === task.id) {
        // Update the elapsed time of the target task
        foundTarget = true;
        return { ...t, ...task };
      } else if (t.subTasks && t.subTasks.length > 0) {
        // Update the subtasks recursively if present
        return { ...t, subTasks: updateTask(t.subTasks) };
      }
      return t;
    });
  }

  // Create a new tree by updating the elapsed time of the specified task
  const updatedTaskData = updateTask(taskData);

  if (!foundTarget) {
    updatedTaskData.push({ ...defaultTask, ...task });
    uniqId++;
  }

  return updatedTaskData;
}

export default App;
