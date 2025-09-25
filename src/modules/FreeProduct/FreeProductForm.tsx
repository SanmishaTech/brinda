import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
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

import { LoaderCircle } from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { post, put } from "@/services/apiService";
import { set } from "date-fns";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css"; // Import styles for the phone input

export const FormSchema = z.object({
  productId: z.string().min(1, "Product field cannot be left blank."),
  quantity: z
    .string()
    .nonempty("Quantity is required.")
    .refine((val) => /^[1-9][0-9]*$/.test(val), {
      message: "Quantity must be a valid number without leading zeros.",
    })
    .transform((val) => Number(val))
    .refine((num) => num >= 1 && num <= 100, {
      message: "Quantity must be between 1 and 100.",
    }),
});

type FormInputs = z.infer<typeof FormSchema>;

const FreeProductForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    productId: "",
    quantity: 0,
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
  const { data: freeProducts } = useQuery({
    queryKey: ["freeProducts"],
    queryFn: async () => {
      const response = await get(`/products/all`);
      return response;
    },
  });

  const { data: editProductData, isLoading: editHotelLoading } = useQuery({
    queryKey: ["editFreeProductData", id],
    queryFn: async () => {
      const response = await get(`/free-products/${id}`);
      return response; // API returns the sector object directly
    },
    enabled: !!id && mode === "edit",
  });

  useEffect(() => {
    if (editProductData) {
      reset({
        productId: editProductData?.product?.id
          ? String(editProductData?.product?.id)
          : "",
        quantity: editProductData?.quantity ? editProductData.quantity : "",
      });
    }
  }, [editProductData, reset]);

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/free-products", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["free-products"]); // Refetch the users list
      toast.success("Free Product created successfully");
      navigate("/freeProducts"); // Navigate to the hotels page after successful creation
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(
        error.response?.data?.message || "Failed to create free Product"
      );
    },
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => put(`/free-products/${id}`, data),
    onSuccess: () => {
      toast.success(" Free Product updated successfully");
      queryClient.invalidateQueries(["free-products"]);
      navigate("/freeProducts"); // Navigate to the hotels page after successful update
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(
        error.response?.data?.message || "Failed to update free Product"
      );
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
      {/* JSX Code for FreeProductForm.tsx */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="mx-auto mt-10">
          <CardContent className="pt-6">
            {/* Hotel Details */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Free Product Details
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Product Name */}
              <div className="">
                <Label
                  htmlFor="productId"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select Product <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name={`productId`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const product = freeProducts?.find(
                          (p) => String(p.id) === value
                        );
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="truncate w-full max-w-[450px]">
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {freeProducts?.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={String(product.id)}
                            className="truncate"
                          >
                            {product.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.productId?.message}
                  </p>
                )}
              </div>

              <div className="">
                <Label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name={`quantity`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      inputMode="numeric"
                      step="1"
                      pattern="^[1-9][0-9]?$|^100$"
                      placeholder="Qty"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Prevent invalid leading zeros like 044
                        if (/^0\d+/.test(value)) return;
                        field.onChange(value);
                      }}
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.quantity?.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/freeProducts")}
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

export default FreeProductForm;
