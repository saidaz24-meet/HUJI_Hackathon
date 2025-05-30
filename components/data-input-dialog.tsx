"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DataInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    neededData?: string;
    status: string;
  } | null;
  onSubmit: (taskId: string, enteredData: string) => void;
}

export function DataInputDialog({
  isOpen,
  onClose,
  task,
  onSubmit,
}: DataInputDialogProps) {
  const [enteredData, setEnteredData] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEnteredData(""); // Clear input when dialog opens
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (task) {
      onSubmit(task.id, enteredData);
      setEnteredData(""); // Clear input after submission
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task?.neededData || "Provide Input"}</DialogTitle>
          <DialogDescription>
            Please enter the requested information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="data-input"
            value={enteredData}
            onChange={(e) => setEnteredData(e.target.value)}
            onKeyDown={handleKeyDown}
            className="col-span-3"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}