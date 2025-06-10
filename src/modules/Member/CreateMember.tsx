import React from "react";
import MemberForm from "./MemberForm";

const CreateMember = () => {
  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Member</h1>
      <MemberForm mode="create" />
    </div>
  );
};

export default CreateMember;
