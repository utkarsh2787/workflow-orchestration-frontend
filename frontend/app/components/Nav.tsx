"use client";

import { logout } from "@/api_services/auth.service";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Nav() {
    const pathname = usePathname() || "/";
    const publicPaths = ["/", "/login", "/register"];
    const isPublic = publicPaths.includes(pathname);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!menuRef.current) return;
            if (menuRef.current.contains(e.target as Node)) return;
            setMenuOpen(false);
        }

        if (menuOpen) document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [menuOpen]);

    // Public simple nav (home/login/register)
    if (isPublic) {
        return (
            <nav className="mx-auto flex max-w-6xl items-center justify-between p-4 px-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-[#00ffea] to-[#6a00ff] flex items-center justify-center text-black font-bold">W</div>
                    <div className="hidden sm:block">
                        <div className="text-sm font-semibold">Workflow Orchestration</div>
                        <div className="text-xs text-zinc-400">Schedule · Automate · Observe</div>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm text-zinc-300 hover:text-zinc-100">Login</Link>
                    <Link href="/register" className="text-sm text-zinc-300 hover:text-zinc-100">Register</Link>
                </div>
            </nav>
        );
    }

    // Authenticated-style nav (avatar on left + menu)
    return (
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-4 px-6">
            <div className="flex items-center gap-3">
                <div className="relative" ref={menuRef}>
                    <button
                        aria-label="Open user menu"
                        onClick={() => setMenuOpen((s) => !s)}
                        className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00ffea] to-[#6a00ff] flex items-center justify-center text-black font-semibold shadow-md"
                    >
                        U
                    </button>

                    {menuOpen && (
                        <div className="absolute left-0 top-12 w-48 rounded-xl bg-[#0b0b0d] border border-zinc-800 shadow-lg py-2 z-50">
                            <Link href="/profile" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">Edit profile</Link>
                            <Link href="/workflows" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">Workflows</Link>
                            <Link href="/settings" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">Settings</Link>
                            <div className="border-t border-zinc-800 my-1" />
                            <button onClick={async () => {
                                await logout();
                                router.refresh();

                            }} className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">Logout</button>
                        </div>
                    )}
                </div>

                <div className="hidden sm:block">
                    <div className="text-sm font-semibold">Your workspace</div>
                    <div className="text-xs text-zinc-400">Welcome back</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-zinc-100">Dashboard</Link>
                <Link href="/workflows" className="text-sm text-zinc-300 hover:text-zinc-100">Workflows</Link>
                <Link href="/runs" className="text-sm text-zinc-300 hover:text-zinc-100">Runs</Link>
            </div>
        </nav>
    );
}
