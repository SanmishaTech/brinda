import React from "react";
import ProductForm from "./ProductForm";

const EditProduct = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm mode="edit" />
    </div>
  );
};

export default EditProduct;
