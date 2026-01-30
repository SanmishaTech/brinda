// "use client";

// import * as React from "react";
// import {
//   ArrowUpCircleIcon,
//   AudioWaveform,
//   BookOpen,
//   Bot,
//   Command,
//   UsersRound,
//   GalleryVerticalEnd,
//   Map,
//   PieChart,
//   Settings2,
//   SquareTerminal,
//   Icon,
// } from "lucide-react";
// import { get } from "@/services/apiService";

// import { NavMain } from "@/components/common/nav-main";
// import { NavProjects } from "@/components/common/nav-projects";
// import { NavUser } from "@/components/common/nav-user";
// // import { TeamSwitcher } from "@/components/common/team-switcher"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import { appName } from "@/config";
// import { DIAMOND } from "@/config/data";
// import { useQuery } from "@tanstack/react-query";

// const fetchProfileStatus = async () => {
//   const res = await get("/profile/status");
//   return res;
// };

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const { data: profileData, isLoading } = useQuery({
//     queryKey: ["profile-status"],
//     queryFn: fetchProfileStatus,
//   });

//   const userStatus = profileData?.status;
//   const username = profileData?.memberUsername || "";

//   const isDiamond = userStatus === DIAMOND;

//   // satrt
//   // This is sample data.
//   const initialData = {
//     roles: {
//       member: {
//         projects: [
//           // Only include Purchase if not Diamond
//           ...(!isDiamond
//             ? [
//                 {
//                   name: "Purchase",
//                   url: "/purchase",
//                   icon: UsersRound,
//                 },
//               ]
//             : []),
//           {
//             name: "My Direct List",
//             url: "/member/directReferrals",
//             icon: UsersRound,
//           },
//           // {
//           //   name: "Member Logs",
//           //   url: "/member/logs",
//           //   icon: UsersRound,
//           // },
//           {
//             name: "Genealogy",
//             url: "/genealogy",
//             icon: UsersRound,
//           },
//         ],
//         //   navMain: [
//         //     {
//         //       title: "Masters",
//         //       url: "#",
//         //       icon: SquareTerminal,
//         //       isActive: true,
//         //       items: [
//         //         { title: "Country", url: "/countries" },
//         //         { title: "State", url: "./states" },
//         //         { title: "City", url: "/cities" },
//         //       ],
//         //     },
//         //   ],
//       },
//       admin: {
//         projects: [
//           {
//             name: "Products",
//             url: "/products",
//             icon: UsersRound,
//           },
//           {
//             name: "Members",
//             url: "/members",
//             icon: UsersRound,
//           },
//         ],
//         navMain: [
//           {
//             title: "Commissions",
//             url: "#",
//             icon: SquareTerminal,
//             isActive: false,
//             items: [
//               {
//                 title: "Matching Payout",
//                 url: "/commissions/matchingIncomePayout",
//               },
//               {
//                 title: "Admin Paid",
//                 url: "/commissions/adminPaidCommissions",
//               },
//             ],
//           },
//         ],
//       },
//     },
//     user: {
//       name: "",
//       email: "",
//       avatar: "",
//       avatarName: "",
//     },
//     teams: [
//       {
//         name: "Acme Inc",
//         logo: GalleryVerticalEnd,
//         plan: "Enterprise",
//       },
//       {
//         name: "Acme Corp.",
//         logo: AudioWaveform,
//         plan: "Startup",
//       },
//       {
//         name: "Evil Corp.",
//         logo: Command,
//         plan: "Free",
//       },
//     ],
//   };
//   // end

//   const [data, setData] = React.useState({
//     ...initialData,
//     projects: [],
//     navMain: [],
//   });

//   React.useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         parsedUser.avatarName = parsedUser.name.charAt(0).toUpperCase();
//         const role = parsedUser.role || "admin";
//         const roleData = initialData.roles[role];

//         setData((prevData) => ({
//           ...prevData,
//           projects: roleData?.projects || [],
//           navMain: roleData?.navMain || [],
//           user: parsedUser,
//         }));
//       } catch (error) {
//         console.error("Failed to parse user from localStorage", error);
//       }
//     }
//   }, []);

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         {/* <TeamSwitcher teams={data.teams} /> */}
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               asChild
//               className="data-[slot=sidebar-menu-button]:!p-1.5 h-10"
//             >
//               {/* <a href="/dashboard">
//                 <ArrowUpCircleIcon className="h-5 w-5" />
//                 <span className="text-base font-semibold">{appName}</span>
//               </a> */}
//               <a href="/dashboard" className="flex mt-2 items-center space-x-2">
//                 <ArrowUpCircleIcon className="h-5 w-5" />
//                 <div className="flex flex-col">
//                   <span className="text-base font-semibold">{appName}</span>
//                   <span className="text-xs font-semibold">ID: {username}</span>
//                 </div>
//               </a>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavProjects projects={data.projects || []} />
//         <NavMain items={data.navMain || []} />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   );
// }
"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  AudioWaveform,
  Command,
  UsersRound,
  GalleryVerticalEnd,
  SquareTerminal,
  Loader,
} from "lucide-react";
import { get } from "@/services/apiService";
import { useQuery } from "@tanstack/react-query";

import { NavMain } from "@/components/common/nav-main";
import { NavProjects } from "@/components/common/nav-projects";
import { NavUser } from "@/components/common/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { appName } from "@/config";
import { ASSOCIATE, DIAMOND, INACTIVE, SILVER } from "@/config/data";
import { Badge } from "@/components/ui/badge";

// Fetch profile status API
const fetchProfileStatus = async () => {
  const res = await get("/profile/status");
  return res;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile-status"],
    queryFn: fetchProfileStatus,
  });

  // Role fallback from localStorage
  const role =
    typeof window !== "undefined" && localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!).role
      : "admin";
  const username =
    typeof window !== "undefined" && localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!).username
      : "admin";

  const userStatus = profileData?.status;
  const isFranchise = profileData?.isFranchise;
  // const username = profileData?.memberUsername || "";
  const isDiamond = userStatus === DIAMOND;

  const user = {
    name: username,
    avatarName: username?.charAt(0).toUpperCase() || "",
  };

  // Role-based sidebar items
  const memberProjects = [
    ...(!isDiamond && !isLoading
      ? [
          {
            name: "Purchase",
            url: "/purchase",
            icon: UsersRound,
          },
        ]
      : []),
    {
      name: "My Direct List",
      url: "/member/directReferrals",
      icon: UsersRound,
    },
    {
      name: "Genealogy",
      url: "/genealogy",
      icon: UsersRound,
    },
    ...(![INACTIVE].includes(userStatus) && !isLoading
      ? [
          {
            name: "Repurchase",
            url: "/repurchase",
            icon: UsersRound,
          },
        ]
      : []),
    {
      name: "Awards & Rewards",
      url: "/rewards",
      icon: UsersRound,
    },
    {
      name: "Free Purchases",
      url: "/FreePurchase",
      icon: UsersRound,
    },
    ...(isFranchise
      ? [
          {
            name: "Franchise Dashboard",
            url: "/franchiseDashboard",
            icon: UsersRound,
          },
          {
            name: "Franchise Stock",
            url: "/memberFranchiseStockList",
            icon: UsersRound,
          },
        ]
      : []),
  ];

  const adminProjects = [
    {
      name: "Products",
      url: "/products",
      icon: UsersRound,
    },
    {
      name: "Free Products",
      url: "/freeProducts",
      icon: UsersRound,
    },

    {
      name: "Members",
      url: "/members",
      icon: UsersRound,
    },
    {
      name: "Member Wallet List",
      url: "/walletDetails/export",
      icon: UsersRound,
    },
    {
      name: "Virtual Power History",
      url: "/virtual-power/history",
      icon: UsersRound,
    },
    {
      name: "Admin Purchase",
      url: "/adminPurchase",
      icon: UsersRound,
    },
    {
      name: "Franchise Stock",
      url: "/franchiseStock",
      icon: UsersRound,
    },
    {
      name: "purchase Orders",
      url: "/purchaseList",
      icon: UsersRound,
    },
    {
      name: "repurchase Orders",
      url: "/repurchaseList",
      icon: UsersRound,
    },
    {
      name: "Free Purchase Orders",
      url: "/freePurchaseList",
      icon: UsersRound,
    },
  ];

  const adminNavMain = [
    {
      title: "Commissions",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          title: "Matching Payout",
          url: "/commissions/matchingIncomePayout",
        },
        {
          title: "Repurchase Payout",
          url: "/commissions/repurchaseIncomePayout",
        },
        {
          title: "Reward Payout",
          url: "/commissions/rewardIncomePayout",
        },
        {
          title: "Franchise Payout",
          url: "/commissions/franchiseIncomePayout",
        },
        {
          title: "Paid matching Payout",
          url: "/commissions/adminPaidCommissions",
        },
        {
          title: "Paid Repurchase Payout",
          url: "/commissions/adminPaidRepurchaseCommissions",
        },
        {
          title: "Paid Reward Payout",
          url: "/commissions/adminPaidRewardCommissions",
        },
        {
          title: "Paid Franchise Payout",
          url: "/commissions/adminPaidFranchiseCommissions",
        },
      ],
    },
  ];

  const projects = role === "admin" ? adminProjects : memberProjects;
  const navMain = role === "admin" ? adminNavMain : [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-10"
            >
              <a href="/dashboard" className="flex mt-2 items-center space-x-2">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <div className="flex mb-1 flex-col">
                  <span className="text-base font-semibold">{appName}</span>
                  <div className="flex items-center  space-x-2">
                    <span className="text-xs font-semibold">ID: {username}</span>
                    {isLoading ? (
                      <Loader className="h-4 w-4 text-muted-foreground animate-spin" />
                    ) : (
                      <Badge
                        className={
                          // map status to background styles
                          userStatus === DIAMOND
                            ? "bg-green-500 text-white"
                            : userStatus === "Gold" || userStatus === "gold" || userStatus === "GOLD"
                            ? "bg-yellow-500 text-white"
                            : userStatus === SILVER
                            ? "bg-slate-400 text-white"
                            : userStatus === ASSOCIATE
                            ? "bg-blue-500 text-white"
                            : userStatus === INACTIVE
                            ? "bg-red-500 text-white"
                            : "bg-gray-400 text-white"
                        }
                      >
                        {userStatus || "N/A"}
                      </Badge>
                    )}
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <div className="px-4 text-sm text-muted-foreground animate-pulse">
            <Loader />
          </div>
        ) : (
          <NavProjects projects={projects} />
        )}

        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
