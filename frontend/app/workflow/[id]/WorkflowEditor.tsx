"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { get_workflow_by_id } from "@/api_services/workflow.services";

type Task = {
    localId: string;
    type: "api" | "email";
    name: string;
    config: any;
};

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

export default function WorkflowEditor({ params }: { params: Promise<{ id: string }> }) {
    // id is passed from the server page as a plain string
    const { id } = use(params)

    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newType, setNewType] = useState<Task["type"]>("api");
    const [newName, setNewName] = useState("");
    const [newConfig, setNewConfig] = useState<any>({});
    const [workflowDesc, setWorkflowDesc] = useState({ name: "", description: "", createdOn: "", status: "" });

    const storageKey = `workflow:${id}:tasks`;

    useEffect(() => {
        const fetchWorkflowDetails = async () => {
            try {
                console.log("Fetching workflow details for id:", id);
                const data = await get_workflow_by_id(Number(id));
                console.log(data)
                setWorkflowDesc({
                    name: data.name,
                    description: data.description,
                    createdOn: data.created_at,
                    status: data.status,
                });
            }
            catch (err) {
                router.replace("/dashboard");
            }

        }
        fetchWorkflowDetails();
    }, [id])

    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) setTasks(JSON.parse(raw));
        } catch (e) {
            // ignore
        }
    }, [id]);

    useEffect(() => {
        // persist locally
        try {
            localStorage.setItem(storageKey, JSON.stringify(tasks));
        } catch (e) { }
    }, [tasks]);

    function openCreate(type: Task["type"]) {
        setNewType(type);
        setNewName("");
        setNewConfig({});
        setShowCreate(true);
    }

    function addTask() {
        const t: Task = {
            localId: uid(),
            type: newType,
            name: newName || `${newType === "api" ? "API call" : "Email"} task`,
            config: newType === "api" ? { url: "", token: "", outputExample: "" } : { subject: "", body: "" },
        };
        // copy any filled values from newConfig
        t.config = { ...t.config, ...newConfig };
        setTasks((s) => [...s, t]);
        setShowCreate(false);
    }

    function removeTask(localId: string) {
        setTasks((s) => s.filter((t) => t.localId !== localId));
    }

    function moveTask(localId: string, dir: number) {
        setTasks((s) => {
            const idx = s.findIndex((t) => t.localId === localId);
            if (idx === -1) return s;
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= s.length) return s;
            const arr = [...s];
            const [item] = arr.splice(idx, 1);
            arr.splice(newIdx, 0, item);
            return arr;
        });
    }

    function updateTask(localId: string, patch: Partial<Task>) {
        setTasks((s) => s.map((t) => (t.localId === localId ? { ...t, ...patch } : t)));
    }

    function updateTaskConfig(localId: string, patch: any) {
        setTasks((s) => s.map((t) => (t.localId === localId ? { ...t, config: { ...t.config, ...patch } } : t)));
    }

    function saveAndContinue() {
        // For now save is localStorage (already persisted). Optionally navigate elsewhere.
        router.refresh();
        alert("Workflow saved locally");
    }

    // helpers for email placeholders: list previous API tasks
    function apiTasksBefore(index: number) {
        return tasks.slice(0, index).filter((t) => t.type === "api");
    }

    return (
        <div className="mx-auto max-w-5xl p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Workflow {id}</h1>
                    <div className="text-sm text-zinc-400">Configure tasks for this workflow</div>

                    {/* workflow metadata */}
                    <div className="mt-2 text-sm text-zinc-400">
                        {workflowDesc.name && <div className="font-medium text-zinc-100">{workflowDesc.name}</div>}
                        {workflowDesc.description && <div className="text-xs text-zinc-400 mt-1">{workflowDesc.description}</div>}
                        <div className="text-xs text-zinc-500 mt-1">
                            Created: {workflowDesc.createdOn ? new Date(workflowDesc.createdOn).toLocaleString() : "-"} • Status: {workflowDesc.status || "-"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => openCreate("api")} className="rounded-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm">+ API task</button>
                    <button onClick={() => openCreate("email")} className="rounded-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm">+ Email task</button>
                    <button onClick={saveAndContinue} className="rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] px-4 py-2 text-black font-semibold">Save</button>
                </div>
            </div>

            <div className="space-y-4">
                {tasks.length === 0 && <div className="text-zinc-500">No tasks yet — add a task to get started.</div>}

                {tasks.map((t, idx) => (
                    <div key={t.localId} className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs text-zinc-400">{t.type.toUpperCase()} • Task {idx + 1}</div>
                                <input value={t.name} onChange={(e) => updateTask(t.localId, { name: e.target.value })} className="mt-1 bg-transparent border-b border-zinc-800 text-lg text-zinc-100 focus:outline-none" />
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => moveTask(t.localId, -1)} className="px-2 py-1 rounded border border-zinc-700">↑</button>
                                <button onClick={() => moveTask(t.localId, 1)} className="px-2 py-1 rounded border border-zinc-700">↓</button>
                                <button onClick={() => removeTask(t.localId)} className="px-2 py-1 rounded border border-red-700 text-red-400">Delete</button>
                            </div>
                        </div>

                        <div className="mt-4">
                            {t.type === "api" ? (
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="text-sm text-zinc-400">API URL</label>
                                        <input value={t.config.url || ""} onChange={(e) => updateTaskConfig(t.localId, { url: e.target.value })} className="mt-1 w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Auth token (optional)</label>
                                        <input value={t.config.token || ""} onChange={(e) => updateTaskConfig(t.localId, { token: e.target.value })} className="mt-1 w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Output example (JSON)</label>
                                        <textarea value={t.config.outputExample || ""} onChange={(e) => updateTaskConfig(t.localId, { outputExample: e.target.value })} className="mt-1 w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" rows={3} />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="text-sm text-zinc-400">Email subject</label>
                                        <input value={t.config.subject || ""} onChange={(e) => updateTaskConfig(t.localId, { subject: e.target.value })} className="mt-1 w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Email body</label>
                                        <textarea value={t.config.body || ""} onChange={(e) => updateTaskConfig(t.localId, { body: e.target.value })} className="mt-1 w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" rows={5} />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Insert value from previous API task</label>
                                        <div className="flex gap-2 mt-1">
                                            <select onChange={(e) => {
                                                const val = e.target.value;
                                                if (!val) return;
                                                // append placeholder to body
                                                const placeholder = `{{${val}.output}}`;
                                                updateTaskConfig(t.localId, { body: (t.config.body || "") + "\n" + placeholder });
                                                // reset select
                                                (e.target as HTMLSelectElement).value = "";
                                            }} className="bg-[#0b0b0b] border border-zinc-800 text-zinc-100 px-3 py-2 rounded">
                                                <option value="">-- choose API task --</option>
                                                {apiTasksBefore(idx).map((a) => (
                                                    <option key={a.localId} value={a.localId}>{a.name}</option>
                                                ))}
                                            </select>
                                            <div className="text-sm text-zinc-500 self-center">Tokens look like <code className="bg-zinc-900 px-1 py-0.5 rounded">{`{{taskId.output}}`}</code></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* create dialog simple inline */}
            {showCreate && (
                <div className="mt-6 p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg">
                    <h3 className="text-sm font-semibold">New {newType.toUpperCase()} task</h3>
                    <div className="mt-3 grid gap-3">
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Task name" className="w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />

                        {newType === "api" ? (
                            <>
                                <input value={newConfig.url || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, url: e.target.value }))} placeholder="API URL" className="w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                                <input value={newConfig.token || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, token: e.target.value }))} placeholder="Auth token (optional)" className="w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                            </>
                        ) : (
                            <>
                                <input value={newConfig.subject || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, subject: e.target.value }))} placeholder="Email subject" className="w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                            </>
                        )}

                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="px-3 py-2 rounded border border-zinc-700">Cancel</button>
                            <button onClick={addTask} className="px-3 py-2 rounded bg-gradient-to-r from-[#00ffea] to-[#6a00ff] text-black">Add task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
