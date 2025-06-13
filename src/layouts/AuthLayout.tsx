import { Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const AuthLayout = () => {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-10">
      <Card className="w-full max-w-8xl overflow-hidden p-0">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-0 p-0">
          <div className="p-6 md:p-10">
            <Outlet />
          </div>
          <div className="relative hidden md:block h-full min-h-[400px]">
            <img
              src="https://picsum.photos/id/1/800/600"
              alt="Illustration"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
//dfdf
