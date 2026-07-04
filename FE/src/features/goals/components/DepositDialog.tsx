import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeposit } from "../hooks/useGoals";

export function DepositDialog({ goal, open, onOpenChange }: any) {
  const [amount, setAmount] = useState("");
  const { mutate: deposit, isPending } = useDeposit();

  const handleDeposit = () => {
    deposit({ id: goal.id, amount: Number(amount) }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nạp tiền vào: {goal?.title}</DialogTitle>
        </DialogHeader>
        <Input 
          type="number" 
          placeholder="Số tiền nạp" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
        <DialogFooter>
          <Button onClick={handleDeposit} disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Xác nhận nạp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}