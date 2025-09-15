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
}: StockTransferRowProps) => {
  const productId = row?.productId;

  const { data: productBatches = [] } = useQuery({
    queryKey: ["productBatches", productId],
    queryFn: () => get(`/stock/product-batches/${productId}`),
    enabled: !!productId,
  });

  const selectedBatch = productBatches?.find(
    (b: any) => b.batchNumber === row?.batchNumber
  );
  const closingQty = selectedBatch?.closingQuantity ?? 0;

  useEffect(() => {
    if (closingQty !== undefined) {
      setValue(`StockTransferDetails.${index}.closingQuantity`, closingQty);
    }
  }, [closingQty, index, setValue]);

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
        <Controller
          control={control}
          name={`StockTransferDetails.${index}.batchNumber`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {productBatches.map((batch: any) => (
                  <SelectItem key={batch.id} value={batch.batchNumber}>
                    {batch.batchNumber}
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
        <span className="text-sm">{closingQty}</span>
      </TableCell>

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
