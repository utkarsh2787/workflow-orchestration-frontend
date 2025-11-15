// ...existing code...
"use client";

import { useEffect, useState } from "react";
import DashboardActions from "../components/DashboardActions";
import { validateToken } from "@/api_services/auth.service";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { get_workflow_by_user } from "@/api_services/workflow.services";
import Link from "next/link";

export function Dashboard() {
  const dispatch = useDispatch();
  const [workflows, setWorkflows] = useState<any[]>([]);
  useEffect(() => {
    const abc = async () => {
      const user = await validateToken();
      dispatch(
        setUser({
          email: user?.user?.email,
          name: user?.user?.name,
          id: user?.user?.id,
        })
      );

      const workflows = await get_workflow_by_user();
      console.log("Fetched workflows:", workflows);
      setWorkflows(workflows);
    };
    abc();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const statusClasses = (status: string | undefined) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active":
      case "running":
        return "bg-emerald-600/20 text-emerald-300 border-emerald-700 ring-emerald-500/20";
      case "paused":
      case "idle":
        return "bg-amber-600/20 text-amber-300 border-amber-700 ring-amber-500/20";
      case "failed":
      case "error":
        return "bg-red-600/20 text-red-300 border-red-700 ring-red-500/20";
      case "completed":
      case "done":
        return "bg-sky-600/20 text-sky-300 border-sky-700 ring-sky-500/20";
      default:
        return "bg-zinc-700/30 text-zinc-300 border-zinc-700 ring-zinc-600/20";
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm md:text-base text-zinc-400">
            Overview of recent activity
          </div>
          <DashboardActions />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-zinc-400">Active workflows</div>
          <div className="mt-3 text-3xl md:text-4xl font-bold">—</div>
          <div className="mt-2 text-sm text-zinc-500">No data yet</div>
        </div>

        <div className="p-8 bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-zinc-400">Runs (last 24h)</div>
          <div className="mt-3 text-3xl md:text-4xl font-bold">—</div>
          <div className="mt-2 text-sm text-zinc-500">No runs recorded</div>
        </div>

        <div className="p-8 bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-zinc-400">Failures</div>
          <div className="mt-3 text-3xl md:text-4xl font-bold">—</div>
          <div className="mt-2 text-sm text-zinc-500">No failures</div>
        </div>
      </div>

      <section className="mt-8 bg-zinc-900/20 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
        <h2 className="text-sm md:text-base font-semibold text-zinc-100">
          Recent runs
        </h2>
        <div className="mt-4">
          {/* skeleton list */}
          <div className="space-y-3">
            <div className="animate-pulse bg-zinc-800/40 h-12 rounded w-full"></div>
            <div className="animate-pulse bg-zinc-800/40 h-12 rounded w-full"></div>
            <div className="animate-pulse bg-zinc-800/40 h-12 rounded w-full"></div>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-zinc-900/20 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base font-semibold text-zinc-100">
            Workflows
          </h2>
          <div className="text-sm text-zinc-400">{workflows.length} total</div>
        </div>

        <div className="mt-4">
          {workflows.length === 0 ? (
            <div className="text-sm text-zinc-500">No workflows yet.</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {workflows.map((wf: any) => (
                <Link
                  key={wf.id}
                  href={`/workflow/${wf.id}`}
                  className="group block p-4 hover:bg-zinc-900/50 rounded-lg transition-transform transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-4">
                        <h3 className="text-base md:text-lg font-medium text-zinc-100 truncate">
                          {wf.name || "Untitled workflow"}
                        </h3>

                        <div
                          className={`inline-flex items-center gap-3 px-3 py-1 text-sm rounded-full border ${statusClasses(
                            wf.status
                          )} shadow-[0_6px_18px_rgba(0,0,0,0.35)]`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${(() => {
                              const s = (wf.status || "").toLowerCase();
                              if (s === "active" || s === "running")
                                return "bg-emerald-400 ring-emerald-400/40";
                              if (s === "paused" || s === "idle")
                                return "bg-amber-400 ring-amber-400/40";
                              if (s === "failed" || s === "error")
                                return "bg-red-400 ring-red-400/40";
                              if (s === "completed" || s === "done")
                                return "bg-sky-400 ring-sky-400/40";
                              return "bg-zinc-500 ring-zinc-500/30";
                            })()}`}
                          />
                          <span className="capitalize">
                            {wf.status || "unknown"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-sm md:text-base text-zinc-400 truncate">
                        {wf.description || "No description"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Created: {formatDate(wf.created_at)}
                      </p>
                    </div>

                    <div className="text-sm text-zinc-500">
                      ID:{" "}
                      <span className="text-zinc-400 font-mono">{wf.id}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
// ...existing code...
