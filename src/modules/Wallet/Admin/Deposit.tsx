import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button, Input } from "@/components/ui";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatter.js";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/services/apiService";
import { toast } from "sonner";
import { ArrowUpCircle } from "lucide-react";

interface DepositProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  currentBalance: number;
  memberId: string; // Assuming memberId is passed as a prop
}
const decimalString = (
  fieldName: string,
  maxDigits: number,
  decimalPlaces: number
) =>
  z
    .string()
    .nonempty(`${fieldName} is required.`)
    .refine(
      (val) => {
        const regex = new RegExp(
          `^\\d{1,${maxDigits - decimalPlaces}}(\\.\\d{1,${decimalPlaces}})?$`
        );
        return regex.test(val);
      },
      {
        message: `${fieldName} must be a valid number with up to ${decimalPlaces} decimal places.`,
      }
    );

// Zod schema for validation
const DepositSchema = z.object({
  amountToCredit: decimalString("Amount", 10, 2),

  paymentMode: z.string().min(1, "Payment method is required."),
  referenceNumber: z
    .string()
    .max(100, "Reference number must not exceed 100 characters.")
    .optional(),
  notes: z.string().optional(),
});

type DepositInputs = z.infer<typeof DepositSchema>;

const Deposit: React.FC<DepositProps> = ({
  open,
  onClose,
  memberName,
  currentBalance,
  memberId,
}) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DepositInputs>({
    resolver: zodResolver(DepositSchema),
    defaultValues: {
      amountToCredit: "",
      paymentMode: "",
      referenceNumber: "",
      notes: "",
    },
  });
  const selectedPaymentMode = watch("paymentMode");

  useEffect(() => {
    if (selectedPaymentMode === "Cash") {
      setValue("referenceNumber", ""); // Clear ref number when Cash selected
    }
  }, [selectedPaymentMode, setValue]);

  // Mutation for crediting wallet
  const creditWalletMutation = useMutation({
    mutationFn: async (data: DepositInputs) => {
      await post(`/wallet-transactions/deposit/${memberId}`, {
        ...data,
        memberName,
      });
    },
    onSuccess: () => {
      toast.success("Funds credited successfully!");
      reset();
      queryClient.invalidateQueries("adminWalletTransactions"); // Refetch transactions
      onClose(); // Close the dialog
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to credit funds";
      toast.error(errorMessage);
    },
  });

  const handleCreditWallet = (data: DepositInputs) => {
    creditWalletMutation.mutate(data);
  };

  const handleClose = () => {
    reset(); // Clears all form inputs
    onClose(); // Executes parent-provided close logic
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 text-green-500" />
            Add Funds To Wallet
          </DialogTitle>
          <p className="text-sm text-gray-500">
            For <span className="font-bold">{memberName}</span> | Current
            Balance: {formatCurrency(currentBalance)}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleCreditWallet)} className="space-y-4">
          <Separator />

          {/* Amount to Credit */}
          <div>
            <Label htmlFor="amountToCredit">Amount to Credit</Label>
            <Controller
              name="amountToCredit"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  id="amountToCredit"
                  {...field}
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full mt-1"
                />
              )}
            />
            {errors.amountToCredit && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amountToCredit.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMode">Payment Method</Label>
            <Controller
              name="paymentMode"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paymentMode.message}
              </p>
            )}
          </div>

          {(selectedPaymentMode === "Bank Transfer" ||
            selectedPaymentMode === "UPI") && (
            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Controller
                name="referenceNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    id="referenceNumber"
                    {...field}
                    placeholder="Enter reference number"
                    className="w-full mt-1"
                  />
                )}
              />
              {errors.referenceNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.referenceNumber.message}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="notes"
                  {...field}
                  placeholder="Enter notes"
                  className="w-full mt-1"
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={creditWalletMutation.isLoading}
            >
              {creditWalletMutation.isLoading ? "Loading..." : "Debit Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Deposit;
