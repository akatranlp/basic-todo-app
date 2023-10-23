import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { useQuery } from "@tanstack/react-query";

interface Todo {
  name: string;
  status: boolean;
}

const App: React.FC<{}> = () => {
  const { data, isLoading, isError, error } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const result = await fetch("/api/v1/todos");
      return result.json();
    },
  });

  if (isLoading || !data) {
    return <div>Loading ...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <div>
        <ModeToggle />
      </div>
      <div>
        {data.map((todo) => (
          <div>{JSON.stringify(todo)}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
