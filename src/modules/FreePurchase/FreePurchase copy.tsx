import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/services/apiService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input, Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";

import { Loader, Search, CheckCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

// Fetch all free products
const fetchFreeProducts = async () => {
  const response = await get(`/free-products?limit=1000`);
  return response?.freeProducts || [];
};

const FreePurchase = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState({});
  const navigate = useNavigate();

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["freeProducts"],
    queryFn: fetchFreeProducts,
  });

  // Handle checkbox select/deselect
  const handleSelect = (productId, quantityAvailable) => {
    setSelectedProducts((prev) => {
      const isSelected = productId in prev;
      if (isSelected) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      } else {
        return {
          ...prev,
          [productId]: {
            freeProductId: productId,
            quantity: quantityAvailable, // 👈 Set full available quantity
          },
        };
      }
    });
  };

  // Submit purchase
  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await post("/free-purchases", payload);
    },
    onSuccess: () => {
      toast.success("Free products purchased successfully.");
      setSelectedProducts({});
      queryClient.invalidateQueries(["freeProducts"]);
    },
    onError: (error) => {
      toast.error("Purchase failed. " + error?.response?.data?.errors?.message);
    },
  });

  const handleSubmitPurchase = () => {
    const freeProductDetails = Object.values(selectedProducts).map((item) => ({
      freeProductId: item.freeProductId,
      quantity: item.quantity,
    }));

    if (freeProductDetails.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    mutation.mutate({ freeProductDetails });

    navigate("/freePurchase/history");
  };

  const filteredProducts = products?.filter((product) =>
    product.product.productName
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">
        Purchase Free Products
      </h1>

      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-grow mr-4">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => navigate("/freePurchase/history")}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                View Free Purchase History
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead> Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const isSelected = selectedProducts[product.id];
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={!!isSelected}
                                onChange={() =>
                                  handleSelect(product.id, product.quantity)
                                }
                              />
                            </TableCell>
                            <TableCell>{product.product.productName}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  disabled={mutation.isPending}
                  onClick={handleSubmitPurchase}
                  className="bg-primary text-white"
                >
                  {mutation.isPending ? "Processing..." : "Purchase Selected"}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FreePurchase;
