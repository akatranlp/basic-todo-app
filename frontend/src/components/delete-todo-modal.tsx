import { Modal } from "@/components/ui/modal";
import { useDeleteTodoModal } from "@/hooks/use-delete-todo-modal";

export const DeleteTodoModal = () => {
  const isOpen = useDeleteTodoModal((state) => state.isOpen);
  const onClose = useDeleteTodoModal((state) => state.onClose);

  return <Modal title="Delete Todo" description="Do you really want to Delete this Todo?" isOpen={isOpen} onClose={onClose}></Modal>;
};
