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

const adminPurchaseDetailSchema = z.object({
  productId: z.string().min(1, "Product Field is required."),
  quantity: z.coerce
    .number()
    .min(1, "Quantity must be at least 1.")
    .max(100, "Quantity must be at max 100"),
  rate: decimalString("Rate", 10, 2), // This is inclusive price per unit
  batchNumber: z
    .string()
    .min(1, "Batch Number is required")
    .max(50, "Batch Number should be less than 50 characters"),
  expiryDate: z.string().min(1, "Expiry Date is required"),
  netUnitRate: decimalString("Net Unit Rate", 10, 2), // without gst
  cgstPercent: decimalString("CGST Percent", 5, 2),
  sgstPercent: decimalString("SGST Percent", 5, 2),
  igstPercent: decimalString("IGST Percent", 5, 2),
  cgstAmount: decimalString("CGST Amount", 10, 2),
  sgstAmount: decimalString("SGST Amount", 10, 2),
  igstAmount: decimalString("IGST Amount", 10, 2),
  amountWithoutGst: decimalString("Amount Without GST", 10, 2),
  amountWithGst: decimalString("Amount With GST", 10, 2),
});

const FormSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, "Invoice Number is required")
    .max(50, "Invoice Number should be less than 50 characters"),
  invoiceDate: z.string().min(1, "Invoice Date is required"),
  purchaseDate: z.string().min(1, "Purchase Date is required"),
  receivedDate: z.string().min(1, "Received Date is required"),
  totalAmountWithoutGst: decimalString(" Total Amount Without GST", 10, 2),
  totalAmountWithGst: decimalString("Total Amount With GST", 10, 2),
  totalGstAmount: decimalString("Total GST Amount", 10, 2),
  adminPurchaseDetails: z
    .array(adminPurchaseDetailSchema)
    .min(1, "At least one purchase detail is required."),
});

type FormInputs = z.infer<typeof FormSchema>;

const AdminPurchaseForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    invoiceNumber: "",
    invoiceDate: "",
    purchaseDate: "",
    receivedDate: "",
    totalAmountWithoutGst: "",
    totalAmountWithGst: "",
    totalGstAmount: "",
    adminPurchaseDetails: [],
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

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await get(`/products/all`);
      return response;
    },
  });

  const { data: editAdminPurchaseData, isLoading: editAdminPurchaseLoading } =
    useQuery({
      queryKey: ["editAdminPurchaseData", id],
      queryFn: async () => {
        const response = await get(`/admin-purchases/${id}`);
        return response; // API returns the sector object directly
      },
      enabled: !!id && mode === "edit",
    });

  useEffect(() => {
    if (editAdminPurchaseData) {
      reset({
        invoiceNumber: editAdminPurchaseData?.invoiceNumber
          ? editAdminPurchaseData.invoiceNumber
          : "",
        // invoiceDate: editAdminPurchaseData.invoiceDate
        //   ? new Date(editAdminPurchaseData.invoiceDate)
        //       .toISOString()
        //       .split("T")[0]
        //   : "",
        invoiceDate: editAdminPurchaseData?.invoiceDate
          ? dayjs(editAdminPurchaseData.invoiceDate).format("DD/MM/YYYY")
          : "",
        purchaseDate: editAdminPurchaseData?.purchaseDate
          ? dayjs(editAdminPurchaseData.purchaseDate).format("DD/MM/YYYY")
          : "",
        receivedDate: editAdminPurchaseData?.receivedDate
          ? dayjs(editAdminPurchaseData.receivedDate).format("DD/MM/YYYY")
          : "",
        totalAmountWithoutGst: editAdminPurchaseData?.totalAmountWithoutGst
          ? Number(editAdminPurchaseData.totalAmountWithoutGst).toFixed(2)
          : "",
        totalAmountWithGst: editAdminPurchaseData?.totalAmountWithGst
          ? Number(editAdminPurchaseData.totalAmountWithGst).toFixed(2)
          : "",
        totalGstAmount: editAdminPurchaseData?.totalGstAmount
          ? Number(editAdminPurchaseData.totalGstAmount).toFixed(2)
          : "",
        adminPurchaseDetails: editAdminPurchaseData?.adminPurchaseDetails
          ? editAdminPurchaseData.adminPurchaseDetails.map((detail: any) => ({
              productId: detail?.productId ? detail.productId : "",
              quantity: detail?.quantity ? detail.quantity : "",
              rate: detail?.rate ? Number(detail.rate).toFixed(2) : "",
              batchNumber: detail?.batchNumber ? detail.batchNumber : "",
              expiryDate: detail?.expiryDate
                ? dayjs(detail.expiryDate).format("DD/MM/YYYY")
                : "",
              netUnitRate: detail?.netUnitRate
                ? Number(detail.netUnitRate).toFixed(2)
                : "",
              cgstPercent: detail?.cgstPercent
                ? Number(detail.cgstPercent).toFixed(2)
                : "",
              sgstPercent: detail?.sgstPercent
                ? Number(detail.sgstPercent).toFixed(2)
                : "",
              igstPercent: detail?.igstPercent
                ? Number(detail.igstPercent).toFixed(2)
                : "",
              cgstAmount: detail?.cgstAmount
                ? Number(detail.cgstAmount).toFixed(2)
                : "",
              sgstAmount: detail?.sgstAmount
                ? Number(detail.sgstAmount).toFixed(2)
                : "",
              igstAmount: detail?.igstAmount
                ? Number(detail.igstAmount).toFixed(2)
                : "",
              amountWithoutGst: detail?.amountWithoutGst
                ? Number(detail.amountWithoutGst).toFixed(2)
                : "",
              amountWithGst: detail?.amountWithGst
                ? Number(detail.amountWithGst).toFixed(2)
                : "",
            }))
          : [],
      });
    }
  }, [editAdminPurchaseData, reset]);

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/admin-purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-purchases"]); // Refetch the users list
      toast.success("Admin Purchase created successfully");
      navigate("/adminPurchase"); // Navigate to the hotels page after successful creation
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(
        error.response?.data?.message || "Failed to create Admin Purchase"
      );
    },
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => put(`/admin-purchases/${id}`, data),
    onSuccess: () => {
      toast.success("Admin Purchase details updated successfully");
      queryClient.invalidateQueries(["admin-purchases"]);
      navigate("/adminPurchase"); // Navigate to the hotels page after successful update
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to update Product");
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // if (data.mobile && data.mobile.length <= 3) {
    //   data.mobile = ""; // Set the mobile to an empty string if only country code is entered
    // }
    if (mode === "create") {
      createMutation.mutate(data); // Trigger create mutation
    } else {
      updateMutation.mutate(data); // Trigger update mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* JSX Code for AdminPurchaseForm.tsx */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="mx-auto mt-10">
          <CardContent className="pt-6">
            {/* Hotel Details */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Product Details
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Product Name */}
              <div className="md:col-span-2">
                <Label
                  htmlFor="productName"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="productName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="productName"
                      placeholder="Enter product name"
                      {...field}
                    />
                  )}
                />

                {errors.productName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.productName.message}
                  </p>
                )}
              </div>
              <div className="">
                <Label
                  htmlFor="mrp"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  MRP <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="mrp"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      placeholder="MRP"
                      {...field}
                    />
                  )}
                />

                {errors.mrp && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mrp.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-5 my-3 gap-4">
                <div>
                  <Label
                    htmlFor="hsnCode"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    HSN Code <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="hsnCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="hsnCode"
                        type="number"
                        placeholder="HSN Code"
                        {...field}
                      />
                    )}
                  />

                  {errors.hsnCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.hsnCode.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="dspRate"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    DSP Rate<span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="dspRate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="dspRate"
                        type="number"
                        step="0.01"
                        placeholder="DSP Rate"
                        {...field}
                      />
                    )}
                  />

                  {errors.dspRate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dspRate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="mfgRate"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    MFG Rate <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="mfgRate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="mfgRate"
                        type="number"
                        step="0.01"
                        placeholder="MFG Rate"
                        {...field}
                      />
                    )}
                  />

                  {errors.mfgRate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.mfgRate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="gst"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    GST(%) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="gst"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="gst"
                        type="number"
                        step="0.01"
                        max={100}
                        placeholder="GST(%)"
                        {...field}
                      />
                    )}
                  />

                  {errors.gst && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.gst.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="pv"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    PV <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="pv"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="pv"
                        type="number"
                        step="0.01"
                        placeholder="PV"
                        {...field}
                      />
                    )}
                  />

                  {errors.pv && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pv.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="bv"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    BV <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="bv"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="bv"
                        type="number"
                        step="0.01"
                        placeholder="BV"
                        {...field}
                      />
                    )}
                  />

                  {errors.bv && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bv.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="bvPrice"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    BV Price <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="bvPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="bvPrice"
                        type="number"
                        step="0.01"
                        placeholder="BV Price"
                        {...field}
                      />
                    )}
                  />

                  {errors.bvPrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bvPrice.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[90px]">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : mode === "create" ? (
                "Create Product"
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

export default AdminPurchaseForm;
