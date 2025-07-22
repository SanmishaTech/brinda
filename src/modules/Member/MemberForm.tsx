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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Validate from "@/lib/Handlevalidation";

import { LoaderCircle } from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post, put } from "@/services/apiService";
import { set } from "date-fns";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css"; // Import styles for the phone input
import { PasswordInput } from "@/components/ui/password-input";

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
});

type FormInputs = z.infer<typeof FormSchema>;

const MemberForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    name: "",
    mobile: "",
    email: "",
    password: "",
    percentage: "",
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
              <div>
                <Label
                  htmlFor="tPin"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  T Pin
                </Label>
                <Controller
                  name="tPin"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      id="tPin"
                      required
                      disabled={isLoading}
                      value={editMemberData?.tPin || ""}
                      className="bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                      aria-invalid={errors.tPin ? "true" : "false"}
                      // {...field}
                    />
                  )}
                />
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
              <div>
                <Label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Gender
                </Label>
                <Input
                  id="gender"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.memberGender || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="dob"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={
                    editMemberData?.memberDob
                      ? dayjs(editMemberData.memberDob).format("YYYY-MM-DD")
                      : ""
                  }
                  readOnly
                />
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
              <div>
                <Label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address
                </Label>
                <Input
                  id="address"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.memberAddress || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="pincode"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.memberPincode || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  State
                </Label>
                <Input
                  id="state"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.memberState || ""}
                  readOnly
                />
              </div>
            </div>

            <CardTitle className="mt-7 mb-2">Account Details</CardTitle>

            {/* display read Only values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label
                  htmlFor="panNumber"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Pan Number
                </Label>
                <Input
                  id="panNumber"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.panNumber || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="aadharNumber"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Aadhar Number
                </Label>
                <Input
                  id="aadharNumber"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.aadharNumber || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="bankName"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.bankName || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="bankAccountNumber"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Account Number
                </Label>
                <Input
                  id="bankAccountNumber"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.bankAccountNumber || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="bankIfscCode"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  IFSC Code
                </Label>
                <Input
                  id="bankIfscCode"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.bankIfscCode || ""}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="bankAccountType"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Account Type
                </Label>
                <Input
                  id="bankAccountType"
                  className="bg-gray-200 dark:bg-gray-700"
                  value={editMemberData?.bankAccountType || ""}
                  readOnly
                />
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
