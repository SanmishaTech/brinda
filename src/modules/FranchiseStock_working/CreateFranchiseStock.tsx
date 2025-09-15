import React from "react";
import FranchiseStockForm from "./FranchiseStockForm";

const CreateFranchiseStock = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Add Franchise Stock</h1>
      <FranchiseStockForm mode="create" />
    </div>
  );
};

export default CreateFranchiseStock;
