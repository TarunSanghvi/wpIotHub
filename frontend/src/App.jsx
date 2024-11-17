import { useState } from "react";
import Header from "./components/header";
import ResponsiveGrid from "./components/responsive";

const App = () => {
  const [time, setTime] = useState("");
  return (
    <div>
      <Header time={time}/>
      <ResponsiveGrid setTime={setTime}/>
    </div>
  );
};

export default App;
