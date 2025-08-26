"use client";

import {
  IconCamera,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconPlant,
} from "@tabler/icons-react";
import Image from "next/image";
import type * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Paulinho Gatinho",
    email: "boss@world.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Projetos",
      url: "#",
      icon: IconFolder,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [],
  documents: [
    {
      name: "Webflow CMS",
      url: "#",
      icon: IconDatabase,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <IconPlant className="!size-5" />
                <span className="text-base font-semibold">Inbound Team</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <Separator className="my-2" />
        <div className="flex justify-end px-2 pb-1">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
                InLab
                <Image
                  src="/postcss.svg"
                  alt="PostCSS"
                  width={12}
                  height={12}
                  className="opacity-70"
                />
              </span>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-80">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Image src="/postcss.svg" alt="PostCSS" width={20} height={20} />
                  <h4 className="text-sm font-semibold">InLab | TRSC</h4>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "We choose to go to the Moon… not because it is easy, but because it is hard." —
                  John F. Kennedy
                </p>
                <div className="text-xs text-muted-foreground pt-2 border-t">Versão 1.0.0</div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
