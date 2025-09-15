import React from "react";
import AdminPurchaseForm from "./AdminPurchaseForm";

const CreateAdminPurchase = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Admin Purchase</h1>
      <AdminPurchaseForm mode="create" />
    </div>
  );
};

export default CreateAdminPurchase;
