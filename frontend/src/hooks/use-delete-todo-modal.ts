import { create } from "zustand";

interface useDeleteTodoModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useDeleteTodoModal = create<useDeleteTodoModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
