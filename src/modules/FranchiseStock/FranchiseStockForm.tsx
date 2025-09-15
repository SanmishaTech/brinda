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
  memberId: z.string().min(1, "Member field is required."),
  productId: z.string().min(1, "Product field is required."),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer.")
    .min(1, "Quantity must be at least 1.")
    .max(9000, "Quantity must be at max 9000"),
  availableQuantity: z.coerce
    .number()
    .int("Available Quantity must be an integer.")
    .min(1, "Available Quantity must be at least 1.")
    .max(9000, "Available Quantity must be at max 9000"),
});

type FormInputs = z.infer<typeof FormSchema>;

const FranchiseStockForm = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    memberId: "",
    productId: "",
    quantity: 0,
    availableQuantity: 0,
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

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/add-franchise-stock", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["fra"]); // Refetch the users list
      toast.success("Franchise Stock created successfully");
      navigate("/products"); // Navigate to the hotels page after successful creation
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(
        error.response?.data?.message ||
          "Failed to transfer stock to franchise."
      );
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    createMutation.mutate(data); // Trigger create mutation
  };

  const isLoading = createMutation.isPending;

  return (
    <>
      <div className="mt-2 p-6">
        <h1 className="text-2xl font-bold mb-6">Add Franchise Stock</h1>
        {/* JSX Code for FranchiseStockForm.tsx */}
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
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[90px]"
              >
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
      </div>
    </>
  );
};

export default FranchiseStockForm;
