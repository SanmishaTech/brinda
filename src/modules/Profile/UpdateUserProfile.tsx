import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { post, get } from "@/services/apiService";
import { LoaderCircle, ChevronsUpDown, Check } from "lucide-react";
import Validate from "@/lib/Handlevalidation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PasswordInput } from "@/components/ui/password-input";
import { genderOptions } from "@/config/data";

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters."),
  email: z
    .string()
    .refine(
      (val) =>
        val === "" || val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      {
        message: "Email must be a valid email address.",
      }
    )
    .optional(),
  mobile: z
    .string()
    .optional()
    .refine((val) => val === "" || /^\d{10}$/.test(val), {
      message: "Mobile number must be exactly 10 digits.",
    }),
  tPin: z
    .string()
    .length(4, "T Pin must be exactly 4 digits.")
    .refine((val) => /^\d{4}$/.test(val), {
      message: "T Pin must contain only digits (0-9).",
    }),
  memberAddress: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .optional(),

  memberPincode: z.string().refine((val) => val === "" || /^\d{6}$/.test(val), {
    message: "Pincode must be of 6 digits.",
  }),
  memberState: z
    .string()
    .min(1, "State is required")
    .max(50, "State cannot exceed 50 characters"),
  memberGender: z.string().optional(),
  panNumber: z
    .string()
    .refine((val) => val === "" || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val), {
      message: "Invalid PAN number format. Example: ABCDE1234F",
    })
    .optional(),
  aadharNumber: z
    .string()
    .max(12, "Aadhar number must be 12 digits.")
    .refine((val) => val === "" || /^[2-9]{1}[0-9]{11}$/.test(val), {
      message:
        "Aadhar number must be exactly 12 digits and cannot start with 0 or 1.",
    })
    .optional(),
  bankName: z.string().optional(),
  memberDob: z.string().optional(),
  bankAccountNumber: z
    .string()
    .refine((val) => val === "" || /^[0-9]{9,18}$/.test(val), {
      message:
        "Invalid bank account number format. Must be between 9 and 18 digits.",
    })
    .optional(),
  bankIfscCode: z
    .string()
    .refine((val) => val === "" || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val), {
      message: "Invalid IFSC code format. Example: SBIN0001234",
    }),
  bankAccountType: z.string().optional(),
});

type UpdateProfileInputs = z.infer<typeof updateProfileSchema>;

const UpdateUserProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [openState, setOpenState] = useState<boolean>(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
    }
  }, []);

  const updateProfileDefaultValues: UpdateProfileInputs = {
    name: "",
    email: "",
    mobile: "",
    tPin: "",
    memberAddress: "",
    memberPincode: "",
    memberState: "",
    memberGender: "",
    panNumber: "",
    aadharNumber: "",
    bankName: "",
    memberDob: "", // format: YYYY-MM-DD
    bankAccountNumber: "",
    bankIfscCode: "",
    bankAccountType: "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInputs>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: updateProfileDefaultValues,
  });

  // states
  const { data: states, isLoading: isStatesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const response = await get(`/states/all`);
      return response;
    },
  });

  // Fetch user profile using useQuery
  const { data: userProfile, isLoading: isFetchingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await get(`/profile`);
      return response;
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile?.member?.memberName
          ? userProfile.member.memberName
          : "",
        email: userProfile?.member?.memberEmail
          ? userProfile.member.memberEmail
          : "",
        mobile: userProfile?.member?.memberMobile
          ? userProfile.member.memberMobile
          : "",
        tPin: userProfile?.member?.tPin ? userProfile.member.tPin : "",
        memberAddress: userProfile?.member?.memberAddress
          ? userProfile.member.memberAddress
          : "",
        memberPincode: userProfile?.member?.memberPincode
          ? userProfile.member.memberPincode.toString()
          : "",
        memberState: userProfile?.member?.memberState
          ? userProfile.member.memberState
          : "",
        memberGender: userProfile?.member?.memberGender
          ? userProfile.member.memberGender
          : "",
        panNumber: userProfile?.member?.panNumber
          ? userProfile.member.panNumber
          : "",
        aadharNumber: userProfile?.member?.aadharNumber
          ? userProfile.member.aadharNumber
          : "",
        bankName: userProfile?.member?.bankName
          ? userProfile.member.bankName
          : "",
        memberDob: userProfile?.member?.memberDob
          ? new Date(userProfile.member.memberDob).toISOString().split("T")[0]
          : "",
        bankAccountNumber: userProfile?.member?.bankAccountNumber
          ? userProfile.member.bankAccountNumber
          : "",
        bankIfscCode: userProfile?.member?.bankIfscCode
          ? userProfile.member.bankIfscCode
          : "",
        bankAccountType: userProfile?.member?.bankAccountType
          ? userProfile.member.bankAccountType
          : "",
      });
    }
  }, [userProfile, reset]);

  // Update profile using useMutation
  const mutation = useMutation({
    mutationFn: async (updatedData: UpdateProfileInputs) => {
      return await post(`/profile/user`, {
        id: userId,
        ...updatedData,
      });
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsedUser,
            name: data.name,
            email: data.email,
          })
        );
      }

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.message || "Failed to update profile");
    },
  });

  const onSubmit: SubmitHandler<UpdateProfileInputs> = async (data) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    mutation.mutate(data); // Trigger the mutation
  };

  return (
    <Card className="mx-auto mt-10">
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>
          Update your personal details and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
              />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="username"
                type="text"
                readOnly
                className="bg-gray-200  dark:bg-gray-700 cursor-not-allowed"
                value={userProfile?.member?.memberUsername || ""}
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Mobile */}
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="text"
                maxLength={10}
                placeholder="9876543210"
                {...register("mobile")}
              />
              {errors.mobile && (
                <span className="text-red-500 text-sm">
                  {errors.mobile.message}
                </span>
              )}
            </div>

            {/* T Pin */}
            <div className="grid gap-2">
              <Label htmlFor="tPin">T Pin</Label>
              <PasswordInput
                id="tPin"
                {...register("tPin")} // RHF validation triggers on change/blur
                required
                maxLength={4}
                disabled={isLoading}
                aria-invalid={errors.tPin ? "true" : "false"} // Accessibility
              />
              {errors.tPin && (
                <span className="text-red-500 text-sm">
                  {errors.tPin.message}
                </span>
              )}
            </div>

            {/* Parent */}

            <div className="grid gap-2">
              <Label htmlFor="Parent">Parent</Label>
              <Input
                id="Parent"
                type="text"
                readOnly
                className="bg-gray-200  dark:bg-gray-700 cursor-not-allowed"
                value={userProfile?.member?.parent?.memberUsername || ""}
              />
            </div>

            {/* Sponsor */}
            <div className="grid gap-2">
              <Label htmlFor="Sponsor">Sponsor</Label>
              <Input
                id="Sponsor"
                type="text"
                readOnly
                className="bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                value={userProfile?.member?.sponsor?.memberUsername || ""}
              />
            </div>

            {/* Position */}
            <div className="grid gap-2">
              <Label htmlFor="Position">Position</Label>
              <Input
                id="Position"
                type="text"
                readOnly
                className="bg-gray-200  dark:bg-gray-700 cursor-not-allowed"
                value={userProfile?.member?.positionToParent || ""}
              />
            </div>

            {/* <div className="grid gap-2">
              <Label htmlFor="memberGender">Gender</Label>
              <Input
                id="memberGender"
                type="text"
                placeholder="Male / Female / Other"
                {...register("memberGender")}
              />
              {errors.memberGender && (
                <span className="text-red-500 text-sm">
                  {errors.memberGender.message}
                </span>
              )}
            </div> */}
            {/* Gender */}
            <div className="grid gap-2">
              {" "}
              <Label htmlFor="memberGender">Gender</Label>
              <Controller
                name="memberGender"
                control={control}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    onValueChange={(value) => setValue("memberGender", value)}
                    value={watch("memberGender")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Date of Birth */}
            <div className="grid gap-2">
              <Label htmlFor="memberDob">Date of Birth</Label>
              <Input id="memberDob" type="date" {...register("memberDob")} />
              {errors.memberDob && (
                <span className="text-red-500 text-sm">
                  {errors.memberDob.message}
                </span>
              )}
            </div>
          </div>

          {/* <CardHeader> */}
          <CardTitle>Address Information</CardTitle>

          {/* </CardHeader> */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="memberAddress">Address</Label>
              <Input
                id="memberAddress"
                type="text"
                placeholder="123 Street, City"
                {...register("memberAddress")}
              />
              {errors.memberAddress && (
                <span className="text-red-500 text-sm">
                  {errors.memberAddress.message}
                </span>
              )}
            </div>

            {/* Pincode */}
            <div className="grid gap-2">
              <Label htmlFor="memberPincode">Pincode</Label>
              <Input
                id="memberPincode"
                type="text"
                maxLength={6}
                placeholder="Enter Pincode"
                {...register("memberPincode")}
              />
              {errors.memberPincode && (
                <span className="text-red-500 text-sm">
                  {errors.memberPincode.message}
                </span>
              )}
            </div>

            {/* State */}
            {/* <div className="grid gap-2">
              <Label htmlFor="memberState">State</Label>
              <Input
                id="memberState"
                type="text"
                placeholder="Karnataka"
                {...register("memberState")}
              />
              {errors.memberState && (
                <span className="text-red-500 text-sm">
                  {errors.memberState.message}
                </span>
              )}
            </div>
           */}
            <div className="grid gap-2">
              <Label htmlFor="memberState">State</Label>

              {/* <div className="w-full pt-1"> */}
              <Controller
                name="memberState"
                control={control}
                render={({ field }) => (
                  <Popover open={openState} onOpenChange={setOpenState}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openState}
                        className="w-[325px] justify-between mt-1"
                        onClick={() => setOpenState((prev) => !prev)}
                      >
                        {field.value
                          ? states.find((s) => s.value === field.value)?.label
                          : "Select State..."}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[325px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search state..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            {states?.map((state) => (
                              <CommandItem
                                key={state.value}
                                value={state.value}
                                onSelect={(currentValue) => {
                                  setValue("memberState", currentValue);
                                  setOpenState(false);
                                }}
                              >
                                {state.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    state.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />

              {/* </div> */}
              {errors.memberState && (
                <p className="text-destructive text-xs absolute -bottom-5">
                  {errors.memberState.message}
                </p>
              )}
            </div>
          </div>

          {/* <CardHeader> */}
          <CardTitle>Account Details</CardTitle>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* PAN Number */}
            <div className="grid gap-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                type="text"
                placeholder="Pan Number"
                {...register("panNumber")}
              />
              {errors.panNumber && (
                <span className="text-red-500 text-sm">
                  {errors.panNumber.message}
                </span>
              )}
            </div>

            {/* Aadhar Number */}
            <div className="grid gap-2">
              <Label htmlFor="aadharNumber">Aadhar Number</Label>
              <Input
                id="aadharNumber"
                type="text"
                maxLength={12}
                placeholder="Aadhar Number"
                {...register("aadharNumber")}
              />
              {errors.aadharNumber && (
                <span className="text-red-500 text-sm">
                  {errors.aadharNumber.message}
                </span>
              )}
            </div>

            {/* Bank Name */}
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="Bank Name"
                {...register("bankName")}
              />
              {errors.bankName && (
                <span className="text-red-500 text-sm">
                  {errors.bankName.message}
                </span>
              )}
            </div>

            {/* Bank Account Number */}
            <div className="grid gap-2">
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input
                id="bankAccountNumber"
                type="text"
                placeholder="Account Number"
                {...register("bankAccountNumber")}
              />
              {errors.bankAccountNumber && (
                <span className="text-red-500 text-sm">
                  {errors.bankAccountNumber.message}
                </span>
              )}
            </div>

            {/* Bank IFSC Code */}
            <div className="grid gap-2">
              <Label htmlFor="bankIfscCode">IFSC Code</Label>
              <Input
                id="bankIfscCode"
                type="text"
                placeholder="IFSC Code"
                {...register("bankIfscCode")}
              />
              {errors.bankIfscCode && (
                <span className="text-red-500 text-sm">
                  {errors.bankIfscCode.message}
                </span>
              )}
            </div>

            {/* Bank Account Type */}
            <div className="grid gap-2">
              <Label htmlFor="bankAccountType">Account Type</Label>
              <Input
                id="bankAccountType"
                type="text"
                placeholder="Savings / Current"
                {...register("bankAccountType")}
              />
              {errors.bankAccountType && (
                <span className="text-red-500 text-sm">
                  {errors.bankAccountType.message}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Make sure your information is accurate before saving.
        </p>
      </CardFooter>
    </Card>
  );
};

export default UpdateUserProfile;
