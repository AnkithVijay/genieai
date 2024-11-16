"use client";
import React, { useEffect } from "react";
import { useWeb3Auth } from "./providers/web3Init";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { login, logout, loggedIn } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn) {
      router.push("/chat");
    }
  }, [loggedIn]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col justify-center items-center w-full max-w-3xl gap-12 row-start-2">
        <Image src="/logo/logo1.svg" alt="logo" width={300} height={300} />
        <div className="flex flex-col justify-center items-center gap-4">
          <h1 className="font-bold text-primary text-4xl">
            Your AI-Powered Crypto Assistant
          </h1>
          <p className="text-lg text-gray-500">
            Discover the magic of crypto with <i>GenieFi!</i> Swap tokens, check
            balances, bridge assets, and track transactions seamlessly with our
            AI-powered assistant. Designed for beginners and pros alike.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          {!loggedIn ? (
            <button
              onClick={login}
              className="px-6 py-2.5 bg-primary/20 text-primary rounded-full hover:bg-primary/30 font-semibold text-lg border border-primary/50 hover:border-primary"
            >
              Login with Web3Auth
            </button>
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
    </div>
  );
}
