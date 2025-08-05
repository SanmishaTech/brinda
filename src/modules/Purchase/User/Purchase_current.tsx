import React, { useEffect } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { formatCurrency } from "@/lib/formatter.js";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Validate from "@/lib/Handlevalidation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post } from "@/services/apiService";
import { useState } from "react";
import CustomPagination from "@/components/common/custom-pagination";
import dayjs from "dayjs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FUND_WALLET, MATCHING_INCOME_WALLET } from "@/config/data";
import {
  Wallet,
  Loader2,
  CheckCircle,
  CheckCircle2,
  AtSign,
  User,
  Phone,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { APPROVED, PENDING, REJECTED, CREDIT, DEBIT } from "@/config/data";
import { formatDate, formatDateTime } from "@/lib/formatter.js";
import TransactionPinDialog from "./User/TransactionPinDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const purchaseDetailSchema = z.object({
  productId: z.string().min(1, "Product Field is required."),
  quantity: z.coerce
    .number()
    .min(1, "Quantity must be at least 1.")
    .max(100, "Quantity must be at max 100"),
  rate: decimalString("Rate", 10, 2), // This is inclusive price per unit
  netUnitRate: decimalString("Net Unit Rate", 10, 2), // without gst
  cgstPercent: decimalString("CGST Percent", 5, 2),
  sgstPercent: decimalString("SGST Percent", 5, 2),
  igstPercent: decimalString("IGST Percent", 5, 2),
  cgstAmount: decimalString("CGST Amount", 10, 2),
  sgstAmount: decimalString("SGST Amount", 10, 2),
  igstAmount: decimalString("IGST Amount", 10, 2),
  amountWithoutGst: decimalString("Amount Without GST", 10, 2),
  amountWithGst: decimalString("Amount With GST", 10, 2),
  pvPerUnit: decimalString("PV Per Unit", 10, 2),
  totalPV: decimalString("Total PV", 10, 2),
});

const FormSchema = z.object({
  purchaseDetails: z
    .array(purchaseDetailSchema)
    .min(1, "At least one purchase detail is required."),
});

type FormInputs = z.infer<typeof FormSchema>;

