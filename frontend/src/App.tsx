import { z } from "zod";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "./components/ui/button";
import { TodoCard } from "@/components/todo-card";
import type { Todo, CreateTodo } from "@/components/todo-card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "./components/ui/input";
import { Separator } from "./components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";

const formSchema = z.object({ name: z.string().min(1) });

const App: React.FC<{}> = () => {
  const queryClient = useQueryClient();

  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const result = await axios.get<Todo[]>("/api/v1/todos");
      return result.data;
    },
  });

  const {
    isPending: addIsPending,
    variables: addVariables,
    mutate: addTodo,
  } = useMutation({
    mutationKey: ["todos"],
    mutationFn: async (todo: CreateTodo) => {
      const promise = axios.post(`/api/v1/todos`, todo);

      const promises = Promise.all([new Promise((res) => setTimeout(res, 1000)), promise]);

      toast.promise(promise, {
        error: "Something went wrong!",
        loading: "Try to add Todo...",
        success: "Todo was added!",
      });
      return promises;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.setValue("name", "");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addTodo(values);
  };

  if (isLoading || !todos) {
    return <div>Loading ...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  const newTodos = [...todos];

  if (addIsPending && addVariables) {
    newTodos.push({ name: addVariables.name, status: true, id: Number.MAX_VALUE });
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-[500px]">
        <div className="fixed top-2 right-2">
          <ModeToggle />
        </div>
        <h1 className="text-5xl mt-5 mb-3 w-full text-center">Todo List</h1>
        <div className="mt-5">
          <div className="flex flex-col gap-2">
            {newTodos.map((todo) => (
              <TodoCard todo={todo} key={todo.id} />
            ))}
          </div>
          <div>
            <Separator className="my-5" />
            <Card>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardHeader>
                    <CardTitle>Add a new Todo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" variant="default" disabled={addIsPending}>
                      Add new Todo
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
