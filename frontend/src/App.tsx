import React from "react";
import { ModeToggle } from "@/components/mode-toggle";

const App: React.FC<{}> = () => {
  return (
    <div>
      <div>
        <ModeToggle />
      </div>
      <div>Hello, World!</div>
    </div>
  );
};

export default App;
