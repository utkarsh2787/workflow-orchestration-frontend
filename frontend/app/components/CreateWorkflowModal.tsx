"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { workflow_create } from "@/api_services/workflow.services";

type Props = {
    onClose: () => void;
};

export default function CreateWorkflowModal({ onClose }: Props) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const user = useSelector((state: any) => state.auth.user);

    async function handleCreate() {
        if (!name.trim()) return setError("Name is required");
        setError(null);
        setLoading(true);
        console.log("Creating workflow for user:", user);
        try {
            const res = await workflow_create(description, user?.id, name);
            const id = res.id;
            onClose();
            router.push(`/workflow/${id}`);
        } catch (err: any) {
            setError(err?.message || "Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-[#0b0b0d] border border-zinc-800 p-6 z-70 shadow-lg">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Create new workflow</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">✕</button>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-sm text-zinc-400">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" rows={4} />
                    </div>

                    {error && <div className="text-sm text-red-400">{error}</div>}

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="rounded-full px-4 py-2 border border-zinc-800 text-sm text-zinc-300">Cancel</button>
                        <button onClick={handleCreate} disabled={loading} className="rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] px-4 py-2 text-black font-semibold disabled:opacity-60">{loading ? 'Creating...' : 'Create'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
