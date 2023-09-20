import { HiHome } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { formattedTime } from "./utils/formattedTime";
import { TaskWithOptionalId, db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

export const Search = () => {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("tasks");
  const tasks = useLiveQuery(async () => {
    const collection = type === "tasks" ? db.tasks : db.logs;
    if (query)
      return await collection
        .where("name")
        .startsWith(query)
        .limit(50)
        .toArray();
    return await collection.limit(50).toArray();
  }, [query, type]);

  useEffect(() => {
    const DEBOUNCE_DELAY = 500;
    const timerId = setTimeout(() => {
      setQuery(debouncedQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timerId);
  }, [debouncedQuery]);

  return (
    <div>
      <div className="flex">
        <Link className="m-2 text-2xl flex items-center" to={"/"}>
          <HiHome className="inline-block me-1" />
          Home
        </Link>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded bg-blue-500 text-white px-2 py-1 m-1 text-xs select-none cursor-pointer whitespace-nowrap"
        >
          <option value="tasks">Tasks</option>
          <option value="logs">Logs</option>
        </select>
      </div>
      <div>
        <input
          type="text"
          className="shadow appearance-none border m-auto block rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Search your tasks..."
          required
          value={debouncedQuery}
          onChange={(e) => setDebouncedQuery(e.target.value)}
        />
      </div>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-4 text-left w-3/6">Task</th>
            <th className="p-4 text-left w-1/6">Time spent</th>
          </tr>
        </thead>
        <tbody>
          {tasks?.map((task) => (
            <TaskCell key={task.id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TaskCell = ({ task }: { task: TaskWithOptionalId }) => {
  return (
    <tr className="hover:bg-slate-200 border-2">
      <td className="p-4 w-3/6">{task.name}</td>
      <td className="p-4 w-1/6">{formattedTime(task.elapsedTime)}</td>
    </tr>
  );
};
