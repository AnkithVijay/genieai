"use client";

import { MessageSquarePlus, Power } from "lucide-react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useWeb3Auth } from "@/app/providers/web3Init";

export function Navbar() {
  const { logout } = useWeb3Auth();
  return (
    <Sidebar variant="floating">
      <SidebarHeader className="p-4 flex justify-center items-center border-b border-gray-200 gap-2">
        <Link href={"/chat"}>
          <Image src="/logo/logo.svg" alt="logo" width={180} height={180} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-col flex-grow p-0 overflow-y-scroll">
          <SidebarGroupContent className="flex flex-col flex-grow gap-4">
            <SidebarMenu className="p-4">
              <button className="border rounded-lg p-4 flex flex-row justify-start items-center gap-2 bg-primary/20 text-primary border-primary">
                <MessageSquarePlus size={20} /> New Chat
              </button>
            </SidebarMenu>
            <div className="flex flex-col gap-3 justify-start items-start flex-grow">
              <div className="font-bold text-slate-500 px-4">Today</div>
              <div className="flex flex-col gap-2 justify-start px-4 items-start text-left w-full">
                <button className="truncate w-full bg-slate-200 px-4 py-2 rounded-lg text-left">
                  Analyze my portfolio
                </button>
                <button className="truncate w-full px-4 py-2 rounded-lg text-left">
                  What can i do with my crypto?
                </button>
                <button className="truncate w-full px-4 py-2 rounded-lg text-left">
                  What is the current price of BTC?
                </button>
                <button className="truncate w-full px-4 py-2 rounded-lg text-left">
                  What is the current price of ETH?
                </button>
                <button className="truncate w-full px-4 py-2 rounded-lg text-left">
                  I need a financial advisor
                </button>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0 m-0">
        <button
          onClick={logout}
          className="border rounded-lg p-4 m-4 text-sm flex flex-row justify-center items-center gap-2 hover:bg-red-600 hover:text-white"
        >
          <Power size={16} /> Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
