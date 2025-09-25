import React from "react";
import FreeProductForm from "./FreeProductForm";

const CreateFreeProduct = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Free Product</h1>
      <FreeProductForm mode="create" />
    </div>
  );
};

export default CreateFreeProduct;