const Purchase = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues = {
    purchaseDetails: [
      {
        productId: "",
        quantity: "",
        rate: "",
        netUnitRate: "",
        cgstPercent: "",
        sgstPercent: "",
        igstPercent: "",
        cgstAmount: "",
        sgstAmount: "",
        igstAmount: "",
        amountWithoutGst: "",
        amountWithGst: "",
        pvPerUnit: "",
        totalPV: "",
      },
    ],
  };

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseDetails",
  });

  const watchedDetails = useWatch({ control, name: "purchaseDetails" });

  // Fetch wallet balance
  const { data: walletBalance, isLoading: isWalletDataLoading } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const response = await get("/wallet-transactions/wallet-amount");
      return response.walletBalance;
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch wallet balance"
      );
    },
  });

  // Fetch member state
  const { data: memberState } = useQuery({
    queryKey: ["memberState"],
    queryFn: async () => {
      const response = await get(`/states/member`);
      return response;
    },
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await get(`/products/all`);
      return response;
    },
  });

  // Mutation for creating purchase
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["purchases"]);
      toast.success(
        "Purchase successful. Please wait while the invoice is being generated."
      );
      navigate("/purchase/history");
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error?.message || "Failed to Purchase Product");
    },
  });

  useEffect(() => {
    if (!watchedDetails) return;

    watchedDetails.forEach((detail, index) => {
      // start
      // Normalize qty - if invalid, treat as 0
      const qty =
        isNaN(parseFloat(detail.quantity)) ||
        detail.quantity === undefined ||
        detail.quantity === null
          ? 0
          : parseFloat(detail.quantity);
      // const qty = parseFloat(String(detail.quantity));
      // end
      const rateInclusive = parseFloat(detail.rate); // Inclusive GST price per unit
      const cgst = parseFloat(detail.cgstPercent);
      const sgst = parseFloat(detail.sgstPercent);
      const igst = parseFloat(detail.igstPercent);

      const selectedProduct = products?.find(
        (product) => String(product.id) === String(detail.productId)
      );
      const round2 = (num: number) => num.toFixed(2);

      if (!isNaN(rateInclusive)) {
        const totalGstPercent = cgst + sgst + igst;
        const netUnitRate = rateInclusive / (1 + totalGstPercent / 100);

        if (detail.netUnitRate !== round2(netUnitRate)) {
          setValue(`purchaseDetails.${index}.netUnitRate`, round2(netUnitRate));
        }
      }

      if (!isNaN(qty) && !isNaN(rateInclusive)) {
        // Total amount (inclusive)
        const amountWithGst = qty * rateInclusive;

        // Total GST percent (sum of CGST, SGST, IGST)
        const totalGstPercent = cgst + sgst + igst;

        // Calculate amount without GST (inclusive price / (1 + GST%/100))
        const amountWithoutGst = amountWithGst / (1 + totalGstPercent / 100);

        // GST Amount = amountWithGst - amountWithoutGst
        const totalGstAmount = amountWithGst - amountWithoutGst;

        // Calculate each GST component amounts
        const cgstAmount = (amountWithoutGst * cgst) / 100;
        const sgstAmount = (amountWithoutGst * sgst) / 100;
        const igstAmount = (amountWithoutGst * igst) / 100;

        // Update form values if changed
        // const round2 = (num: number) => num.toFixed(2);

        if (detail.amountWithGst !== round2(amountWithGst)) {
          setValue(
            `purchaseDetails.${index}.amountWithGst`,
            round2(amountWithGst)
          );
        }
        if (detail.amountWithoutGst !== round2(amountWithoutGst)) {
          setValue(
            `purchaseDetails.${index}.amountWithoutGst`,
            round2(amountWithoutGst)
          );
        }
        if (detail.cgstAmount !== round2(cgstAmount)) {
          setValue(`purchaseDetails.${index}.cgstAmount`, round2(cgstAmount));
        }
        if (detail.sgstAmount !== round2(sgstAmount)) {
          setValue(`purchaseDetails.${index}.sgstAmount`, round2(sgstAmount));
        }
        if (detail.igstAmount !== round2(igstAmount)) {
          setValue(`purchaseDetails.${index}.igstAmount`, round2(igstAmount));
        }
      }

      // PV calculations
      if (selectedProduct && !isNaN(qty)) {
        const pvPerUnit = parseFloat(selectedProduct.pv);
        const totalPV = qty * pvPerUnit;

        const round2 = (num: number) => num.toFixed(2);

        if (detail.pvPerUnit !== round2(pvPerUnit)) {
          setValue(`purchaseDetails.${index}.pvPerUnit`, round2(pvPerUnit));
        }
        if (detail.totalPV !== round2(totalPV)) {
          setValue(`purchaseDetails.${index}.totalPV`, round2(totalPV));
        }
      }
    });
  }, [watchedDetails, products, setValue]);

  // Calculate totals
  const totals = React.useMemo(() => {
    let totalGst = 0;
    let totalWithGst = 0;
    let totalWithoutGst = 0;
    let totalPV = 0;

    if (!watchedDetails)
      return { totalGst, totalWithGst, totalWithoutGst, totalPV };

    watchedDetails.forEach((item) => {
      const cgstAmt = parseFloat(item.cgstAmount || "0");
      const sgstAmt = parseFloat(item.sgstAmount || "0");
      const igstAmt = parseFloat(item.igstAmount || "0");

      const amountWithGst = parseFloat(item.amountWithGst || "0");
      const amountWithoutGst = parseFloat(item.amountWithoutGst || "0");
      const totalPv = parseFloat(item.totalPV || "0");

      totalGst += cgstAmt + sgstAmt + igstAmt;
      totalWithGst += amountWithGst;
      totalWithoutGst += amountWithoutGst;
      totalPV += totalPv;
    });

    return {
      totalGst: totalGst.toFixed(2),
      totalWithGst: totalWithGst.toFixed(2),
      totalWithoutGst: totalWithoutGst.toFixed(2),
      totalPV: totalPV.toFixed(2),
    };
  }, [watchedDetails]);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // Add totals to data to submit if needed
    (data as any).totalAmountWithoutGst = totals.totalWithoutGst;
    (data as any).totalGstAmount = totals.totalGst;
    (data as any).totalAmountWithGst = totals.totalWithGst;
    (data as any).totalProductPV = totals.totalPV;

    if (walletBalance < parseFloat(totals.totalWithGst)) {
      toast.error("Insufficient wallet balance to complete the purchase.");
      return;
    }
    createMutation.mutate(data);
  };

  const isLoading = createMutation.isPending;
  return (
    <>
      {Object.entries(errors).map(([field, error]) => (
        <div key={field}>
          <p className="text-red-500 text-sm">
            {/* Accessing the error message for the field */}
            {error?.message}
          </p>
        </div>
      ))}

      {/* Wallet and Add Balance Boxes */}
      <div className=" grid grid-cols-1 mb-4 md:grid-cols-2 gap-6">
        {/* Wallet Balance Box */}
        <Card className="bg-green-100 h-52 border border-green-300 shadow-md dark:bg-card dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              Wallet Balance
            </CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isWalletDataLoading ? (
              <p className="text-lg font-bold text-green-700">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-green-700">
                {formatCurrency(walletBalance?.walletBalance)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Matching income wallet balance box */}
        <Card className="bg-green-100 border border-green-300 shadow-md dark:bg-card dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              Matching Income Wallet Balance
            </CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isWalletDataLoading ? (
              <p className="text-lg font-bold text-green-700">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-green-700">
                {formatCurrency(walletBalance?.matchingIncomeWalletBalance)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* JSX Code for HotelForm.tsx */}
      <div className="mt-2 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="mx-auto mt-6 w-full max-w-7xl shadow-md">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 ">
                    Purchase Products
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => navigate("/purchase/history")}
                    className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    View Purchase History
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader className="bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200">
                    <TableRow>
                      <TableHead className="min-w-[160px]">Product</TableHead>
                      <TableHead className="">Qty</TableHead>
                      <TableHead className="min-w-[80px] text-right">
                        Rate
                      </TableHead>
                      <TableHead className="min-w-[130px] text-right">
                        Amount (No GST)
                      </TableHead>
                      <TableHead className="w-20 text-center">GST%</TableHead>
                      <TableHead className="min-w-[130px] text-right">
                        Total (With GST)
                      </TableHead>
                      <TableHead className="w-24 text-center">
                        PV/Unit
                      </TableHead>
                      <TableHead className="w-24 text-center">
                        Total PV
                      </TableHead>
                      <TableHead className="w-12 text-center">Remove</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="text-sm">
                        {/* Product */}
                        <TableCell className="min-w-[160px] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                          <Controller
                            name={`purchaseDetails.${index}.productId`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  const product = products?.find(
                                    (p) => String(p.id) === value
                                  );
                                  setValue(
                                    `purchaseDetails.${index}.productId`,
                                    value,
                                    {
                                      shouldValidate: true,
                                      shouldTouch: true,
                                    }
                                  );
                                  if (product) {
                                    const gst = parseFloat(product.gst);
                                    setValue(
                                      `purchaseDetails.${index}.rate`,
                                      product.dspRate.toString()
                                    );
                                    if (memberState?.State === "Maharashtra") {
                                      setValue(
                                        `purchaseDetails.${index}.cgstPercent`,
                                        (gst / 2).toFixed(2)
                                      );
                                      setValue(
                                        `purchaseDetails.${index}.sgstPercent`,
                                        (gst / 2).toFixed(2)
                                      );
                                      setValue(
                                        `purchaseDetails.${index}.igstPercent`,
                                        "0.00"
                                      );
                                    } else {
                                      setValue(
                                        `purchaseDetails.${index}.igstPercent`,
                                        gst.toFixed(2)
                                      );
                                      setValue(
                                        `purchaseDetails.${index}.cgstPercent`,
                                        "0.00"
                                      );
                                      setValue(
                                        `purchaseDetails.${index}.sgstPercent`,
                                        "0.00"
                                      );
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="truncate w-full max-w-[180px]">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products?.map((p) => (
                                    <SelectItem
                                      key={p.id}
                                      value={String(p.id)}
                                      className="truncate"
                                    >
                                      {p.productName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.purchaseDetails?.[index]?.productId && (
                            <p className="text-red-500 text-xs mt-1">
                              {
                                errors.purchaseDetails[index]?.productId
                                  ?.message
                              }
                            </p>
                          )}
                        </TableCell>

                        {/* Quantity */}
                        <TableCell className="text-center">
                          <Controller
                            name={`purchaseDetails.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                className=""
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                          {errors.purchaseDetails?.[index]?.quantity && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.purchaseDetails[index]?.quantity?.message}
                            </p>
                          )}
                        </TableCell>

                        {/* Rate */}
                        <TableCell className="text-right">
                          ₹ {watch(`purchaseDetails.${index}.rate`) || "—"}
                          <Controller
                            name={`purchaseDetails.${index}.rate`}
                            control={control}
                            render={({ field }) => (
                              <input type="hidden" {...field} />
                            )}
                          />
                        </TableCell>

                        {/* Amount Without GST */}
                        <TableCell className="text-right">
                          ₹{" "}
                          {watch(`purchaseDetails.${index}.amountWithoutGst`) ||
                            "—"}
                          <Controller
                            name={`purchaseDetails.${index}.amountWithoutGst`}
                            control={control}
                            render={({ field }) => (
                              <input type="hidden" {...field} />
                            )}
                          />
                        </TableCell>

                        {/* GST Percent */}
                        <TableCell className="text-center">
                          {(() => {
                            const selectedProductId = watch(
                              `purchaseDetails.${index}.productId`
                            );
                            const selectedProduct = products?.find(
                              (p) => String(p.id) === String(selectedProductId)
                            );
                            return selectedProduct?.gst
                              ? `${selectedProduct.gst}%`
                              : "—";
                          })()}
                        </TableCell>

                        {/* With GST */}
                        <TableCell className="text-right">
                          ₹{" "}
                          {watch(`purchaseDetails.${index}.amountWithGst`) ||
                            "—"}
                        </TableCell>

                        {/* PV/unit and Total PV */}
                        <TableCell className="text-center">
                          {watch(`purchaseDetails.${index}.pvPerUnit`) || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {watch(`purchaseDetails.${index}.totalPV`) || "—"}
                        </TableCell>

                        {/* Delete Button */}
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2
                              className={`${
                                fields.length === 1
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
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-5 flex items-center gap-2"
                onClick={() =>
                  append({
                    productId: "",
                    quantity: "",
                    rate: "",
                  })
                }
              >
                <PlusCircle className="h-5 w-5" />
                Add Another Product
              </Button>

              <div className="flex justify-between w-full mt-6 gap-2">
                {/* Right Side: Totals */}
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full  ml-auto shadow-sm text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Total Amount Without GST:
                    </span>
                    <span>{formatCurrency(totals.totalWithoutGst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total GST Amount:</span>
                    <span>{formatCurrency(totals.totalGst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount With GST:</span>
                    <span className="font-semibold">
                      {formatCurrency(totals.totalWithGst)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Product PV:</span>
                    <span>{totals.totalPV}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="animate-spin h-4 w-4" />
                ) : (
                  " Purchase"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
};

export default Purchase;
