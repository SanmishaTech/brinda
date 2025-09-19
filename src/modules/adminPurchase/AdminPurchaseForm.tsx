import React, { useEffect } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from "react-hook-form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get, post, put } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Validate from "@/lib/Handlevalidation";
import { LoaderCircle, Trash2, PlusCircle } from "lucide-react";

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
    .int("Quantity must be an integer.")
    .min(1, "Quantity must be at least 1.")
    .max(9000, "Quantity must be at max 9000"),
  rate: decimalString("Rate", 10, 2),
  batchNumber: z
    .string()
    .min(1, "Batch Number is required")
    .max(50, "Batch Number should be less than 50 characters"),
  expiryDate: z.string().min(1, "Expiry Date is required"),
  netUnitRate: decimalString("Net Unit Rate", 10, 2),
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
  totalAmountWithoutGst: decimalString("Total Amount Without GST", 10, 2),
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
    adminPurchaseDetails: [
      {
        productId: "",
        quantity: 1,
        rate: "",
        batchNumber: "",
        expiryDate: "",
        netUnitRate: "",
        cgstPercent: "",
        sgstPercent: "",
        igstPercent: "",
        cgstAmount: "",
        sgstAmount: "",
        igstAmount: "",
        amountWithoutGst: "",
        amountWithGst: "",
      },
    ],
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

  const {
    fields: adminPurchaseDetailsFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "adminPurchaseDetails",
  });

  const { data: editAdminPurchaseData } = useQuery({
    queryKey: ["editAdminPurchaseData", id],
    queryFn: async () => {
      const response = await get(`/admin-purchases/${id}`);
      return response;
    },
    enabled: !!id && mode === "edit",
  });

  useEffect(() => {
    if (editAdminPurchaseData) {
      reset({
        invoiceNumber: editAdminPurchaseData?.invoiceNumber
          ? editAdminPurchaseData.invoiceNumber
          : "",
        invoiceDate: editAdminPurchaseData?.invoiceDate
          ? dayjs(editAdminPurchaseData.invoiceDate).format("YYYY-MM-DD")
          : "",
        purchaseDate: editAdminPurchaseData?.purchaseDate
          ? dayjs(editAdminPurchaseData.purchaseDate).format("YYYY-MM-DD")
          : "",
        receivedDate: editAdminPurchaseData?.receivedDate
          ? dayjs(editAdminPurchaseData.receivedDate).format("YYYY-MM-DD")
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
              productId: detail?.productId ? String(detail.productId) : "",
              quantity: detail?.quantity ? detail.quantity : "",
              rate: detail?.rate ? Number(detail.rate).toFixed(2) : "",
              batchNumber: detail?.batchNumber ? detail.batchNumber : "",
              expiryDate: detail?.expiryDate
                ? dayjs(detail.expiryDate).format("YYYY-MM-DD")
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

  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/admin-purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-purchases"]);
      toast.success("Admin Purchase created successfully");
      navigate("/adminPurchase");
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(
        error.response?.data?.message || "Failed to create Admin Purchase"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => put(`/admin-purchases/${id}`, data),
    onSuccess: () => {
      toast.success("Admin Purchase details updated successfully");
      queryClient.invalidateQueries(["admin-purchases"]);
      navigate("/adminPurchase");
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to update purchase");
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (mode === "create") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const onError = (errors: any) => {
    if (errors.adminPurchaseDetails?.message) {
      toast.error(errors.adminPurchaseDetails.message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* JSX Code for AdminPurchaseForm.tsx */}
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <Card className="mx-auto mt-10">
          <CardContent className="pt-6">
            {/* Invoice / Purchase Summary Details */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Purchase Invoice Details
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {/* Invoice Number */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="invoiceNumber"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Invoice Number <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="invoiceNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="invoiceNumber"
                      placeholder="Enter Invoice Number"
                      {...field}
                    />
                  )}
                />
                {errors.invoiceNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.invoiceNumber.message}
                  </p>
                )}
              </div>

              {/* Invoice Date */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="invoiceDate"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Invoice Date <span className="text-red-500">*</span>
                </Label>

                <Controller
                  name="invoiceDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="invoiceDate" type="date" {...field} />
                  )}
                />

                {errors.invoiceDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.invoiceDate.message}
                  </p>
                )}
              </div>

              {/* Purchase Date */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="purchaseDate"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Purchase Date <span className="text-red-500">*</span>
                </Label>

                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="purchaseDate" type="date" {...field} />
                  )}
                />

                {errors.purchaseDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.purchaseDate.message}
                  </p>
                )}
              </div>
              {/* Received Date */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="receivedDate"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Received Date <span className="text-red-500">*</span>
                </Label>

                <Controller
                  name="receivedDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="receivedDate" type="date" {...field} />
                  )}
                />

                {errors.receivedDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.receivedDate.message}
                  </p>
                )}
              </div>

              {/* Total Amount Without GST */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="totalAmountWithoutGst"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Total Amount Without GST{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="totalAmountWithoutGst"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="totalAmountWithoutGst"
                      type="number"
                      {...field}
                    />
                  )}
                />
                {errors.totalAmountWithoutGst && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.totalAmountWithoutGst.message}
                  </p>
                )}
              </div>

              {/* Total Amount With GST */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="totalAmountWithGst"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Total Amount With GST <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="totalAmountWithGst"
                  control={control}
                  render={({ field }) => (
                    <Input id="totalAmountWithGst" type="number" {...field} />
                  )}
                />
                {errors.totalAmountWithGst && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.totalAmountWithGst.message}
                  </p>
                )}
              </div>

              {/* Total GST Amount */}
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="totalGstAmount"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Total GST Amount <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="totalGstAmount"
                  control={control}
                  render={({ field }) => (
                    <Input id="totalGstAmount" type="number" {...field} />
                  )}
                />
                {errors.totalGstAmount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.totalGstAmount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Purchase Detail (single item explicit fields) */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-8">
              Purchase Details
            </CardTitle>
            <div className="mt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40 px-1">Product</TableHead>
                    <TableHead className="w-20 px-1">Qty</TableHead>
                    <TableHead className="w-20 px-1">Rate</TableHead>
                    <TableHead className="w-32 px-1">Batch No.</TableHead>
                    <TableHead className="w-32 px-1">Expiry</TableHead>
                    <TableHead className="w-20 px-1">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {adminPurchaseDetailsFields?.map((field, index) => (
                    <TableRow key={field.id}>
                      {/* ProductId */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`adminPurchaseDetails.${index}.productId`}
                          control={control}
                          render={() => (
                            <Select
                              onValueChange={(value) =>
                                setValue(
                                  `adminPurchaseDetails.${index}.productId`,
                                  value === "none" ? "" : value
                                )
                              }
                              value={
                                watch(
                                  `adminPurchaseDetails.${index}.productId`
                                ) || ""
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Select a product
                                </SelectItem>
                                {products?.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={String(product.id)}
                                  >
                                    {product.productName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.adminPurchaseDetails?.[index]?.productId && (
                          <p className="text-red-500 text-xs mt-1">
                            {
                              errors.adminPurchaseDetails[index]?.productId
                                ?.message
                            }
                          </p>
                        )}
                        {/* Net Unit Rate */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.netUnitRate`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Net Unit Rate{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.netUnitRate`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.netUnitRate`}
                                placeholder="0.00"
                                type="number"
                                className="w-full"
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]
                            ?.netUnitRate && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.netUnitRate
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* IGST % */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.igstPercent`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            IGST % <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.igstPercent`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.igstPercent`}
                                placeholder="0.00"
                                type="number"
                                className="w-full"
                                max={100}
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]
                            ?.igstPercent && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.igstPercent
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`adminPurchaseDetails.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              placeholder="0"
                              className="w-full"
                            />
                          )}
                        />
                        {errors.adminPurchaseDetails?.[index]?.quantity && (
                          <p className="text-red-500 text-xs">
                            {
                              errors.adminPurchaseDetails[index]?.quantity
                                ?.message
                            }
                          </p>
                        )}
                        {/* CGST % */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.cgstPercent`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            CGST % <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.cgstPercent`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.cgstPercent`}
                                placeholder="0.00"
                                className="w-full"
                                type="number"
                                max={100}
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]
                            ?.cgstPercent && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.cgstPercent
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* IGST Amount  */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.igstAmount`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            IGST Amount <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.igstAmount`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.igstAmount`}
                                placeholder="0.00"
                                type="number"
                                className="w-full"
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]?.igstAmount && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.igstAmount
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Rate */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`adminPurchaseDetails.${index}.rate`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="0.00"
                              type="number"
                              className="w-full"
                            />
                          )}
                        />
                        {errors.adminPurchaseDetails?.[index]?.rate && (
                          <p className="text-red-500 text-xs">
                            {errors.adminPurchaseDetails[index]?.rate?.message}
                          </p>
                        )}
                        {/* CGST Amount  */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.cgstAmount`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            CGST Amount <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.cgstAmount`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.cgstAmount`}
                                placeholder="0.00"
                                className="w-full"
                                type="number"
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]?.cgstAmount && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.cgstAmount
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* Amount Without GST  */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.amountWithoutGst`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Amount Without GST{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.amountWithoutGst`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.amountWithoutGst`}
                                placeholder="0.00"
                                type="number"
                                className="w-full"
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]
                            ?.amountWithoutGst && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]
                                  ?.amountWithoutGst?.message
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Batch Number */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`adminPurchaseDetails.${index}.batchNumber`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Batch #"
                              className="w-full"
                            />
                          )}
                        />
                        {errors.adminPurchaseDetails?.[index]?.batchNumber && (
                          <p className="text-red-500 text-xs">
                            {
                              errors.adminPurchaseDetails[index]?.batchNumber
                                ?.message
                            }
                          </p>
                        )}
                        {/* SGST % */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.sgstPercent`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            SGST % <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.sgstPercent`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.sgstPercent`}
                                placeholder="0.00"
                                className="w-full"
                                type="number"
                                max={100}
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]
                            ?.sgstPercent && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.sgstPercent
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* Amount With GST  */}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.amountWithGst`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Amount With GST{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.amountWithGst`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.amountWithGst`}
                                placeholder="0.00"
                                className="w-full"
                                type="number"
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]
                            ?.amountWithGst && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]
                                  ?.amountWithGst?.message
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Expiry Date */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`adminPurchaseDetails.${index}.expiryDate`}
                          control={control}
                          render={({ field: { onChange, value, ...rest } }) => (
                            <Input
                              {...rest}
                              type="month"
                              value={
                                value
                                  ? new Date(value)
                                      .toISOString()
                                      .substring(0, 7)
                                  : ""
                              }
                              onChange={(e) => {
                                const [year, month] = e.target.value.split("-");

                                // ✅ Get last day of the month
                                const lastDay = new Date(
                                  Date.UTC(Number(year), Number(month), 0)
                                ); // Note: month is 1-based

                                // ✅ Set time to 00:00:00.000 explicitly in UTC
                                lastDay.setUTCHours(0, 0, 0, 0);

                                // ✅ Pass final ISO string (UTC-safe) to onChange
                                onChange(lastDay.toISOString());
                              }}
                              className="w-full"
                              placeholder="MM/YYYY"
                            />
                          )}
                        />

                        {errors.adminPurchaseDetails?.[index]?.expiryDate && (
                          <p className="text-red-500 text-xs">
                            {
                              errors.adminPurchaseDetails[index]?.expiryDate
                                ?.message
                            }
                          </p>
                        )}
                        <div className="mt-2 align-top">
                          <Label
                            htmlFor={`adminPurchaseDetails.${index}.sgstAmount`}
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            SGST Amount <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name={`adminPurchaseDetails.${index}.sgstAmount`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`adminPurchaseDetails.${index}.sgstAmount`}
                                placeholder="0.00"
                                className="w-full"
                                type="number"
                              />
                            )}
                          />
                          {errors.adminPurchaseDetails?.[index]?.sgstAmount && (
                            <p className="text-red-500 text-xs">
                              {
                                errors.adminPurchaseDetails[index]?.sgstAmount
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Remove Button */}
                      <TableCell className="px-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={adminPurchaseDetailsFields.length === 1}
                        >
                          <Trash2
                            className={`${
                              adminPurchaseDetailsFields.length === 1
                                ? "text-gray-400"
                                : "text-red-500"
                            }`}
                            size={18}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Add Purchase Detail Button */}
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() =>
                  append({
                    productId: "",
                    quantity: 1,
                    rate: "",
                    batchNumber: "",
                    expiryDate: "",
                    netUnitRate: "",
                    cgstPercent: "",
                    sgstPercent: "",
                    igstPercent: "",
                    cgstAmount: "",
                    sgstAmount: "",
                    igstAmount: "",
                    amountWithoutGst: "",
                    amountWithGst: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Purchase Detail
              </Button>
            </div>
          </CardContent>

          {/* Submit / Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/adminPurchase")}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading} className="min-w-[90px]">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : mode === "create" ? (
                "Create Admin Purchase"
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
