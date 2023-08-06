import { Timer } from "./components/Timer";

function App() {
  return (
    <>
      <h1 className="text-9xl font-bold">
        <Timer start={new Date()} />
      </h1>
    </>
  );
}

export default App;
