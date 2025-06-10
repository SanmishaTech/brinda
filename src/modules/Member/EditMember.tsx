import React from "react";
import MemberForm from "./MemberForm";

const EditMember = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Member</h1>
      <MemberForm mode="edit" />
    </div>
  );
};

export default EditMember;
