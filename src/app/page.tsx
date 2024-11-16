"use client";
import React, { useEffect } from "react";
import { useWeb3Auth } from "./providers/web3Init";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BoxReveal from "@/components/ui/box-reveal";

export default function Home() {
  const { login, logout, loggedIn } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn) {
      router.push("/chat");
    }
  }, [loggedIn]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 relative">
      <ul className="background">
        {new Array(8).fill(null).map((_, i) => (
          <li key={i}></li>
        ))}
      </ul>
      <main className="flex flex-col justify-center items-center w-full max-w-3xl gap-12 row-start-2">
        <Image src="/logo/logo.svg" alt="logo" width={300} height={300} />
        <div className="flex flex-col justify-center items-center gap-4">
          <BoxReveal boxColor={"#892BE1"} duration={0.1}>
            <h1 className="font-bold text-primary text-4xl">
              Your AI-Powered Crypto Assistant
            </h1>
          </BoxReveal>
          <BoxReveal boxColor={"#6b7280"} duration={0.1}>
            <p className="text-lg text-gray-500">
              Discover the magic of crypto with <i>GenieAI!</i> Swap tokens,
              check balances, bridge assets, and track transactions seamlessly
              with our AI-powered assistant. Designed for beginners and pros
              alike.
            </p>
          </BoxReveal>
        </div>
        <div className="flex justify-end gap-4">
          {!loggedIn ? (
            <BoxReveal boxColor={"#892BE1"} duration={0.1}>
              <button
                onClick={login}
                className="px-6 py-2.5 bg-primary/20 text-primary rounded-full hover:bg-primary/30 font-semibold text-lg border border-primary/50 hover:border-primary"
              >
                Login with Web3Auth
              </button>
            </BoxReveal>
          ) : (
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-red-200 text-red-600 rounded-full hover:bg-red-300 font-semibold text-lg border border-red-600 hover:border-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </main>
      <footer className="absolute bottom-4 w-full text-center flex flex-row justify-center items-center gap-1 font-semibold">
        Built with ❤️ at ETHBangkok{" "}
        <Image
          src={"/ETHBangkok.svg"}
          alt="ETHBangkok"
          width={50}
          height={50}
        />
      </footer>
    </div>
  );
}
