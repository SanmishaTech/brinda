import React from "react";
import AdminPurchaseForm from "./AdminPurchaseForm";

const EditAdminPurchase = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Admin Purchase</h1>
      <AdminPurchaseForm mode="edit" />
    </div>
  );
};

export default EditAdminPurchase;
