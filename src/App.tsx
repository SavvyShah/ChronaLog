import { HiPlayCircle } from "react-icons/hi2";
import { calculateTotalElapsedTime } from "./utils/calculateTotalElapsedTime";
import { calculateTimeDifference } from "./utils/calculateTimeDifference";

const taskData = [
  {
    task: "Main Task",
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
    task: "Main Task",
    elapsedTime: 3600, // 1 hour (3600 seconds)
    subTasks: [],
  },
];

function App() {
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
                  <HiPlayCircle className="hover:text-green-500 text-2xl" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
