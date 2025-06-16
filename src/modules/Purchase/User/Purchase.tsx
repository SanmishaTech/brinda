import React, { useEffect, useState } from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Validate from "@/lib/Handlevalidation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle, Trash2, PlusCircle } from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post, put } from "@/services/apiService";
import { set } from "date-fns";
import PurchaseHistoryList from "./PurchaseHistoryList";

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
  rate: decimalString("Rate", 10, 2),
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
  // totalAmountWithoutGst: decimalString("Total Amount Without GST", 10, 2),
  // totalAmountWithGst: decimalString("Total Amount With GST", 10, 2),
  // totalGstAmount: decimalString("Total GST Amount", 10, 2),
  // totalProductPV: decimalString("Total PV", 10, 2),
  purchaseDetails: z
    .array(purchaseDetailSchema)
    .min(1, "At least one purchase detail is required."),
});

type FormInputs = z.infer<typeof FormSchema>;

const Purchase = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues = {
    // totalAmountWithoutGst: "",
    // totalAmountWithGst: "",
    // totalGstAmount: "",
    // totalProductPV: "",
    purchaseDetails: [
      {
        productId: "",
        quantity: "",
        rate: "",
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
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaultValues, // Use default values in create mode
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseDetails", // Name of the array in the form schema
  });
  const watchedDetails = useWatch({ control, name: "purchaseDetails" });

  // Fetch wallet balance using React Query
  const { data: walletBalance, isLoading: isWalletBalanceLoading } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const response = await get("/wallet-transactions/wallet-amount");
      return response.walletBalance;
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch wallet balance";
      toast.error(errorMessage);
    },
  });

  // states
  const { data: memberState, isLoading: isMemberStateLoading } = useQuery({
    queryKey: ["memberState"],
    queryFn: async () => {
      const response = await get(`/states/member`);
      return response; // API returns the sector object directly
    },
  });

  // products
  const { data: products, isLoading: isAllProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await get(`/products/all`);
      return response; // API returns the sector object directly
    },
  });

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["purchases"]); // Refetch the users list
      toast.success("Products Purchased successfully");
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(
        error.response?.data?.message || "Failed to Purchase Product"
      );
    },
  });

  useEffect(() => {
    console.log("Form Errors", errors);
  }, [errors]);

  useEffect(() => {
    if (!watchedDetails) return;

    watchedDetails.forEach((detail, index) => {
      const qty = parseFloat(detail.quantity);
      const rate = parseFloat(detail.rate);
      const cgst = parseFloat(detail.cgstPercent);
      const sgst = parseFloat(detail.sgstPercent);
      const igst = parseFloat(detail.igstPercent);

      const selectedProduct = products?.find(
        (product) => String(product.id) === String(detail.productId)
      );

      if (!isNaN(qty) && !isNaN(rate)) {
        const amount = qty * rate;
        const newAmountWithoutGst = amount.toFixed(2);
        const cgstAmt = ((amount * cgst) / 100).toFixed(2);
        const sgstAmt = ((amount * sgst) / 100).toFixed(2);
        const igstAmt = ((amount * igst) / 100).toFixed(2);
        const totalGstAmt =
          parseFloat(cgstAmt) + parseFloat(sgstAmt) + parseFloat(igstAmt);
        const newAmountWithGst = (amount + totalGstAmt).toFixed(2);

        if (detail.amountWithoutGst !== newAmountWithoutGst) {
          setValue(
            `purchaseDetails.${index}.amountWithoutGst`,
            newAmountWithoutGst
          );
        }
        if (detail.cgstAmount !== cgstAmt) {
          setValue(`purchaseDetails.${index}.cgstAmount`, cgstAmt);
        }
        if (detail.sgstAmount !== sgstAmt) {
          setValue(`purchaseDetails.${index}.sgstAmount`, sgstAmt);
        }
        if (detail.igstAmount !== igstAmt) {
          setValue(`purchaseDetails.${index}.igstAmount`, igstAmt);
        }
        if (detail.amountWithGst !== newAmountWithGst) {
          setValue(`purchaseDetails.${index}.amountWithGst`, newAmountWithGst);
        }
      }

      if (selectedProduct && !isNaN(qty)) {
        const pvPerUnit = parseFloat(selectedProduct.pv);
        const totalPV = (qty * pvPerUnit).toFixed(2);

        if (detail.pvPerUnit !== pvPerUnit.toFixed(2)) {
          setValue(`purchaseDetails.${index}.pvPerUnit`, pvPerUnit.toFixed(2));
        }

        if (detail.totalPV !== totalPV) {
          setValue(`purchaseDetails.${index}.totalPV`, totalPV);
        }
      }
    });
  }, [watchedDetails, products]);

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

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    data.totalAmountWithoutGst = totals.totalWithoutGst;
    data.totalGstAmount = totals.totalGst;
    data.totalAmountWithGst = totals.totalWithGst;
    data.totalProductPV = totals.totalPV;

    if (walletBalance < parseFloat(data.totalAmountWithGst)) {
      toast.error("Insufficient wallet balance to complete the purchase.");
      return;
    }
    createMutation.mutate(data); // Trigger create mutation
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
                                    value
                                  );
                                  if (product) {
                                    const gst = parseFloat(product.gst);
                                    setValue(
                                      `purchaseDetails.${index}.rate`,
                                      product.mrp.toString()
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
                          <Input
                            type="number"
                            {...register(`purchaseDetails.${index}.quantity`)}
                            className=""
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
                          <input
                            type="hidden"
                            {...register(`purchaseDetails.${index}.rate`)}
                          />
                        </TableCell>

                        {/* Amount Without GST */}
                        <TableCell className="text-right">
                          ₹{" "}
                          {watch(`purchaseDetails.${index}.amountWithoutGst`) ||
                            "—"}
                          <input
                            type="hidden"
                            {...register(
                              `purchaseDetails.${index}.amountWithoutGst`
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
                          >
                            <Trash2 className="text-red-500" size={18} />
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

              {/* Totals */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm space-y-2">
                <div>Total Amount Without GST: ₹ {totals.totalWithoutGst}</div>
                <div>Total GST Amount: ₹ {totals.totalGst}</div>
                <div>Total Amount With GST: ₹ {totals.totalWithGst}</div>
                <div>Total Product PV: {totals.totalPV}</div>
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
