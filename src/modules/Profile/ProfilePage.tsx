import UpdateProfile from "./UpdateProfile";
import UpdateUserProfile from "./UpdateUserProfile";

import ChangePassword from "./ChangePassword";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export function ProfilePage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser?.role || null);
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  return (
    <div className="mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Update Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          {/* <UpdateProfile /> */}
          {/* <UpdateUserProfile /> */}
          {userRole === "admin" ? <UpdateProfile /> : <UpdateUserProfile />}
        </TabsContent>
        <TabsContent value="password">
          <ChangePassword />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfilePage;
