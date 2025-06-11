import React from "react";
import ProductForm from "./ProductForm";

const CreateProduct = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Product</h1>
      <ProductForm mode="create" />
    </div>
  );
};

export default CreateProduct;
