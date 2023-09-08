import {
  HiArrowLeft,
  HiChevronDoubleRight,
  HiDocument,
  HiPauseCircle,
  HiPlayCircle,
  HiPlus,
  HiStopCircle,
  HiTrash,
} from "react-icons/hi2";
import { formattedTime, formattedTimeHHMMSS } from "./utils/formattedTime";
import { useEffect, useRef, useState } from "react";
import { EditableInput } from "./components/EditableInput";
import {
  LogWithOptionalId,
  TaskWithOptionalId,
  createLog,
  createTask,
  deleteLog,
  deleteTask,
  updateLog,
  updateTask,
  useTask,
} from "./db";
import { Link, useParams } from "react-router-dom";
import { parseTimeToSeconds } from "./utils/parseTimeToSeconds";
import { Tags } from "./components/Tags";

function App() {
  const [ticking, setTicking] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<string>("");
  const [lastPaused, setLastPaused] = useState<Date>(new Date());
  const [showStopWatch, setShowStopwatch] = useState<boolean>(false);
  const [countSinceLastPause, setCountSinceLastPause] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { parentID } = useParams<{ parentID?: string }>();
  const parentTask = useTask(Number(parentID));
  const tasks = parentTask?.subTasks || [];
  const logs = parentTask?.logs || [];

  const totalCount = savedCount + countSinceLastPause;

  useEffect(() => {
    window.onbeforeunload = function () {
      return true;
    };
  }, []);

  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const diffMilliSecs = now.getTime() - lastPaused.getTime();
        const diffSecs = Math.floor(diffMilliSecs / 1000);
        setCountSinceLastPause(diffSecs);
      }, 1000);
    }
    if (!ticking) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [ticking, lastPaused]);

  const handleStartTask = () => {
    setTicking(true);
    setLastPaused(new Date());
    setCountSinceLastPause(0);
    setShowStopwatch(true);
  };

  const handleEndTask = async () => {
    if (parentID) {
      await createLog(
        {
          name: currentLog || "Untitled",
          elapsedTime: totalCount,
        },
        Number(parentID)
      );
    }
    setTicking(false);
    setShowStopwatch(false);
    setCurrentLog("");
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
              <th className="p-4 text-left w-3/6">Task</th>
              <th className="p-4 text-left w-1/6">Time spent</th>
              <th className="p-4 text-right w-2/6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map((task) => (
              <TaskCell key={task.id} task={task} />
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
          {showStopWatch ? null : (
            <button
              onClick={() => handleStartTask()}
              type="button"
              disabled={parentID ? false : true}
              style={{ opacity: parentID ? 1 : 0.5 }}
              className="m-2 flex items-center mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              <HiPlayCircle className="text-3xl me-1" /> Start Timer
            </button>
          )}
        </div>
        <div>
          {showStopWatch ? (
            <div className="text-2xl select-none">
              <div>Stopwatch: {formattedTimeHHMMSS(totalCount)}</div>
              <div>
                <input
                  type="text"
                  value={currentLog}
                  onChange={(e) => setCurrentLog(e.target.value)}
                  placeholder="Currently Doing..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                />
              </div>
              <div className="flex">
                {ticking ? (
                  <HiPauseCircle
                    className="p-1 text-5xl"
                    onClick={() => setTicking(false)}
                  />
                ) : (
                  <HiPlayCircle
                    className="p-1 text-5xl"
                    onClick={() => {
                      setSavedCount(totalCount);
                      setLastPaused(new Date());
                      setCountSinceLastPause(0);
                      setTicking(true);
                    }}
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

const TaskCell = ({ task }: { task: TaskWithOptionalId }) => {
  const [text, setText] = useState(task.name);

  return (
    <tr className="hover:bg-slate-200 border-2">
      <td className="p-4 w-3/6">
        <EditableInput
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onBlur={() => {
            if (task.id) updateTask(task.id, { name: text });
          }}
        />
      </td>
      <td className="p-4 w-1/6">{formattedTime(task.elapsedTime)}</td>
      <td className="p-4 w-2/6">
        <div className="flex w-full justify-end items-center">
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
  const timeString = formattedTimeHHMMSS(log.elapsedTime);
  const [timeElapsed, setTimeElapsed] = useState(timeString);

  return (
    <tr className="hover:bg-slate-200 border-2">
      <td className="p-4 w-2/5">
        <div className="w-full h-full flex items-center">
          <HiDocument className="m-2" />
          <EditableInput
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            onBlur={() => {
              if (log.id) {
                updateLog(log.id, { name: text });
              }
            }}
          />
        </div>
      </td>
      <td className="p-4 w-1/5">
        <EditableInput
          value={timeElapsed || timeString || ""}
          onChange={(e) => setTimeElapsed(e.target.value)}
          onBlur={(e) => {
            const elapsedTime = parseTimeToSeconds(e.target.value);
            if (log.id)
              updateLog(log.id, {
                elapsedTime,
              });
            setTimeElapsed("");
          }}
        />
      </td>
      <td className="p-4 w-1/5">
        <div className="flex items-center">
          {log?.id ? <Tags logId={log.id} /> : null}
          <div className="flex w-full justify-end items-center">
            <HiTrash
              onClick={() => log.id && deleteLog(log.id)}
              className="hover:text-rose-700 text-3xl me-1"
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default App;
