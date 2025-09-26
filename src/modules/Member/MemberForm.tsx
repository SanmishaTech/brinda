import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Validate from "@/lib/Handlevalidation";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { LoaderCircle, ChevronsUpDown, Check } from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post, put } from "@/services/apiService";
import { set } from "date-fns";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css"; // Import styles for the phone input
import { PasswordInput } from "@/components/ui/password-input";
import { accountTypeOptions, genderOptions } from "@/config/data";

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

export const FormSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be left blank.") // Ensuring minimum length of 2
    .max(100, "Name must not exceed 100 characters.")
    .refine((val) => /^[A-Za-z\s\u0900-\u097F]+$/.test(val), {
      message: "Name can only contain letters.",
    }),
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
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(50, "Password must not exceed 50 characters."),
  percentage: decimalString("Percentage", 5, 2),
  securityDepositPercentage: decimalString("securityDepositPercentage", 5, 2),

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

type FormInputs = z.infer<typeof FormSchema>;

const MemberForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openState, setOpenState] = useState<boolean>(false);

  const defaultValues: z.infer<typeof FormSchema> = {
    name: "",
    mobile: "",
    email: "",
    password: "",
    percentage: "",
    securityDepositPercentage: "",

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
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: mode === "create" ? defaultValues : undefined, // Use default values in create mode
    mode: "onChange", // 👈 triggers validation on each change
    reValidateMode: "onChange", // 👈 re-validate on every change
  });

  // states
  const { data: states, isLoading: isStatesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const response = await get(`/states/all`);
      return response;
    },
  });

  const { data: editMemberData, isLoading: editMemberLoading } = useQuery({
    queryKey: ["editMemberData", id],
    queryFn: async () => {
      const response = await get(`/members/${id}`);
      return response; // API returns the sector object directly
    },
    enabled: !!id && mode === "edit",
  });

  useEffect(() => {
    if (editMemberData) {
      reset({
        name: editMemberData?.memberName ? editMemberData?.memberName : "",
        email: editMemberData?.memberEmail ? editMemberData?.memberEmail : "",
        mobile: editMemberData?.memberMobile
          ? editMemberData?.memberMobile
          : "",
        password: editMemberData?.user?.password
          ? editMemberData?.user?.password
          : "",
        percentage: editMemberData?.percentage
          ? editMemberData?.percentage
          : "",
        securityDepositPercentage: editMemberData?.securityDepositPercentage
          ? editMemberData?.securityDepositPercentage
          : "",

        tPin: editMemberData?.tPin ? editMemberData.tPin : "",
        memberAddress: editMemberData?.memberAddress
          ? editMemberData.memberAddress
          : "",
        memberPincode: editMemberData?.memberPincode
          ? editMemberData.memberPincode.toString()
          : "",
        memberState: editMemberData?.memberState
          ? editMemberData.memberState
          : "",
        memberGender: editMemberData?.memberGender
          ? editMemberData.memberGender
          : "",
        panNumber: editMemberData?.panNumber ? editMemberData.panNumber : "",
        aadharNumber: editMemberData?.aadharNumber
          ? editMemberData.aadharNumber
          : "",
        bankName: editMemberData?.bankName ? editMemberData.bankName : "",
        memberDob: editMemberData?.memberDob
          ? new Date(editMemberData.memberDob).toISOString().split("T")[0]
          : "",
        bankAccountNumber: editMemberData?.bankAccountNumber
          ? editMemberData.bankAccountNumber
          : "",
        bankIfscCode: editMemberData?.bankIfscCode
          ? editMemberData.bankIfscCode
          : "",
        bankAccountType: editMemberData?.bankAccountType
          ? editMemberData.bankAccountType
          : "",
      });
    }
  }, [editMemberData, reset]);

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/members", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]); // Refetch the users list
      toast.success("Member created successfully");
      navigate("/members"); // Navigate to the hotels page after successful creation
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to create Member");
    },
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => put(`/members/${id}`, data),
    onSuccess: () => {
      toast.success("Member updated successfully");
      queryClient.invalidateQueries(["members"]);
      navigate("/members"); // Navigate to the hotels page after successful update
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to update Member");
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (mode === "create") {
      createMutation.mutate(data); // Trigger create mutation
    } else {
      updateMutation.mutate(data); // Trigger update mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* JSX Code for MemberForm.tsx */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="mx-auto mt-10">
          <CardContent className="pt-6">
            {/* Hotel Details */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Member Details
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Product Name */}
              <div className="">
                <Label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input id="name" placeholder="Enter Name" {...field} />
                  )}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  UserName
                </Label>
                <Input
                  id="username"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.memberUsername || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Email"
                      {...field}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="">
                <Label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mobile
                </Label>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="mobile"
                      maxLength={10}
                      placeholder="Enter mobile number"
                      {...field}
                    />
                  )}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tPin">T Pin</Label>
                <Controller
                  name="tPin"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      id="tPin"
                      required
                      maxLength={4}
                      disabled={isLoading}
                      aria-invalid={errors.tPin ? "true" : "false"}
                      {...field}
                    />
                  )}
                />
                {errors.tPin && (
                  <span className="text-red-500 text-sm">
                    {errors.tPin.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="Parent">Parent</Label>
                <Input
                  id="Parent"
                  type="text"
                  readOnly
                  className="bg-gray-200  dark:bg-gray-700 cursor-not-allowed"
                  value={editMemberData?.parent?.memberUsername || ""}
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
                  value={editMemberData?.sponsor?.memberUsername || ""}
                />
              </div>
              {/* <div>
                <Label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  UserName
                </Label>
                <Input
                  id="username"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.memberUsername || ""}
                  readOnly
                />
              </div> */}
              <div>
                <Label
                  htmlFor="position"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Position
                </Label>
                <Input
                  id="position"
                  value={editMemberData?.positionToParent || ""}
                  className="bg-gray-200 dark:bg-gray-700"
                  readOnly
                />
              </div>
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
              <div className="grid gap-2">
                <Label htmlFor="memberDob">Date of Birth</Label>
                <Controller
                  name="memberDob"
                  control={control}
                  render={({ field }) => (
                    <Input id="memberDob" type="date" {...field} />
                  )}
                />
                {errors.memberDob && (
                  <span className="text-red-500 text-sm">
                    {errors.memberDob.message}
                  </span>
                )}
              </div>
              <div>
                <Label
                  htmlFor="percentage"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Percentage <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="percentage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="percentage"
                      type="number"
                      step="0.01"
                      max={100}
                      placeholder="Enter Percentage"
                      {...field}
                    />
                  )}
                />

                {errors.percentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.percentage.message}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="securityDepositPercentage"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Security Deposit Percentage{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="securityDepositPercentage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="securityDepositPercentage"
                      type="number"
                      step="0.01"
                      max={100}
                      placeholder="Enter %"
                      {...field}
                    />
                  )}
                />

                {errors.securityDepositPercentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.securityDepositPercentage.message}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      id="password"
                      required
                      disabled={isLoading}
                      aria-invalid={errors.password ? "true" : "false"}
                      {...field}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <CardTitle className="mt-7 mb-2">Address Information</CardTitle>

            {/* display read Only values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="memberAddress">Address</Label>
                <Controller
                  name="memberAddress"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="memberAddress"
                      type="text"
                      placeholder="123 Street, City"
                      {...field}
                    />
                  )}
                />
                {errors.memberAddress && (
                  <span className="text-red-500 text-sm">
                    {errors.memberAddress.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="memberPincode">Pincode</Label>
                <Controller
                  name="memberPincode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="memberPincode"
                      type="text"
                      maxLength={6}
                      placeholder="Enter Pincode"
                      {...field}
                    />
                  )}
                />
                {errors.memberPincode && (
                  <span className="text-red-500 text-sm">
                    {errors.memberPincode.message}
                  </span>
                )}
              </div>
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

            <CardTitle className="mt-7 mb-2">Account Details</CardTitle>

            {/* display read Only values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Controller
                  name="panNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="panNumber"
                      type="text"
                      placeholder="Pan Number"
                      {...field}
                    />
                  )}
                />
                {errors.panNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.panNumber.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="aadharNumber">Aadhar Number</Label>
                <Controller
                  name="aadharNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="aadharNumber"
                      type="text"
                      maxLength={12}
                      placeholder="Aadhar Number"
                      {...field}
                    />
                  )}
                />
                {errors.aadharNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.aadharNumber.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Controller
                  name="bankName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="bankName"
                      type="text"
                      placeholder="Bank Name"
                      {...field}
                    />
                  )}
                />
                {errors.bankName && (
                  <span className="text-red-500 text-sm">
                    {errors.bankName.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Controller
                  name="bankAccountNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="bankAccountNumber"
                      type="text"
                      placeholder="Account Number"
                      {...field}
                    />
                  )}
                />
                {errors.bankAccountNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.bankAccountNumber.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bankIfscCode">IFSC Code</Label>
                <Controller
                  name="bankIfscCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="bankIfscCode"
                      type="text"
                      placeholder="IFSC Code"
                      {...field}
                    />
                  )}
                />
                {errors.bankIfscCode && (
                  <span className="text-red-500 text-sm">
                    {errors.bankIfscCode.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bankAccountType">Account Type</Label>
                <Controller
                  name="bankAccountType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) =>
                        setValue("bankAccountType", value)
                      }
                      value={field.value}
                    >
                      <SelectTrigger id="bankAccountType" className="w-full">
                        <SelectValue placeholder="Select Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.bankAccountType && (
                  <span className="text-red-500 text-sm">
                    {errors.bankAccountType.message}
                  </span>
                )}
              </div>
            </div>

            {/* display read only Values */}
          </CardContent>

          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/members")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[90px]">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : mode === "create" ? (
                "Create Member"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </>
  );
};

export default MemberForm;
