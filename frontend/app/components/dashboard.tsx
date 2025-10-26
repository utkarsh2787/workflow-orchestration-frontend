"use client";

import { useEffect } from "react";
import DashboardActions from "../components/DashboardActions";
import { validateToken } from "@/api_services/auth.service";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";

export function Dashboard() {
    const dispatch = useDispatch();
    useEffect(() => {

        const abc = async () => {
            const user = await validateToken();
            dispatch(setUser({
                email: user?.user?.email,
                name: user?.user?.name,
                id: user?.user?.id,
            }));
        }
        abc();


    }, []);

    return (
        <div className="mx-auto max-w-6xl p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-zinc-400">Overview of recent activity</div>
                    <DashboardActions />
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-400">Active workflows</div>
                    <div className="mt-2 text-2xl font-bold">—</div>
                    <div className="mt-2 text-sm text-zinc-500">No data yet</div>
                </div>

                <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-400">Runs (last 24h)</div>
                    <div className="mt-2 text-2xl font-bold">—</div>
                    <div className="mt-2 text-sm text-zinc-500">No runs recorded</div>
                </div>

                <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
                    <div className="text-xs text-zinc-400">Failures</div>
                    <div className="mt-2 text-2xl font-bold">—</div>
                    <div className="mt-2 text-sm text-zinc-500">No failures</div>
                </div>
            </div>

            <section className="mt-6 bg-zinc-900/20 rounded-lg p-4 border border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-100">Recent runs</h2>
                <div className="mt-3">
                    {/* skeleton list */}
                    <div className="space-y-3">
                        <div className="animate-pulse bg-zinc-800/40 h-10 rounded w-full"></div>
                        <div className="animate-pulse bg-zinc-800/40 h-10 rounded w-full"></div>
                        <div className="animate-pulse bg-zinc-800/40 h-10 rounded w-full"></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
