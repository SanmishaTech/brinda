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
import { DIAMOND } from "@/config/data";

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
    {
      name: "Repurchase",
      url: "/repurchase",
      icon: UsersRound,
    },
  ];

  const adminProjects = [
    {
      name: "Products",
      url: "/products",
      icon: UsersRound,
    },
    {
      name: "Members",
      url: "/members",
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
          title: "Paid matching Payout",
          url: "/commissions/adminPaidCommissions",
        },
        {
          title: "Paid Repurchase Payout",
          url: "/commissions/adminPaidRepurchaseCommissions",
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
                <div className="flex flex-col">
                  <span className="text-base font-semibold">{appName}</span>
                  <span className="text-xs font-semibold">ID: {username}</span>
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
