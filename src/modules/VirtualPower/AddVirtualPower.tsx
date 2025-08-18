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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LoaderCircle,
  UserCircle2,
  TrendingUp,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { post } from "@/services/apiService";
import Validate from "@/lib/Handlevalidation";
import {
  powerPositionOptions,
  statusTypeOptions,
  powerTypeOptions,
} from "@/config/data";
import clsx from "clsx";

interface AddVirtualPowerProps {
  open: boolean;
  onClose: () => void;
  member: {
    id: number;
    memberName: string;
    memberUsername: string;
  } | null;
}

// Zod schema
const virtualPowerSchema = z.object({
  memberId: z.union([
    z.string().min(1, "Member ID is required"),
    z.number().min(1, "Member ID is required"),
  ]),
  statusType: z.string().min(1, "Status type is required"),
  powerPosition: z.string().min(1, "Power position is required"),
  powerType: z.string().min(1, "Power type is required"),
  powerCount: z.coerce
    .number({
      invalid_type_error: "Power count must be a number",
    })
    .int("Power count must be an integer")
    .min(1, "Power count must be at least 1")
    .max(9_000_000, "Power count cannot exceed 9,000,000"),
});

type VirtualPowerFormInputs = z.infer<typeof virtualPowerSchema>;

const AddVirtualPower = ({ open, onClose, member }: AddVirtualPowerProps) => {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<VirtualPowerFormInputs>({
    resolver: zodResolver(virtualPowerSchema),
    defaultValues: {
      memberId: "",
      statusType: "",
      powerPosition: "",
      powerType: "",
      powerCount: 1,
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (member) {
      setValue("memberId", member.id);
    }
  }, [member, setValue]);

  const mutation = useMutation({
    mutationFn: (data: VirtualPowerFormInputs) => post("/virtual-power", data),
    onSuccess: () => {
      toast.success("Virtual power added successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error?.message || "Failed to add virtual power");
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Add Virtual Power
          </DialogTitle>
          {member && (
            <div className="text-sm text-muted-foreground">
              Member:{" "}
              <span className="font-medium text-blue-600">
                {member.memberName}
              </span>{" "}
              | Username:{" "}
              <span className="text-foreground">{member.memberUsername}</span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 mt-4">
          {/* Username - display only */}
          {member && (
            <div className="grid gap-2">
              <Label>Member Username</Label>
              <div className="relative w-full">
                <Input
                  value={member.memberUsername}
                  disabled
                  className="w-full pl-10"
                />
                <UserCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
            </div>
          )}

          {/* Status Type */}
          <div className="grid gap-2 relative">
            <Label>Status Type</Label>
            <div className="relative">
              <Controller
                name="statusType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select status type" />
                    </SelectTrigger>
                    <SelectContent portal={false}>
                      {statusTypeOptions.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            {errors.statusType && (
              <span className="text-red-500 text-xs">
                {errors.statusType.message}
              </span>
            )}
          </div>

          {/* Power Position */}
          <div className="grid gap-2 relative">
            <Label>Power Position</Label>
            <div className="relative">
              <Controller
                name="powerPosition"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select power position" />
                    </SelectTrigger>
                    <SelectContent portal={false}>
                      {powerPositionOptions.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            {errors.powerPosition && (
              <span className="text-red-500 text-xs">
                {errors.powerPosition.message}
              </span>
            )}
          </div>

          {/* Power Type */}
          <div className="grid gap-2 relative">
            <Label>Power Type</Label>
            <div className="relative">
              <Controller
                name="powerType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select power type" />
                    </SelectTrigger>
                    <SelectContent portal={false}>
                      {powerTypeOptions.map(({ label, value }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            {errors.powerType && (
              <span className="text-red-500 text-xs">
                {errors.powerType.message}
              </span>
            )}
          </div>
          {/* Power Count */}
          <div className="grid gap-2 relative">
            <Label>Power</Label>
            <div className="relative">
              <Controller
                name="powerCount"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={1}
                    max={9000000}
                    {...field}
                    className="pl-10"
                    placeholder="Enter Number of Powers"
                  />
                )}
              />
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            {errors.powerCount && (
              <span className="text-red-500 text-xs">
                {errors.powerCount.message}
              </span>
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
                  <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
                  Submitting...
                </>
              ) : (
                "Add Power"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVirtualPower;
