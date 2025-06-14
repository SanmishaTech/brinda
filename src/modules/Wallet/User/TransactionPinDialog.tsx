// components/dialogs/TransactionPinDialog.tsx
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const pinSchema = z.object({
  tPin: z
    .string()
    .length(4, "TPIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "TPIN must contain only digits"),
});

type TransactionPinDialogProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mutation: (tPin: string) => void | Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void; // <-- new prop for Cancel callback
};

export default function TransactionPinDialog({
  open,
  onOpenChange,
  mutation,
  isLoading = false,
  onCancel = () => {}, // Default to no-op if not provided
}: TransactionPinDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ tPin: string }>({
    resolver: zodResolver(pinSchema),
  });

  // onSubmit now async to await mutation
  const onSubmit = async (data: { tPin: string }) => {
    try {
      // Await the mutation call if it returns a Promise
      await mutation(data.tPin);
      // Only close dialog on success
      onOpenChange(false);
      reset();
    } catch (error) {
      // Do not close dialog on error
      // Optionally you can handle error here or in parent mutation's onError
      console.error("Transaction PIN verification failed", error);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        // Only allow closing if not loading
        if (!isLoading) {
          onOpenChange(isOpen);
        }
      }}
    >
      <AlertDialogContent>
        {/* Remove AlertDialogAction to avoid automatic closing */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              🔐 Enter Transaction PIN
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Confirm this transaction by entering your 4-digit secure PIN.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-2">
            <PasswordInput
              id="tPin"
              {...register("tPin")}
              required
              maxLength={4}
              disabled={isLoading}
              placeholder="Enter 4-digit PIN"
              aria-invalid={errors.tPin ? "true" : "false"}
            />
            {errors.tPin && (
              <p className="text-sm text-red-600 mt-1">{errors.tPin.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            {/* <AlertDialogCancel
              type="button"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </AlertDialogCancel> */}
            <AlertDialogCancel
              type="button"
              disabled={isLoading}
              onClick={() => {
                onOpenChange(false);
                if (onCancel) onCancel(); // notify parent
              }}
            >
              Cancel
            </AlertDialogCancel>

            {/* Use normal Button instead of AlertDialogAction to prevent auto close */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Confirm"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
