import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { get, post } from "@/services/apiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StockTransferRow } from "./StockTransferRow";

// Schema Definition
const StockTransferDetailSchema = z
  .object({
    productId: z.string().min(1, "Product is required."),
    batchNumber: z.string().min(1, "Batch is required."),
    batchId: z.string().min(1, "Batch is required."), // 👈 NEW
    quantity: z.coerce
      .number()
      .int("Quantity must be an integer.")
      .min(1, "Min 1"),
    closingQuantity: z.coerce.number().min(0).optional(),
    expiryDate: z.string().optional(),
    // invoiceNumber: z.string().optional(),
  })
  .refine(
    (data) =>
      data.closingQuantity === undefined ||
      data.quantity <= data.closingQuantity,
    {
      path: ["quantity"],
      message: "Quantity cannot exceed available stock",
    }
  );

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
  const [openMemberId, setOpenMemberId] = useState<boolean>(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      memberId: "",
      StockTransferDetails: [
        { productId: "", batchNumber: "", quantity: 0, batchId: "" },
      ],
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
  // Build productId -> Set of selected batchNumbers

  const selectedBatchesMap: Record<string, Set<string>> = {};
  watchedDetails?.forEach((row) => {
    if (row?.productId && row?.batchId) {
      if (!selectedBatchesMap[row.productId]) {
        selectedBatchesMap[row.productId] = new Set();
      }
      selectedBatchesMap[row.productId].add(row.batchId);
    }
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
          {/* <div className="my-4">
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
          </div> */}
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
                            (franchise) =>
                              String(franchise.id) === String(field.value)
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
                                  setValue("memberId", String(franchise.id));
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
          <CardTitle className="mt-6">Stock Transfer Details</CardTitle>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Expiry</TableHead>
                {/* <TableHead>Invoice</TableHead> */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {StockTransferDetailsFields.map((field, index) => (
                <StockTransferRow
                  key={field.id}
                  index={index}
                  control={control}
                  errors={errors}
                  products={products}
                  row={watchedDetails?.[index]}
                  remove={remove}
                  setValue={setValue}
                  totalRows={StockTransferDetailsFields.length}
                  selectedBatchesMap={selectedBatchesMap} // 👈 NEW
                />
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
