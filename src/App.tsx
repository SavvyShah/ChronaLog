import { HiPlayCircle } from "react-icons/hi2";

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
            <tr className="hover:bg-slate-200">
              <td className="p-4">Household: grocery</td>
              <td className="p-4">00:30:00</td>
              <td className="p-4">
                <HiPlayCircle className="hover:text-green-500 text-2xl" />
              </td>
            </tr>
            <tr className="hover:bg-slate-200">
              <td className="p-4">Work: Make a sales call</td>
              <td className="p-4">00:35:00</td>
              <td className="p-4">
                <HiPlayCircle className="hover:text-green-500 text-2xl" />
              </td>
            </tr>
            <tr className="hover:bg-slate-200">
              <td className="p-4">Read: Adventures of huckleberry finn</td>
              <td className="p-4">01:15:35</td>
              <td className="p-4">
                <HiPlayCircle className="hover:text-green-500 text-2xl" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
