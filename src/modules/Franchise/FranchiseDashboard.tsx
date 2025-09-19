import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get, post } from "@/services/apiService";
import path from "path-browserify";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  TrendingUp,
  UserCheck,
  ShoppingCart,
  Gift,
  Users,
  Loader,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatter";
import { toast } from "sonner";
import { DIAMOND } from "@/config/data";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const fetchDashboardData = async () => {
  const response = await get("/franchise/dashboard");
  return response;
};

const FranchiseDashboard = () => {
  const queryClient = useQueryClient();

  const invoiceSchema = z.object({
    invoiceNumber: z
      .string()
      .min(1, "Invoice number is required")
      .max(12, "Invoice number is too long"),
  });

  type InvoiceForm = z.infer<typeof invoiceSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
    },
  });

  const deliverMutation = useMutation({
    mutationFn: (data: InvoiceForm) =>
      post("/franchise/deliver-products", data), // Replace `get` with `post` if it's a POST call
    onSuccess: () => {
      toast.success("Products delivered successfully.");
      queryClient.invalidateQueries(["franchiseDashboard"]);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Delivery failed.");
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["franchiseDashboard"],
    queryFn: fetchDashboardData,
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch franchise dashboard data");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-10 h-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const handlePurchaseInvoice = async (purchaseId, invoicePath) => {
    const uuid = path.basename(path.dirname(invoicePath));
    const filename = path.basename(invoicePath);

    try {
      const response = await get(
        `/purchases/${uuid}/${filename}/${purchaseId}/generate-invoice`,
        {},
        { responseType: "blob" } // must be in config
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${purchaseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate invoice");
        alert("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleRepurchaseInvoice = async (repurchaseId, invoicePath) => {
    const uuid = path.basename(path.dirname(invoicePath));
    const filename = path.basename(invoicePath);

    try {
      const response = await get(
        `/repurchases/${uuid}/${filename}/${repurchaseId}/generate-invoice`,
        {},
        { responseType: "blob" } // must be in config
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${repurchaseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate invoice");
        alert("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

  const {
    securityDepositAmount,
    securityDepositPending,
    franchiseCommission,
    securityDepositReturn,
    franchiseWalletBalance,
    franchiseIntroductionAmount,
    repurchaseBillAmount,
    totalSecurityDepositReturn,
  } = data;

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to Your Franchise Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's a complete overview of your account
        </p>
      </div>

      {/* Section 1: Wallets */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Franchise Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="text-white" />
                Franchise Wallet
              </CardTitle>
              <CardDescription className="text-white">
                Franchise Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(franchiseWalletBalance)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <TrendingUp />
                Security Deposit Amount
              </CardTitle>
              <CardDescription className="text-white">
                Security Deposit Amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(securityDepositAmount)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Franchise Commission
              </CardTitle>
              <CardDescription className="text-white">
                Franchise Commission This Month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(franchiseCommission)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="text-white" />
                Security Deposit Return
              </CardTitle>
              <CardDescription className="text-white">
                Security Deposit Return This Month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(securityDepositReturn)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-pink-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Security Deposit Pending
              </CardTitle>
              <CardDescription className="text-white">
                Security Deposit Pending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(securityDepositPending)}
              </p>
            </CardContent>
          </Card>{" "}
          <Card className="bg-gradient-to-br from-green-500 to-green-800 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Franchise Introduction Commission
              </CardTitle>
              <CardDescription className="text-white">
                Franchise Introduction Commission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(franchiseIntroductionAmount)}
              </p>
            </CardContent>
          </Card>{" "}
          <Card className="bg-gradient-to-br from-red-500 to-red-800 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Sponsor's Commission
              </CardTitle>
              <CardDescription className="text-white">
                Repurchase Bill Sponsor's Commission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(repurchaseBillAmount)}
              </p>
            </CardContent>
          </Card>{" "}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-800 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Total Security Deposit Return
              </CardTitle>
              <CardDescription className="text-white">
                Total Security Deposit return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(totalSecurityDepositReturn)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 2: Deliver Product Form */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Deliver Products
        </h2>
        <Card className="">
          <CardHeader>
            <CardTitle>Enter Invoice Number</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) => deliverMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <Controller
                  name="invoiceNumber"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="invoice number" {...field} />
                  )}
                />

                {errors.invoiceNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.invoiceNumber.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={deliverMutation.isPending}>
                {deliverMutation.isPending
                  ? "Delivering..."
                  : "Deliver Products"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Purchase Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Purchases
        </h2>
        <Card>
          <CardContent className="overflow-x-auto">
            {data.purchases?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Total (With GST)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivered At</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.invoiceNumber}</TableCell>

                      <TableCell>
                        {formatCurrency(purchase.totalAmountWithGst)}
                      </TableCell>
                      <TableCell>{purchase.status}</TableCell>
                      <TableCell>
                        {new Date(purchase.deliveredAt).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true, // You can set to false for 24-hour format
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {/* <a
                          href={purchase.invoicePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </a> */}
                        <Button
                          // variant="ghost"
                          size="sm"
                          onClick={() =>
                            handlePurchaseInvoice(
                              purchase.id,
                              purchase.invoicePath
                            )
                          }
                        >
                          invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No purchase records found.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Repurchase Table */}
      <section>
        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-700 dark:text-gray-200">
          Repurchases
        </h2>
        <Card>
          <CardContent className="overflow-x-auto">
            {/* Replace this with real repurchase data when available */}
            {data.repurchases?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Total (With GST)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivered At</TableHead>
                    <TableHead>Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.repurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.invoiceNumber}</TableCell>

                      <TableCell>
                        {formatCurrency(purchase.totalAmountWithGst)}
                      </TableCell>
                      <TableCell>{purchase.status}</TableCell>
                      <TableCell>
                        {new Date(purchase.deliveredAt).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true, // You can set to false for 24-hour format
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          // variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRepurchaseInvoice(
                              purchase.id,
                              purchase.invoicePath
                            )
                          }
                        >
                          invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No repurchase records found.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default FranchiseDashboard;
