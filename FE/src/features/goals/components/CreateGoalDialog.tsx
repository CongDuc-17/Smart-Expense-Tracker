import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateGoal } from "../hooks/useGoals";
import { useState } from "react";

export function CreateGoalDialog({ open, onOpenChange }: any) {
  const { mutate: createGoal } = useCreateGoal();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const handleSubmit = () => {
    createGoal({ title, targetAmount: Number(targetAmount) }, { 
      onSuccess: () => {
        onOpenChange(false);
        setTitle("");
        setTargetAmount("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tạo mục tiêu mới</DialogTitle></DialogHeader>
        <input placeholder="Tên mục tiêu" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Số tiền mục tiêu" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full p-2 border rounded" />
        <Button onClick={handleSubmit}>Tạo mục tiêu</Button>
      </DialogContent>
    </Dialog>
  );
}