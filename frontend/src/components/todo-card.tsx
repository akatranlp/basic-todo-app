import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { AlertModal } from "@/components/alert-modal";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export interface Todo {
  id: number;
  name: string;
  status: boolean;
}

export interface CreateTodo {
  name: string;
}

interface TodoCardProps {
  todo: Todo;
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { isPending: deleteIsPending, mutate: deleteTodo } = useMutation({
    mutationKey: ["todos"],
    mutationFn: async () => {
      const promise = axios.delete(`/api/v1/todos/${todo.id}`);
      toast.promise(promise, {
        error: "Something went wrong!",
        loading: "Try to delete Todo...",
        success: "Todo was deleted!",
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const {
    isPending: updateIsPending,
    mutate: updateTodo,
    variables,
  } = useMutation({
    mutationKey: ["todos"],
    mutationFn: async (status: boolean) => {
      const promise = axios.put(`/api/v1/todos/${todo.id}`, { status });
      const promises = Promise.all([new Promise((res) => setTimeout(res, 1000)), promise]);
      toast.promise(promise, {
        error: "Something went wrong!",
        loading: "Try to update Todo...",
        success: "Todo was updated!",
      });
      return promises;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  if (updateIsPending && variables != undefined) {
    todo.status = variables;
  }

  return (
    <div>
      <AlertModal loading={deleteIsPending} onConfirm={() => deleteTodo()} isOpen={open} onClose={() => setOpen(false)} />
      {deleteIsPending ? null : (
        <>
          <Card className="p-0">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div
                  onClick={() => !updateIsPending && updateTodo(!todo.status)}
                  className={cn("text-ellipsis overflow-hidden whitespace-nowrap", !todo.status && "line-through")}
                >
                  {todo.name}
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setOpen(true)}
                  disabled={deleteIsPending || updateIsPending || todo.id === Number.MAX_VALUE}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
