"use client";
import { cowTokens } from "@/app/data/cow_tokens";
import { useWeb3Auth } from "@/app/providers/web3Init";
import { getActiveOrders } from "@/app/utils/cowswaputils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Copy, QrCode } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export function Profile() {
  const amounts = [104, 127, 230, 140, 130, 100, 653, 364, 389, 620];

  const { address } = useWeb3Auth();

  // useEffect(() => {
  //   getCowSwapOrders();
  // }, [address]);

  // const getCowSwapOrders = async () => {
  //   if (!address) return;
  //   const orders = await getActiveOrders(address);
  //   console.log(orders);
  // };

  return (
    <Sidebar side="right" variant="floating">
      <SidebarContent className="p-4 flex flex-col gap-8">
        <SidebarHeader className="p-0">
          <div className="bg-primary/20 text-primary rounded-lg flex flex-col justify-start items-start px-4 py-3 shadow-lg">
            <div className="flex flex-col gap-1 justify-start items-start">
              <h2 className="text-xs">Networth</h2>
              <div className="text-4xl font-black">$10,000</div>
              <div className="flex flex-row gap-2 justify-start items-center text-xs">
                <h3>vijayankith.eth</h3>
                <button>
                  <Copy size={12} />
                </button>
                <button>
                  <QrCode size={12} />
                </button>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="w-full p-0">
            <div className="border rounded-lg px-4 py-3 shadow-md w-full flex flex-col justify-start items-start">
              <div className="flex flex-col gap-3 justify-start items-start flex-grow w-full overflow-y-scroll">
                <div className="font-bold text-slate-500">Holdings</div>
                <div className="flex flex-col w-full">
                  {cowTokens.slice(0, 10).map((token: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded w-full"
                    >
                      <div className="flex items-center gap-2">
                        {token.logoURI && (
                          <Image
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-6 h-6 rounded-full"
                            width={30}
                            height={30}
                          />
                        )}
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                      <div>{amounts[idx]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}