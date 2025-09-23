import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/services/apiService";
import { LoaderCircle } from "lucide-react";
import Validate from "@/lib/Handlevalidation";

// ----------------- Schema ------------------
const schema = z.object({
  memberId: z.union([z.string(), z.number()]),
  loanAmount: z
    .string()
    .regex(
      /^(?!0\d)\d+(\.\d+)?$/,
      "Amount must be a valid number without leading zeros"
    )
    .transform((val) => Number(val))
    .refine((val) => val >= 1, {
      message: "Amount must be at least 1",
    }),

  loanPercentage: z
    .string()
    .regex(
      /^(?!0\d)\d+(\.\d+)?$/,
      "Loan percentage must be a valid number without leading zeros"
    )
    .transform((val) => Number(val))
    .refine((val) => val >= 1, {
      message: "Loan percentage must be at least 1",
    }),
});

type FormInputs = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  member: {
    id: number;
    memberName: string;
    memberUsername: string;
  } | null;
}

// ---------------- Component ----------------
const AddLoanDialog = ({ open, onClose, member }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberId: "",
      loanAmount: 0,
      loanPercentage: 0,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (member?.id) {
      setValue("memberId", member.id);
    }
  }, [member, setValue]);

  const mutation = useMutation({
    mutationFn: (data: FormInputs) => post("/loan/add", data),
    onSuccess: () => {
      toast.success("Loan added successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      Validate(err, setError);
      toast.error(err?.message || "Failed to add loan");
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">
            Give Advance To Member.
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Member:{" "}
            <span className="font-medium text-blue-600">
              {member?.memberName}
            </span>{" "}
            | Username:{" "}
            <span className="text-foreground">{member?.memberUsername}</span>
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 mt-4">
          {/* Amount Field */}
          <div className="grid gap-2">
            <Label>Loan Amount</Label>
            <Controller
              name="loanAmount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter loan amount"
                  min={1}
                />
              )}
            />
            {errors.loanAmount && (
              <p className="text-xs text-red-500">
                {errors.loanAmount.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Loan Percentage %</Label>
            <Controller
              name="loanPercentage"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter loan %"
                  min={1}
                  max={100}
                />
              )}
            />
            {errors.loanPercentage && (
              <p className="text-xs text-red-500">
                {errors.loanPercentage.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLoanDialog;
