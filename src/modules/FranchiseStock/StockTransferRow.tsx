import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TableRow, TableCell } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface StockTransferRowProps {
  index: number;
  control: any;
  errors: any;
  products: any[];
  row: any;
  remove: (index: number) => void;
  setValue: any;
  totalRows: number;
  selectedBatchesMap: Record<string, Set<string>>; // 👈 NEW
}

export const StockTransferRow = ({
  index,
  control,
  errors,
  products,
  row,
  remove,
  setValue,
  totalRows,
  selectedBatchesMap,
}: StockTransferRowProps) => {
  const productId = row?.productId;

  const { data: productBatches = [] } = useQuery({
    queryKey: ["productBatches", productId],
    queryFn: () => get(`/stock/product-batches/${productId}`),
    enabled: !!productId,
  });

  // Find selected batch by ID, not batchNumber
  const selectedBatch = productBatches?.find(
    (b: any) => String(b.id) === String(row?.batchId)
  );
  const closingQty = selectedBatch?.closingQuantity ?? 0;

  useEffect(() => {
    if (closingQty !== undefined) {
      setValue(`StockTransferDetails.${index}.closingQuantity`, closingQty);
    }
  }, [closingQty, index, setValue]);

  useEffect(() => {
    if (selectedBatch) {
      setValue(
        `StockTransferDetails.${index}.closingQuantity`,
        selectedBatch.closing_quantity
      );
      setValue(
        `StockTransferDetails.${index}.expiryDate`,
        selectedBatch.expiryDate
      );
      // setValue(
      //   `StockTransferDetails.${index}.invoiceNumber`,
      //   selectedBatch.invoiceNumber
      // );
    }
  }, [selectedBatch, index, setValue]);

  // Exclude batches already used in other rows for the same product
  const usedBatches = selectedBatchesMap[productId] || new Set();
  const availableBatches = productBatches.filter(
    (b: any) => !usedBatches.has(String(b.id)) || String(b.id) === row?.batchId
  );

  return (
    <TableRow key={index}>
      <TableCell>
        <Controller
          control={control}
          name={`StockTransferDetails.${index}.productId`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
            {errors.StockTransferDetails[index]?.productId?.message}
          </p>
        )}
      </TableCell>

      <TableCell>
        {/* <Controller
          control={control}
          name={`StockTransferDetails.${index}.batchNumber`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {availableBatches.map((batch: any) => (
                  <SelectItem key={batch.id} value={batch.batchNumber}>
                    {batch.batchNumber}{" "}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        /> */}
        <Controller
          control={control}
          name={`StockTransferDetails.${index}.batchId`}
          render={({ field }) => (
            <Select
              onValueChange={(val) => {
                field.onChange(val);
                const selected = productBatches.find(
                  (b: any) => String(b.id) === val
                );
                if (selected) {
                  setValue(
                    `StockTransferDetails.${index}.batchNumber`,
                    selected.batchNumber
                  );
                  setValue(
                    `StockTransferDetails.${index}.closingQuantity`,
                    selected.closing_quantity
                  );
                  setValue(
                    `StockTransferDetails.${index}.expiryDate`,
                    selected.expiryDate
                  );
                  // setValue(
                  //   `StockTransferDetails.${index}.invoiceNumber`,
                  //   selected.invoiceNumber
                  // );
                }
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {availableBatches.map((branch: any) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.batchNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {errors.StockTransferDetails?.[index]?.batchNumber && (
          <p className="text-red-500 text-xs">
            {errors.StockTransferDetails[index]?.batchNumber?.message}
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
            {errors.StockTransferDetails[index]?.quantity?.message}
          </p>
        )}
      </TableCell>

      <TableCell>
        <span className="text-sm">{row?.closingQuantity ?? ""}</span>
      </TableCell>

      <TableCell>
        <span className="text-sm">
          {row?.expiryDate
            ? new Date(row.expiryDate).toLocaleDateString("en-US", {
                month: "long", // or "short" for abbreviated month
                year: "numeric",
              })
            : ""}
        </span>
      </TableCell>

      {/* <TableCell>
        <span className="text-sm">{row?.invoiceNumber ?? ""}</span>
      </TableCell> */}

      <TableCell>
        <Button
          variant="ghost"
          type="button"
          size="icon"
          onClick={() => remove(index)}
          disabled={totalRows === 1}
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
