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
import { useNavigate } from "react-router-dom";
import { get, post } from "@/services/apiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Trash2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

// Schema Definition
const StockTransferDetailSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  batchNumber: z.string().min(1, "Batch is required."),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer.")
    .min(1, "Min 1")
    .max(10000, "Too much stock"),
  closingQuantity: z.number().optional(),
});

const FormSchema = z.object({
  memberId: z.string().min(1, "Franchise is required."),
  StockTransferDetails: z
    .array(StockTransferDetailSchema)
    .min(1, "At least one stock row is required."),
});

type FormInputs = z.infer<typeof FormSchema>;

const FranchiseStockForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      memberId: "",
      StockTransferDetails: [{ productId: "", batchNumber: "", quantity: 0 }],
    },
    resolver: zodResolver(FormSchema),
  });

  const {
    fields: StockTransferDetailsFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "StockTransferDetails",
  });

  const watchedDetails = useWatch({
    control,
    name: "StockTransferDetails",
  });

  const { data: franchises = [] } = useQuery({
    queryKey: ["franchises"],
    queryFn: () => get("/franchise/all"),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => get("/products/all"),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/stock/add-franchise-stock", data),
    onSuccess: () => {
      toast.success("Stock transferred successfully");
      queryClient.invalidateQueries(["stocks"]);
      navigate("/franchiseStock");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to transfer stock");
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    for (let i = 0; i < data.StockTransferDetails.length; i++) {
      const { quantity, closingQuantity } = data.StockTransferDetails[i];
      if (closingQuantity !== undefined && quantity > closingQuantity) {
        toast.error(`Row ${i + 1}: Quantity exceeds available stock.`);
        return;
      }
    }

    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="mx-auto mt-10">
        <CardContent className="pt-6">
          <CardTitle>Franchise</CardTitle>
          <div className="my-4">
            <Label>Franchise</Label>
            <Controller
              control={control}
              name="memberId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a franchise" />
                  </SelectTrigger>
                  <SelectContent>
                    {franchises.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.memberUsername}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.memberId && (
              <p className="text-red-500 text-sm">{errors.memberId.message}</p>
            )}
          </div>

          <CardTitle className="mt-6">Stock Transfer Details</CardTitle>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {StockTransferDetailsFields.map((field, index) => {
                const row = watchedDetails?.[index];
                const productId = row?.productId;

                const { data: productBatches = [] } = useQuery({
                  queryKey: ["productBatches", productId],
                  queryFn: () => get(`/stock/product-batches/${productId}`),
                  enabled: !!productId,
                });

                const selectedBatch = productBatches?.find(
                  (b) => b.batchNumber === row?.batchNumber
                );

                const closingQty = selectedBatch?.closingQuantity ?? 0;

                useEffect(() => {
                  if (closingQty !== undefined) {
                    setValue(
                      `StockTransferDetails.${index}.closingQuantity`,
                      closingQty
                    );
                  }
                }, [closingQty, index, setValue]);

                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`StockTransferDetails.${index}.productId`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.productName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.StockTransferDetails?.[index]?.productId && (
                        <p className="text-red-500 text-xs">
                          {
                            errors.StockTransferDetails[index]?.productId
                              ?.message
                          }
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={control}
                        name={`StockTransferDetails.${index}.batchNumber`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch" />
                            </SelectTrigger>
                            <SelectContent>
                              {productBatches.map((batch) => (
                                <SelectItem
                                  key={batch.id}
                                  value={batch.batchNumber}
                                >
                                  {batch.batchNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.StockTransferDetails?.[index]?.batchNumber && (
                        <p className="text-red-500 text-xs">
                          {
                            errors.StockTransferDetails[index]?.batchNumber
                              ?.message
                          }
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={control}
                        name={`StockTransferDetails.${index}.quantity`}
                        render={({ field }) => (
                          <Input type="number" {...field} className="w-24" />
                        )}
                      />
                      {errors.StockTransferDetails?.[index]?.quantity && (
                        <p className="text-red-500 text-xs">
                          {
                            errors.StockTransferDetails[index]?.quantity
                              ?.message
                          }
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm">{closingQty}</span>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={StockTransferDetailsFields.length === 1}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              append({
                productId: "",
                batchNumber: "",
                quantity: 0,
              })
            }
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add More
          </Button>
        </CardContent>

        <div className="flex justify-end gap-3 p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/franchiseStock")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <LoaderCircle className="animate-spin h-4 w-4" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default FranchiseStockForm;
