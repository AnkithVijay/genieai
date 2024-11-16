'use client'
import React from 'react';
import { useWeb3Auth } from './providers/web3Init';

export default function Home() {

  const { login, logout, getUserInfo, loggedIn } = useWeb3Auth();


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col w-full max-w-2xl gap-8 row-start-2">
        <div className="flex justify-end gap-4">
          {!loggedIn ? (
            <button
              onClick={login}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Login
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={getUserInfo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Get User Info
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}