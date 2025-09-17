// components/MakeFranchise.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { post } from "@/services/apiService";
import { LoaderCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Validate from "@/lib/Handlevalidation";

interface Props {
  open: boolean;
  onClose: () => void;
  member: {
    id: number;
    memberUsername: string;
    memberName: string;
  } | null;
}

const schema = z.object({
  securityDepositAmount: z.coerce
    .number({
      invalid_type_error: "Security deposit must be a number",
    })
    .min(1, "Deposit must be greater than 0"),
  influencerId: z.string().min(1, "Influencer ID is required"),
});

type FormInputs = z.infer<typeof schema>;

const MakeFranchise = ({ open, onClose, member }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      securityDepositAmount: 0,
      influencerId: "",
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormInputs) =>
      post(`/franchise/add`, {
        ...data,
        memberId: member?.id,
      }),
    onSuccess: () => {
      toast.success("Franchise created successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      Validate(err, setError);
      toast.error(err?.message || "Failed to create franchise");
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!member) return;
    mutation.mutate(data);
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Make Franchise
          </DialogTitle>
          {member && (
            <p className="text-sm text-muted-foreground">
              For <strong>{member.memberUsername}</strong> ({member.memberName})
            </p>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Security Deposit */}
          <div className="grid gap-2">
            <Label>Security Deposit</Label>
            <Controller
              name="securityDepositAmount"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter amount"
                  {...field}
                />
              )}
            />
            {errors.securityDepositAmount && (
              <p className="text-xs text-red-500">
                {errors.securityDepositAmount.message}
              </p>
            )}
          </div>

          {/* Influencer ID */}
          <div className="grid gap-2">
            <Label>Influencer ID</Label>
            <Controller
              name="influencerId"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter influencer ID" {...field} />
              )}
            />
            {errors.influencerId && (
              <p className="text-xs text-red-500">
                {errors.influencerId.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Make Franchise"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeFranchise;
