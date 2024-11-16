import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "./providers/web3Init";
import { LangChainProvider } from "./providers/langchain";
import { WrappedEtherProvider } from "./providers/WrappedEther";
import { CowSwapProvider } from "./providers/CowSwap";
import { OneinchProvider } from "./providers/Oneinch";
import { EnsProvider } from "./providers/EnsProvider";
import { ContractInteractionProvider } from "./providers/ContractInteraction";
import Poppins from "./fonts/Poppins";

export const metadata: Metadata = {
  title: "GenieAI - Your Buddy for Crypto-Journey",
  description:
    "Discover the magic of crypto with GenieAI! Swap tokens, check balances, bridge assets, and track transactions seamlessly with our AI-powered assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Poppins.className} antialiased bg-white text-black text-center`}
      >
        <Web3Provider>
          <WrappedEtherProvider>
            <CowSwapProvider>
              <OneinchProvider>
                <EnsProvider>
                  <ContractInteractionProvider>
                    <LangChainProvider>
                      {children}
                    </LangChainProvider>
                  </ContractInteractionProvider>
                </EnsProvider>
              </OneinchProvider>
            </CowSwapProvider>
          </WrappedEtherProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
