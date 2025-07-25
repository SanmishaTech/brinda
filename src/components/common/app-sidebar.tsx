"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  UsersRound,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Icon,
} from "lucide-react";

import { NavMain } from "@/components/common/nav-main";
import { NavProjects } from "@/components/common/nav-projects";
import { NavUser } from "@/components/common/nav-user";
// import { TeamSwitcher } from "@/components/common/team-switcher"
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
const UserData = JSON.parse(localStorage.getItem("user") || "{}");
const username = UserData?.username;
// This is sample data.
const initialData = {
  roles: {
    member: {
      projects: [
        {
          name: "Purchase",
          url: "/purchase",
          icon: UsersRound,
        },
        {
          name: "Repurchase",
          url: "/repurchase",
          icon: UsersRound,
        },
        {
          name: "My Direct List",
          url: "/member/directReferrals",
          icon: UsersRound,
        },
        // {
        //   name: "Member Logs",
        //   url: "/member/logs",
        //   icon: UsersRound,
        // },
        {
          name: "Genealogy",
          url: "/genealogy",
          icon: UsersRound,
        },
      ],
      //   navMain: [
      //     {
      //       title: "Masters",
      //       url: "#",
      //       icon: SquareTerminal,
      //       isActive: true,
      //       items: [
      //         { title: "Country", url: "/countries" },
      //         { title: "State", url: "./states" },
      //         { title: "City", url: "/cities" },
      //       ],
      //     },
      //   ],
    },
    admin: {
      projects: [
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
      ],
      navMain: [
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
              title: "Admin Paid",
              url: "/commissions/adminPaidCommissions",
            },
          ],
        },
      ],
    },
  },
  user: {
    name: "",
    email: "",
    avatar: "",
    avatarName: "",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = React.useState({
    ...initialData,
    projects: [],
    navMain: [],
  });

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.avatarName = parsedUser.name.charAt(0).toUpperCase();
        const role = parsedUser.role || "admin";
        const roleData = initialData.roles[role];

        setData((prevData) => ({
          ...prevData,
          projects: roleData?.projects || [],
          navMain: roleData?.navMain || [],
          user: parsedUser,
        }));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-10"
            >
              {/* <a href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">{appName}</span>
              </a> */}
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
        <NavProjects projects={data.projects || []} />
        <NavMain items={data.navMain || []} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
