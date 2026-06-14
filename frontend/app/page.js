"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[160px] opacity-10 dark:opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[160px] opacity-10 dark:opacity-20 pointer-events-none"></div>

      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/85 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            L
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400">
            Athena Library
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-zinc-150 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-850 cursor-pointer transition-all"
          >
            {theme === "dark" ? "Light Theme" : "Dark Theme"}
          </button>

          {isLoggedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 rounded-xl bg-zinc-150 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-850 transition-all cursor-pointer"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="px-5 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 max-w-4xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-blue-600 dark:text-blue-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Now Live: Full-featured Library Management
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-zinc-500 mb-6 leading-tight">
          Modern Library <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            Management System
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12 leading-relaxed font-light">
          A seamless portal for students to search and borrow books, and for administrators to manage collections, transactions, and automated fine calculations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          {isLoggedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-xl cursor-pointer transition-all"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/register")}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-xl cursor-pointer transition-all"
              >
                Register as Student
              </button>
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left w-full">
          <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-900 rounded-2xl">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">Book Inventory</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Admin can add, update details, adjust copy limits, and delete titles from the system.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-900 rounded-2xl">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">One-Click Loans</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Students can explore catalogs, view real-time availability, and borrow or return books instantly.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-900 rounded-2xl">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">Auto-Fines</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Calculates ₹5 per day automatically for any books returned past the 14-day loan period.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-8 px-6 text-center text-sm text-zinc-500 mt-20 transition-all">
        &copy; {new Date().getFullYear()} Athena Library. All rights reserved.
      </footer>
    </div>
  );
}
