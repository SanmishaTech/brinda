import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from "react-hook-form";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LoaderCircle,
  ChevronsUpDown,
  Check,
  PlusCircle,
  Trash2,
} from "lucide-react"; // Import the LoaderCircle icon
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "@/services/apiService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const StockTransferDetailSchema = z.object({
  productId: z.string().min(1, "Product Field is required."),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer.")
    .min(1, "Quantity must be at least 1.")
    .max(9000, "Quantity must be at max 9000"),
  batchNumber: z
    .string()
    .min(1, "Batch Number is required")
    .max(50, "Batch Number should be less than 50 characters"),
  invoiceNumber: z
    .string()
    .min(1, "Invoice Number is required")
    .max(50, "Invoice Number should be less than 50 characters"),
  expiryDate: z.string().min(1, "Expiry Date is required"),
});

export const FormSchema = z.object({
  memberId: z.string().min(1, "Member Field is required."),
  StockTransferDetails: z
    .array(StockTransferDetailSchema)
    .min(1, "At least one stock is required."),
});

type FormInputs = z.infer<typeof FormSchema>;

const FranchiseStockForm = ({ mode }: { mode: "create" | "edit" }) => {
  const { id } = useParams<{ id: string }>();
  const [openMemberId, setOpenMemberId] = useState<boolean>(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultValues: z.infer<typeof FormSchema> = {
    memberId: "",
    StockTransferDetails: [
      {
        productId: "",
        quantity: 0,
        invoiceNumber: "",
        batchNumber: "",
        expiryDate: "",
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

  const {
    fields: StockTransferDetailsFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "StockTransferDetails",
  });

  // Fetch franchises
  const { data: franchises } = useQuery({
    queryKey: ["franchises"],
    queryFn: async () => {
      const response = await get(`/franchise/all`);
      return response;
    },
  });

  // Fetch members
  const { data: products } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await get(`/products/all`);
      return response;
    },
  });

  // Fetch franchises
  const { data: productBatches } = useQuery({
    queryKey: ["productBatches"],
    queryFn: async () => {
      const response = await get(`/stock/product-batches/${productId}`);
      return response;
    },
  });

  // const { data: editProductData, isLoading: editHotelLoading } = useQuery({
  //   queryKey: ["editProductData", id],
  //   queryFn: async () => {
  //     const response = await get(`/products/${id}`);
  //     return response;
  //   },
  //   enabled: !!id && mode === "edit",
  // });

  // useEffect(() => {
  //   if (editProductData) {
  //     reset({
  //       productName: editProductData?.productName
  //         ? editProductData.productName
  //         : "",
  //       hsnCode: editProductData?.hsnCode ? editProductData.hsnCode : "",
  //       mrp: editProductData?.mrp ? Number(editProductData.mrp).toFixed(2) : "",
  //       mfgRate: editProductData?.mfgRate
  //         ? Number(editProductData.mfgRate).toFixed(2)
  //         : "",
  //       gst: editProductData?.gst ? Number(editProductData.gst).toFixed(2) : "",
  //       dspRate: editProductData?.dspRate
  //         ? Number(editProductData.dspRate).toFixed(2)
  //         : "",
  //       pv: editProductData?.pv ? Number(editProductData.pv).toFixed(2) : "",
  //       bv: editProductData?.bv ? Number(editProductData.bv).toFixed(2) : "",
  //       bvPrice: editProductData?.bvPrice
  //         ? Number(editProductData.bvPrice).toFixed(2)
  //         : "",
  //     });
  //   }
  // }, [editProductData, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormInputs) => post("/stock/add-franchise-stock", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["/stock/add-franchise-stock"]);
      toast.success("Stock Transferred successfully");
      navigate("/franchiseStock");
    },
    onError: (error: any) => {
      Validate(error, setError);
      toast.error(error.response?.data?.message || "Failed to Transfer Stock");
    },
  });

  // Mutation for updating a user
  // const updateMutation = useMutation({
  //   mutationFn: (data: FormInputs) => put(`/products/${id}`, data),
  //   onSuccess: () => {
  //     toast.success("Product updated successfully");
  //     queryClient.invalidateQueries(["products"]);
  //     navigate("/products");
  //   },
  //   onError: (error: any) => {
  //     Validate(error, setError);
  //     toast.error(error.response?.data?.message || "Failed to update Product");
  //   },
  // });

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (mode === "create") {
      createMutation.mutate(data); // Trigger create mutation
    } else {
      // updateMutation.mutate(data); // Trigger update mutation
    }
  };

  const isLoading = createMutation.isPending;
  //  || updateMutation.isPending;

  return (
    <>
      {/* JSX Code for FranchiseStockForm.tsx */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="mx-auto mt-10">
          <CardContent className="pt-6">
            {/* Invoice / Purchase Summary Details */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Member
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              <div className="col-span-2 lg:col-span-1">
                <Label
                  htmlFor="memberId"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Franchise <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="memberId"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openMemberId} onOpenChange={setOpenMemberId}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openMemberId ? "true" : "false"} // This should depend on the popover state
                          className="w-[325px] md:w-[480px] justify-between overflow-hidden mt-1"
                          onClick={() => setOpenMemberId((prev) => !prev)} // Toggle popover on button click
                        >
                          {field.value
                            ? franchises &&
                              franchises.find(
                                (franchise) => franchise.id === field.value
                              )?.memberUsername
                            : "Select franchise"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[325px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search franchise..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No franchise found.</CommandEmpty>
                            <CommandGroup>
                              {franchises &&
                                franchises.map((franchise) => (
                                  <CommandItem
                                    key={franchise.id}
                                    value={franchise.memberUsername} // 👈 Use client name for filtering
                                    onSelect={(currentValue) => {
                                      setValue("memberId", franchise.id);
                                      setMemberId(franchise.id);

                                      setOpenMemberId(false);
                                      // Close popover after selection
                                    }}
                                  >
                                    {franchise.memberUsername}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        franchise.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.memberId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.memberId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Purchase Detail (single item explicit fields) */}
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-8">
              Stock Details
            </CardTitle>
            <div className="mt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40 px-1">Product</TableHead>
                    <TableHead className="w-32 px-1">Batch</TableHead>
                    <TableHead className="w-20 px-1">Qty</TableHead>
                    <TableHead className="w-32 px-1">Expiry</TableHead>
                    <TableHead className="w-32 px-1">
                      Available Quantity
                    </TableHead>
                    <TableHead className="w-20 px-1">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {StockTransferDetailsFields?.map((field, index) => (
                    <TableRow key={field.id}>
                      {/* ProductId */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`StockTransferDetails.${index}.productId`}
                          control={control}
                          render={() => (
                            <Select
                              onValueChange={(value) =>
                                setValue(
                                  `StockTransferDetails.${index}.productId`,
                                  value === "none" ? "" : value
                                )
                              }
                              value={
                                watch(
                                  `StockTransferDetails.${index}.productId`
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
                        {errors.StockTransferDetails?.[index]?.productId && (
                          <p className="text-red-500 text-xs mt-1">
                            {
                              errors.StockTransferDetails[index]?.productId
                                ?.message
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* batchNumber */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`StockTransferDetails.${index}.batchNumber`}
                          control={control}
                          render={() => (
                            <Select
                              onValueChange={(value) =>
                                setValue(
                                  `StockTransferDetails.${index}.batchNumber`,
                                  value === "none" ? "" : value
                                )
                              }
                              value={
                                watch(
                                  `StockTransferDetails.${index}.batchNumber`
                                ) || ""
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a batch" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Select a batch
                                </SelectItem>
                                {productBatches?.map((batch) => (
                                  <SelectItem
                                    key={batch.id}
                                    value={String(batch.id)}
                                  >
                                    {batch.batchNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.StockTransferDetails?.[index]?.batchNumber && (
                          <p className="text-red-500 text-xs mt-1">
                            {
                              errors.StockTransferDetails[index]?.batchNumber
                                ?.message
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="px-1 align-top">
                        <Controller
                          name={`StockTransferDetails.${index}.quantity`}
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
                        {errors.StockTransferDetails?.[index]?.quantity && (
                          <p className="text-red-500 text-xs">
                            {
                              errors.StockTransferDetails[index]?.quantity
                                ?.message
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* Remove Button */}
                      <TableCell className="px-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={StockTransferDetailsFields.length === 1}
                        >
                          <Trash2
                            className={`${
                              StockTransferDetailsFields.length === 1
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
                    quantity: 0,
                    batchNumber: "",
                    expiryDate: "",
                    invoiceNumber: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add More Stock
              </Button>
            </div>
          </CardContent>

          {/* Submit / Cancel Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/franchiseStock")}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading} className="min-w-[90px]">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-4 w-4" />
              ) : mode === "create" ? (
                "Add Stock"
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

export default FranchiseStockForm;
