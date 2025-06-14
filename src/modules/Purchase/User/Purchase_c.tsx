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
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, Trash2, PlusCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post } from "@/services/apiService";

const purchaseDetailSchema = z.object({
  productId: z.number().min(1, "Product is required."),
  quantity: z.number().min(1, "Quantity must be at least 1."),
});

const FormSchema = z.object({
  purchaseDetails: z
    .array(purchaseDetailSchema)
    .min(1, "At least one product must be selected."),
});

type FormInputs = z.infer<typeof FormSchema>;

const Purchase = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [memberState, setMemberState] = useState<string | null>(null);
  const [gst, setGst] = useState<number>(0);
  const [products, setProducts] = useState<any[]>([]);

  const defaultValues = {
    purchaseDetails: [
      {
        productId: null,
        quantity: 1,
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
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseDetails",
  });

  // Fetch member state and GST
  useQuery({
    queryKey: ["memberState"],
    queryFn: async () => {
      const response = await get(`/states/member`);
      setMemberState(response.state);
      setGst(response.gst);
      return response;
    },
  });

  // Fetch products
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await get(`/products/all`);
      setProducts(response);
      return response;
    },
  });

  const calculateValues = (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return {};

    const rate = product.rate;
    const pvPerUnit = product.pvPerUnit;
    const gstPercent = gst;
    const cgstPercent = memberState === "Maharashtra" ? gstPercent / 2 : 0;
    const sgstPercent = memberState === "Maharashtra" ? gstPercent / 2 : 0;
    const igstPercent = memberState !== "Maharashtra" ? gstPercent : 0;

    const amountWithoutGst = rate * quantity;
    const cgstAmount = (amountWithoutGst * cgstPercent) / 100;
    const sgstAmount = (amountWithoutGst * sgstPercent) / 100;
    const igstAmount = (amountWithoutGst * igstPercent) / 100;
    const amountWithGst =
      amountWithoutGst + cgstAmount + sgstAmount + igstAmount;
    const totalPV = pvPerUnit * quantity;

    return {
      rate,
      cgstPercent,
      sgstPercent,
      igstPercent,
      cgstAmount,
      sgstAmount,
      igstAmount,
      amountWithoutGst,
      amountWithGst,
      pvPerUnit,
      totalPV,
    };
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const payload = data.purchaseDetails.map((detail) => {
      const calculatedValues = calculateValues(
        detail.productId,
        detail.quantity
      );
      return {
        ...detail,
        ...calculatedValues,
      };
    });

    post("/purchases", { purchaseDetails: payload })
      .then(() => {
        toast.success("Purchase successful!");
        queryClient.invalidateQueries(["purchases"]);
        reset();
      })
      .catch(() => {
        toast.error("Failed to complete purchase.");
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="mx-auto mt-10 max-w-5xl">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              <ShoppingCart className="inline-block w-8 h-8 text-blue-500 mr-2" />
              Purchase Products
            </CardTitle>
            <p className="text-gray-600">
              Select products and quantities to calculate GST and PV values.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>CGST</TableHead>
                <TableHead>SGST</TableHead>
                <TableHead>IGST</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const productId = watch(`purchaseDetails.${index}.productId`);
                const quantity = watch(`purchaseDetails.${index}.quantity`);
                const calculatedValues = calculateValues(productId, quantity);

                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`purchaseDetails.${index}.productId`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.productName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.purchaseDetails?.[index]?.productId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.purchaseDetails[index]?.productId?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        {...register(`purchaseDetails.${index}.quantity`)}
                        placeholder="Enter quantity"
                      />
                      {errors.purchaseDetails?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.purchaseDetails[index]?.quantity?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{calculatedValues.rate || "-"}</TableCell>
                    <TableCell>{calculatedValues.cgstPercent || "-"}</TableCell>
                    <TableCell>{calculatedValues.sgstPercent || "-"}</TableCell>
                    <TableCell>{calculatedValues.igstPercent || "-"}</TableCell>
                    <TableCell>
                      {calculatedValues.amountWithGst || "-"}
                    </TableCell>
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
                );
              })}
            </TableBody>
          </Table>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => append({ productId: null, quantity: 1 })}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Product
          </Button>
        </CardContent>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Clear
          </Button>
          <Button type="submit" className="bg-blue-500 text-white">
            Pay
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default Purchase;
