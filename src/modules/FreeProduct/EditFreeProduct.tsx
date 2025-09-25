import React from "react";
import FreeProductForm from "./FreeProductForm";

const EditFreeProduct = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Free Product</h1>
      <FreeProductForm mode="edit" />
    </div>
  );
};

export default EditFreeProduct;
