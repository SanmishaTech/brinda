import React from "react";
import FranchiseStockForm from "./FranchiseStockForm";

const EditFranchiseStock = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Franchise Stock</h1>
      <FranchiseStockForm mode="edit" />
    </div>
  );
};

export default EditFranchiseStock;
