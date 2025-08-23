import { AppSidebar } from "@/components/common/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sun, Moon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { get, del, patch, post } from "@/services/apiService";

import { toast } from "sonner";
import WalletButton from "@/modules/Wallet/WalletMenu";
interface RouteConfig {
  parent?: string;
  label: string;
  path: string;
}

const ROUTE_MAP: Record<string, RouteConfig> = {
  users: {
    parent: "Management",
    label: "Users",
    path: "/users",
  },
  agencies: {
    parent: "Management",
    label: "Agencies",
    path: "/agencies",
  },
  packages: {
    parent: "Masters",
    label: "Packages",
    path: "/packages",
  },
  countries: {
    parent: "Masters",
    label: "Countries",
    path: "/countries",
  },
  states: {
    parent: "Masters",
    label: "States",
    path: "/states",
  },
  cities: {
    parent: "Masters",
    label: "Cities",
    path: "/cities",
  },
  sectors: {
    parent: "Masters",
    label: "Sectors",
    path: "/sectors",
  },
  branches: {
    parent: "Masters",
    label: "Branches",
    path: "/branches",
  },
};

export default function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // If no saved preference, check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Get user data from localStorage
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Effect to sync dark mode state with HTML class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Effect to listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const location = useLocation();

  const getBreadcrumbs = () => {
    const currentPath = location.pathname.split("/").filter(Boolean)[0];

    // If the current path is in our route map and has a parent
    const route = ROUTE_MAP[currentPath];
    if (route && route.parent) {
      return [
        {
          label: route.parent,
          path: "",
          isLast: false,
        },
        {
          label: route.label,
          path: route.path,
          isLast: true,
        },
      ];
    }

    // Default fallback for unmapped routes
    return [
      {
        label: currentPath
          ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1)
          : "Home",
        path: `/${currentPath}`,
        isLast: true,
      },
    ];
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };
  const navigate = useNavigate();

  // const handleBackToAdmin = async () => {
  //   try {
  //     const response = post("/auth/back-to-admin"); // Make sure this is a POST request

  //     const { token, user } = response;

  //     // Update localStorage with original admin info
  //     localStorage.setItem("authToken", token);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     localStorage.removeItem("isImpersonating");

  //     toast.success("Returned to admin account");
  //     window.location.href = "/dashboard"; // Force reload to re-initialize auth context if any
  //   } catch (error: any) {
  //     toast.error(error?.message || "Failed to return to admin");
  //     console.error("Back to Admin Error:", error);
  //   }
  // };
  const backToAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await post("/auth/back-to-admin");
      return response;
    },

    onSuccess: (data) => {
      console.log("✅ Returned to admin:", data);

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("isImpersonating");

      toast.success("Returned to admin account");

      window.location.href = "/dashboard"; // Reload to refresh auth context
    },

    onError: (error: any) => {
      toast.error(error?.message || "Failed to return to admin");
      console.error("❌ Back to admin error:", error);
    },
  });

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky Header */}
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background shadow-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full justify-between">
              {/* Sidebar Trigger and Breadcrumb */}
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {getBreadcrumbs().map((crumb, index) => (
                      <div key={crumb.path} className="flex items-center">
                        <BreadcrumbItem className="hidden md:block">
                          {crumb.isLast ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.path}>
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!crumb.isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div>
                <div className="flex items-center gap-2 w-full justify-between">
                  {localStorage.getItem("isImpersonating") === "true" && (
                    <Button
                      onClick={() => {
                        backToAdminMutation.mutate();
                      }}
                      variant="outline"
                      className="ml-2"
                    >
                      Back to Admin
                    </Button>
                  )}
                  {!isAdmin && <WalletButton />}
                  {/* Dark Mode Switcher */}
                  <Button
                    onClick={toggleDarkMode}
                    className="size-7 cursor-pointer"
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Moon /> : <Sun />}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="pt-2 overflow-x-hidden">
            <div className="px-1 sm:px-3 overflow-x-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
