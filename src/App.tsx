import { HiPauseCircle, HiPlayCircle, HiStopCircle } from "react-icons/hi2";
import { calculateTotalElapsedTime } from "./utils/calculateTotalElapsedTime";
import { calculateTimeDifference } from "./utils/calculateTimeDifference";
import { useEffect, useRef, useState } from "react";
import { Task } from "./types/core";

const taskData = [
  {
    task: "Main Task 1",
    elapsedTime: 3600, // 1 hour (3600 seconds)
    id: 0,
    subTasks: [
      {
        task: "Subtask 1",
        id: 1,
        elapsedTime: 1800, // 30 minutes (1800 seconds)
      },
      {
        task: "Subtask 2",
        id: 2,
        elapsedTime: 900, // 15 minutes (900 seconds)
      },
    ],
  },
  {
    task: "Main Task 2",
    id: 3,
    elapsedTime: 3600, // 1 hour (3600 seconds)
    subTasks: [],
  },
];

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
              <tr className="hover:bg-slate-200">
                <td className="p-4">{task.task}</td>
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
            ))}
          </tbody>
        </table>
        <div>
          {activeTask ? (
            <div className="text-2xl">
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

export default App;
