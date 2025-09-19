import React, { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, X } from "lucide-react"; // gold icon

import {
  Loader,
  ChevronUp,
  ChevronDown,
  Search,
  Banknote,
  User2,
  Phone,
  Landmark,
  Contact,
  CreditCard,
  IndianRupee,
} from "lucide-react";
import { ASSOCIATE, DIAMOND, GOLD, INACTIVE, SILVER } from "@/config/data";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/services/apiService";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatter";
import CustomPagination from "@/components/common/custom-pagination";

const fetchList = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/franchise-payouts/list?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const FranchiseIncomePayoutList = () => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "franchise-income-payout-list",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchList(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const payoutList = data?.payoutList || [];
  const totalPages = data?.totalPages || 1;
  const totalRecords = data?.totalRecords || 0;

  const payRepurchaseIncomeMutate = useMutation({
    mutationFn: (commissionId: number) =>
      post(`/franchise-payouts/${commissionId}/pay`),
    onSuccess: () => {
      toast.success("Franchise income commission paid successfully.");
      queryClient.invalidateQueries([
        "franchise-income-payout-list",
        currentPage,
        sortBy,
        sortOrder,
        search,
        recordsPerPage,
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to pay franchise income.");
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Franchise Payout Management
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-grow">
              <Input
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                className="w-full text-xs"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          <Separator className="mb-4" />

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="mr-2 h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Failed to load franchise payout list.
            </div>
          ) : payoutList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide select-none">
                    <TableHead
                      className="cursor-pointer px-4 py-2"
                      // Not sortable as multiple fields shown
                    >
                      MEMBER INFO
                    </TableHead>

                    <TableHead
                      className="cursor-pointer px-4 py-2"
                      onClick={() => handleSort("memberUsername")}
                    >
                      MEMBER ID
                      {sortBy === "memberUsername" && (
                        <span className="inline-block ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </span>
                      )}
                    </TableHead>

                    <TableHead
                      className="cursor-pointer px-4 py-2"
                      onClick={() => handleSort("bankAccountNumber")}
                    >
                      BANK DETAILS
                      {sortBy === "bankAccountNumber" && (
                        <span className="inline-block ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </span>
                      )}
                    </TableHead>

                    <TableHead
                      className="cursor-pointer px-4 py-2 text-right"
                      onClick={() => handleSort("totalAmountBeforeDeduction")}
                    >
                      AMOUNT
                      {sortBy === "totalAmountBeforeDeduction" && (
                        <span className="inline-block ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </span>
                      )}
                    </TableHead>

                    <TableHead className="cursor-pointer px-4 py-2 text-right font-semibold ">
                      DEDUCTED
                      {sortBy === "deductedAmount" && (
                        <span className="inline-block ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </span>
                      )}
                    </TableHead>

                    <TableHead
                      className="cursor-pointer px-4 py-2 text-right"
                      onClick={() => handleSort("totalAmountToGive")}
                    >
                      ACTUAL AMOUNT
                      {sortBy === "totalAmountToGive" && (
                        <span className="inline-block ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </span>
                      )}
                    </TableHead>

                    <TableHead className="px-4 py-2 text-center">
                      ACTION
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payoutList.map((item) => {
                    const deductedAmount =
                      (parseFloat(item?.platformChargeAmount) || 0) +
                      (parseFloat(item?.TDSAmount) || 0);

                    return (
                      <TableRow
                        key={item.id}
                        className="text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        style={{ textTransform: "uppercase" }}
                      >
                        {/* Member Info */}
                        <TableCell className="max-w-[300px] break-words whitespace-normal px-4 py-3 text-gray-800 dark:text-gray-100">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-semibold">
                              <User2 className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {(
                                  item?.member?.memberName || "-"
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                              <Contact className="w-4 h-4" />
                              <span>
                                {(
                                  item?.member?.memberEmail || "-"
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                              <Phone className="w-4 h-4" />
                              <span>
                                {(
                                  item?.member?.memberMobile || "-"
                                ).toUpperCase()}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium text-center round  ${
                                item.member.status === INACTIVE
                                  ? "bg-red-100 text-red-600"
                                  : item.member.status === ASSOCIATE
                                  ? "bg-blue-100 text-blue-600"
                                  : item.member.status === SILVER
                                  ? "bg-gray-200 text-gray-700"
                                  : item.member.status === GOLD
                                  ? "bg-yellow-200 text-yellow-800"
                                  : item.member.status === DIAMOND
                                  ? "bg-green-200 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {(item.member.status || "N/A").toUpperCase()}
                            </span>
                          </div>
                        </TableCell>

                        {/* Member Id */}
                        <TableCell className="px-4 py-3 font-semibold">
                          {(item?.member?.memberUsername || "-").toUpperCase()}
                        </TableCell>

                        {/* Bank Details */}
                        <TableCell className="px-4 py-3 text-gray-800 dark:text-gray-100 text-xs">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Landmark className="w-4 h-4" />
                              <span>
                                {(item?.member?.bankName || "-").toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              <span>
                                {(
                                  item?.member?.bankAccountNumber || "-"
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">IFSC:</span>
                              <span>
                                {(
                                  item?.member?.bankIfscCode || "-"
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">TYPE:</span>
                              <span>
                                {(
                                  item?.member?.bankAccountType || "-"
                                ).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Amount Before Deduction */}
                        <TableCell className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatCurrency(
                            item?.totalAmountBeforeDeduction
                          ).toUpperCase()}
                        </TableCell>

                        {/* Deducted Amount */}
                        <TableCell className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(deductedAmount).toUpperCase()}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatCurrency(
                            item?.totalAmountToGive
                          ).toUpperCase()}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDialogOpen(true);
                            }}
                            className="uppercase"
                          >
                            VIEW DETAILS
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
                onRecordsPerPageChange={(newLimit) => {
                  setRecordsPerPage(newLimit);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center">No records found.</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent
          className="gap-0"
          style={{ height: "97vh", overflowY: "auto" }}
        >
          <AlertDialogHeader className="m-0 p-0">
            <AlertDialogTitle className="text-sm font-bold text-pink-600 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-yellow-500" />
              Franchise Income Commission Breakdown
            </AlertDialogTitle>
            <div className="text-xs text-muted-foreground ">
              FOR - {selectedItem?.member?.memberName?.toUpperCase()} (
              {selectedItem?.member?.memberUsername?.toUpperCase()})
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              A detailed view of this member’s commission and deductions.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Separator className="!my-0 !mx-0 !p-0 !h-px" />

          {/* Taxable Income Section */}
          <div className="text-sm text-muted-foreground font-semibold pt-2">
            TAXABLE INCOME (Platform Charges
            {parseFloat(selectedItem?.TDSPercent) > 0 ? " & TDS" : ""} Apply)
          </div>

          <div className="grid grid-cols-2 gap-y-1 text-sm text-foreground">
            <div className="font-normal">Franchise Introduction Amount:</div>
            <div className="text-right text-green-600">
              {formatCurrency(selectedItem?.franchiseIntroductionAmount ?? 0)}
            </div>

            <div className="font-normal">
              Repurchase Bill Amount To Sponsor:
            </div>
            <div className="text-right text-green-600">
              {formatCurrency(selectedItem?.repurchaseBillAmountToSponsor ?? 0)}
            </div>

            {/* Conditionally render TDS fields if TDSAmount > 0 */}
            {parseFloat(selectedItem?.TDSPercent) > 0 && (
              <>
                <div className="font-normal">TDS %:</div>
                <div className="text-right">
                  {selectedItem?.TDSPercent ?? "0.00"}%
                </div>
                <div className="font-normal">TDS Amount:</div>
                <div className="text-right text-red-600">
                  {formatCurrency(selectedItem?.TDSAmount ?? 0)}
                </div>
              </>
            )}

            <div className="font-normal">Platform Charge %:</div>
            <div className="text-right">
              {selectedItem?.platformChargePercent ?? "0.00"}%
            </div>

            <div className="font-normal">Platform Charge Amount:</div>
            <div className="text-right text-red-600">
              {formatCurrency(selectedItem?.platformChargeAmount ?? 0)}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Non-Taxable Income Section */}
          <div className="text-sm text-muted-foreground font-semibold pt-2">
            NON-TAXABLE INCOME (No Deductions Applied)
          </div>

          <div className="grid grid-cols-2 gap-y-1 text-sm text-foreground">
            <div className="font-normal">Franchise Commission:</div>
            <div className="text-right text-green-600">
              {formatCurrency(selectedItem?.franchiseCommission ?? 0)}
            </div>

            <div className="font-normal">Security Deposit Return:</div>
            <div className="text-right text-green-600">
              {formatCurrency(selectedItem?.securityDepositReturn ?? 0)}
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-y-1">
              <div className="font-normal text-sm">Total Amount to Deduct:</div>
              <div className="text-right text-red-600 font-normal text-sm">
                {formatCurrency(
                  (parseFloat(selectedItem?.platformChargeAmount) ?? 0) +
                    (parseFloat(selectedItem?.TDSAmount) ?? 0)
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-1">
              <div className="font-normal text-sm">
                Amount Before Deduction:
              </div>
              <div className="text-right text-green-600 font-semibold text-sm">
                {formatCurrency(selectedItem?.totalAmountBeforeDeduction ?? 0)}
              </div>
            </div>

            <Separator className="" />

            <div className="flex mb-2 lg:mb-0 justify-between items-center text-green-600 text-sm font-semibold">
              <span>Final Amount to Give:</span>
              <span>
                {formatCurrency(selectedItem?.totalAmountToGive ?? 0)}
              </span>
            </div>
          </div>

          <AlertDialogFooter className="flex justify-between">
            <AlertDialogCancel asChild>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white hover:text-white font-medium px-3 py-1.5 rounded-md shadow text-sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="text-sm px-3 py-1.5"
                onClick={() => {
                  payRepurchaseIncomeMutate.mutate(selectedItem?.id);
                  setIsDialogOpen(false);
                }}
                disabled={payRepurchaseIncomeMutate.isPending}
              >
                {payRepurchaseIncomeMutate.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Processing
                  </>
                ) : (
                  "Give Withdrawal"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FranchiseIncomePayoutList;
