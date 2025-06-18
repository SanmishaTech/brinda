import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Wallet, Plus, ChevronDown, Loader2 } from "lucide-react";
import { get } from "@/services/apiService"; // Assuming you have an apiService
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function WalletButton() {
  const navigate = useNavigate();

  // Use React Query to fetch wallet balance
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const response = await get("/wallet-transactions/wallet-amount");
      const amount = Number(response.walletBalance);
      return isNaN(amount) ? null : parseFloat(amount.toFixed(2));
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch wallet balance";
      toast.error(errorMessage);
    },
  });

  console.log("Wallet Balance Data:", data);

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
        disabled
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-medium">Loading...</span>
      </Button>
    );
  }

  if (isError || data === null || data === undefined) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10"
        title={error?.message || "Error fetching wallet balance"}
        onClick={() => {
          /* Optionally, implement a retry mechanism here */
        }}
      >
        <Wallet className="w-5 h-5" />
        <span className="font-medium">Error</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Wallet className="w-5 h-5 text-orange-500" />
          <span className="font-medium">
            ₹{data !== null ? data.toFixed(2) : "N/A"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      {/* <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Wallet Balance: ₹{data !== null ? data.toFixed(2) : "N/A"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/member/wallet")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Money
        </DropdownMenuItem>
      </DropdownMenuContent> */}
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem
          onClick={() => navigate("/member/wallet")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Wallet className="w-4 h-4" />
          Wallet Balance: ₹{data !== null ? data.toFixed(2) : "N/A"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
