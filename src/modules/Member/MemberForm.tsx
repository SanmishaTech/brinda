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
  productName: z
    .string()
    .min(1, "Product Name cannot be left blank.")
    .max(100, "Product Name must not exceed 100 characters."),
  hsnCode: z.string().regex(/^\d{4}(\d{2})?(\d{2})?$/, {
    message: "HSN Code must be 4, 6, or 8 digits long.",
  }),
  mrp: decimalString("MRP", 10, 2),
  mfgRate: decimalString("MFG Rate", 10, 2),
  gst: decimalString("GST", 5, 2),
  dspRate: decimalString("DSP Rate", 10, 2),
  pv: decimalString("PV", 10, 2),
  bv: decimalString("BV", 10, 2),
  bvPrice: decimalString("BV Price", 10, 2),
});

type FormInputs = z.infer<typeof FormSchema>;

const MemberForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const [hotelCountryId, setHotelCountryId] = useState<string | null>(null);
  const [officeCountryId, setOfficeCountryId] = useState<string | null>(null);
  const [hotelStateId, setHotelStateId] = useState<string | null>(null);
  const [officeStateId, setOfficeStateId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    productName: "",
    hsnCode: "",
    mrp: "",
    mfgRate: "",
    gst: "",
    dspRate: "",
    pv: "",
    bv: "",
    bvPrice: "",
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
    defaultValues: mode === "create" ? defaultValues : undefined, // Use default values in create mode
    mode: "onChange", // 👈 triggers validation on each change
    reValidateMode: "onChange", // 👈 re-validate on every change
  });

  const { data: editProductData, isLoading: editHotelLoading } = useQuery({
    queryKey: ["editProductData", id],
    queryFn: async () => {
      const response = await get(`/products/${id}`);
      return response; // API returns the sector object directly
    },
    enabled: !!id && mode === "edit",
  });

  useEffect(() => {
    if (editProductData) {
      reset({
        productName: editProductData?.productName
          ? editProductData.productName
          : "",
        hsnCode: editProductData?.hsnCode ? editProductData.hsnCode : "",
        mrp: editProductData?.mrp ? Number(editProductData.mrp).toFixed(2) : "",
        mfgRate: editProductData?.mfgRate
          ? Number(editProductData.mfgRate).toFixed(2)
          : "",
        gst: editProductData?.gst ? Number(editProductData.gst).toFixed(2) : "",
        dspRate: editProductData?.dspRate
          ? Number(editProductData.dspRate).toFixed(2)
          : "",
        pv: editProductData?.pv ? Number(editProductData.pv).toFixed(2) : "",
        bv: editProductData?.bv ? Number(editProductData.bv).toFixed(2) : "",
        bvPrice: editProductData?.bvPrice
          ? Number(editProductData.bvPrice).toFixed(2)
          : "",
      });
    }
  }, [editProductData, reset]);

  // Mutation for creating a user
  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]); // Refetch the users list
      toast.success("Product created successfully");
      navigate("/products"); // Navigate to the hotels page after successful creation
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to create Product");
    },
  });

  // Mutation for updating a user
  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => put(`/products/${id}`, data),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries(["products"]);
      navigate("/products"); // Navigate to the hotels page after successful update
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
      {/* JSX Code for MemberForm.tsx */}
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
                <Input
                  id="productName"
                  {...register("productName")}
                  placeholder="Enter hotel name"
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
                <Input
                  id="mrp"
                  {...register("mrp")}
                  type="number"
                  step="0.01"
                  placeholder="MRP"
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
                  <Input
                    id="hsnCode"
                    {...register("hsnCode")}
                    type="number"
                    placeholder="HSN Code"
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
                  <Input
                    id="dspRate"
                    {...register("dspRate")}
                    type="number"
                    step="0.01"
                    placeholder="DSP Rate"
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
                  <Input
                    id="mfgRate"
                    {...register("mfgRate")}
                    type="number"
                    step="0.01"
                    placeholder="MFG Rate"
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
                  <Input
                    id="gst"
                    {...register("gst")}
                    type="number"
                    step="0.01"
                    max={100}
                    placeholder="GST(%)"
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
                  <Input
                    id="pv"
                    {...register("pv")}
                    type="number"
                    step="0.01"
                    placeholder="PV"
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
                  <Input
                    id="bv"
                    {...register("bv")}
                    type="number"
                    step="0.01"
                    placeholder="BV"
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
                  <Input
                    id="bvPrice"
                    {...register("bvPrice")}
                    type="number"
                    step="0.01"
                    placeholder="BV Price"
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

export default MemberForm;
