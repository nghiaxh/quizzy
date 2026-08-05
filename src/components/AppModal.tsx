import { Button, Modal, useOverlayState } from "@heroui/react";
import type { ReactNode } from "react";

interface AppModalProps {
  onClose: () => void;
  children: ReactNode;
}

export default function AppModal({ onClose, children }: AppModalProps) {
  const state = useOverlayState({
    defaultOpen: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  return (
    <Modal.Root state={state}>
      <Button isDisabled className="hidden" />
      {children}
    </Modal.Root>
  );
}
