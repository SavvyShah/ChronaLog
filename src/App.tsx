import { HiPauseCircle, HiPlayCircle } from "react-icons/hi2";
import { calculateTotalElapsedTime } from "./utils/calculateTotalElapsedTime";
import { calculateTimeDifference } from "./utils/calculateTimeDifference";
import { useState } from "react";
import { Task } from "./types/core";
import { Timer } from "./components/Timer";

const taskData = [
  {
    task: "Main Task 1",
    elapsedTime: 3600, // 1 hour (3600 seconds)
    subTasks: [
      {
        task: "Subtask 1",
        elapsedTime: 1800, // 30 minutes (1800 seconds)
      },
      {
        task: "Subtask 2",
        elapsedTime: 900, // 15 minutes (900 seconds)
      },
    ],
  },
  {
    task: "Main Task 2",
    elapsedTime: 3600, // 1 hour (3600 seconds)
    subTasks: [],
  },
];

function App() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [ticking, setTicking] = useState<boolean>(false);

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    setTicking(true);
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
            {taskData.map((task) => (
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
            <div>
              <div>Current: {activeTask.task}</div>
              <div>
                Stopwatch: <Timer active={ticking} />
              </div>
              <HiPauseCircle onClick={() => setTicking(false)} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
