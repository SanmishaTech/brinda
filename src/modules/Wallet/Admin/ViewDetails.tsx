import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react"; // already present

import React from "react";
import { Button, Input } from "@/components/ui";
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
import { put } from "@/services/apiService";
import { toast } from "sonner";
import { APPROVED, REJECTED } from "@/config/data";

interface ViewDetailsProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
}

// Zod schema for validation
const ApprovalSchema = z.object({
  status: z.string().min(1, "Status is required."),
  paymentMode: z.string().min(1, "Payment mode is required."),
  referenceNumber: z
    .string()
    .max(100, "Reference number must not exceed 100 characters."),
  notes: z.string().optional(),
});

type ApprovalInputs = z.infer<typeof ApprovalSchema>;

const ViewDetails: React.FC<ViewDetailsProps> = ({
  open,
  onClose,
  transaction,
}) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setError,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ApprovalInputs>({
    resolver: zodResolver(ApprovalSchema),
    defaultValues: {
      paymentMode: "",
      referenceNumber: "",
      notes: "",
      status: "", // <-- Added
    },
  });
  const selectedPaymentMode = watch("paymentMode");

  useEffect(() => {
    if (selectedPaymentMode === "Cash") {
      setValue("referenceNumber", ""); // Clear ref number when Cash selected
    }
  }, [selectedPaymentMode, setValue]);

  // Mutation for Approve API
  const approveMutation = useMutation({
    mutationFn: async (data: ApprovalInputs) => {
      await put(`/wallet-transactions/${transaction.id}`, {
        ...data,
      });
    },
    onSuccess: () => {
      toast.success("Transaction approved successfully!");
      queryClient.invalidateQueries("adminWalletTransactions"); // Refetch transactions
      onClose(); // Close the dialog
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to approve transaction";
      toast.error(errorMessage);
    },
  });

  const handleApprove = (data: ApprovalInputs) => {
    approveMutation.mutate(data);
  };

  const handleClose = () => {
    reset(); // Clears all form inputs
    onClose(); // Executes parent-provided close logic
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Transaction</DialogTitle>
          <p className="text-sm text-gray-500">
            Complete the details below to approve this pending transaction.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleApprove)} className="space-y-4">
          {/* Transaction Details */}
          <div className="bg-gray-100 p-3 rounded-md shadow-sm space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium">Transaction ID</span>
              <span className="font-semibold text-gray-800">
                {transaction?.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date</span>
              <span className="font-semibold text-gray-800">
                {new Date(transaction?.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type</span>
              <span
                className={`font-semibold ${
                  transaction?.type === "Debit"
                    ? "text-green-600"
                    : transaction?.type === "Credit"
                    ? "text-red-600"
                    : "text-gray-800"
                }`}
              >
                {transaction?.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount</span>
              <span className="font-semibold text-gray-800">
                ₹{parseFloat(transaction?.amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Separator */}
          <Separator />

          {/* Approval Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Approval Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMode">Payment Mode </Label>
                <Controller
                  name="paymentMode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Payment Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
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
              <div>
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={APPROVED}>{APPROVED}</SelectItem>
                        <SelectItem value={REJECTED}>{REJECTED}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={approveMutation.isLoading}
              //   className="bg-green-500 hover:bg-green-600 text-white"
            >
              {approveMutation.isLoading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetails;
