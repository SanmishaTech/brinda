import React, { useEffect, useState } from "react";
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
  productId: z.number().min(1, "Product ID is required."),
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
  totalAmountWithoutGst: decimalString("Total Amount Without GST", 10, 2),
  totalAmountWithGst: decimalString("Total Amount With GST", 10, 2),
  totalGstAmount: decimalString("Total GST Amount", 10, 2),
  totalProductPV: decimalString("Total PV", 10, 2),
  purchaseDetails: z
    .array(purchaseDetailSchema)
    .min(1, "At least one purchase detail is required."),
});

type FormInputs = z.infer<typeof FormSchema>;

const Purchase = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues = {
    totalAmountWithoutGst: "",
    totalAmountWithGst: "",
    totalGstAmount: "",
    totalProductPV: "",
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
    name: "productDetails", // Name of the array in the form schema
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
    const subscription = watch((value) => {
      const details = value.productDetails;

      details?.forEach((detail, index) => {
        const qty = parseFloat(detail.quantity);
        const rate = parseFloat(detail.rate);

        if (!isNaN(qty) && !isNaN(rate)) {
          const calculated = (qty * rate).toFixed(2);
          const current = watch(`productDetails.${index}.amountWithoutGst`);

          if (current !== calculated) {
            setValue(`productDetails.${index}.amountWithoutGst`, calculated);
          }
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="mx-auto mt-10 min-w-5xl">
          <CardContent className="pt-6">
            {/* start */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-8">
              Products
            </CardTitle>
            <div className="mt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount Without Gst</TableHead>
                    {memberState?.State === "Maharashtra" ? (
                      <>
                        <TableHead>CGST (%)</TableHead>
                        <TableHead>SGST (%)</TableHead>
                      </>
                    ) : (
                      <TableHead colSpan={2}>IGST (%)</TableHead>
                    )}

                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Controller
                          name={`productDetails.${index}.productId`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              key={field.value}
                              onValueChange={(value) => {
                                const selectedProduct = products?.find(
                                  (product) => String(product.id) === value
                                );

                                setValue(
                                  `productDetails.${index}.productId`,
                                  value
                                );

                                if (selectedProduct) {
                                  const gst = parseFloat(selectedProduct.gst); // e.g. 18

                                  setValue(
                                    `productDetails.${index}.rate`,
                                    selectedProduct.mrp.toString()
                                  );
                                  if (memberState?.State === "Maharashtra") {
                                    // Local state, split GST
                                    setValue(
                                      `productDetails.${index}.cgstPercent`,
                                      (gst / 2).toFixed(2)
                                    );
                                    setValue(
                                      `productDetails.${index}.sgstPercent`,
                                      (gst / 2).toFixed(2)
                                    );
                                    setValue(
                                      `productDetails.${index}.igstPercent`,
                                      "0.00"
                                    );
                                  } else {
                                    // Other state, full IGST
                                    setValue(
                                      `productDetails.${index}.cgstPercent`,
                                      "0.00"
                                    );
                                    setValue(
                                      `productDetails.${index}.sgstPercent`,
                                      "0.00"
                                    );
                                    setValue(
                                      `productDetails.${index}.igstPercent`,
                                      gst.toFixed(2)
                                    );
                                  }
                                }
                              }}
                              value={watch(`productDetails.${index}.productId`)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Product" />
                              </SelectTrigger>
                              <SelectContent>
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

                        {errors.productDetails?.[index]?.productId && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.productDetails[index]?.productId?.message}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <Input
                          {...register(`productDetails.${index}.quantity`)}
                          placeholder="Enter relation"
                        />
                        {errors.productDetails?.[index]?.quantity && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.productDetails[index]?.quantity?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Displayed read-only rate */}
                        <span>
                          ₹ {watch(`productDetails.${index}.rate`) || "—"}
                        </span>

                        {/* Hidden input so rate is submitted */}
                        <input
                          type="hidden"
                          {...register(`productDetails.${index}.rate`)}
                        />
                      </TableCell>

                      <TableCell>
                        <span>
                          ₹{" "}
                          {watch(`productDetails.${index}.amountWithoutGst`) ||
                            "—"}
                        </span>
                        <input
                          type="hidden"
                          {...register(
                            `productDetails.${index}.amountWithoutGst`
                          )}
                        />
                      </TableCell>
                      {memberState?.State === "Maharashtra" ? (
                        <>
                          <TableCell>
                            CGST:{" "}
                            {watch(`productDetails.${index}.cgstPercent`) ||
                              "—"}
                            %
                            <input
                              type="hidden"
                              {...register(
                                `productDetails.${index}.cgstPercent`
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            SGST:{" "}
                            {watch(`productDetails.${index}.sgstPercent`) ||
                              "—"}
                            %
                            <input
                              type="hidden"
                              {...register(
                                `productDetails.${index}.sgstPercent`
                              )}
                            />
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={2}>
                          IGST:{" "}
                          {watch(`productDetails.${index}.igstPercent`) || "—"}%
                          <input
                            type="hidden"
                            {...register(`productDetails.${index}.igstPercent`)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() =>
                  append({
                    productId: "",
                    quantity: "",
                    rate: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Product
              </Button>
            </div>
            {/* end */}
          </CardContent>

          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Clear
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[90px]">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : (
                "Pay"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </>
  );
};

export default Purchase;
