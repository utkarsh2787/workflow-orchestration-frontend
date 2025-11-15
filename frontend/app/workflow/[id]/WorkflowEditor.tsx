"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { get_workflow_by_id } from "@/api_services/workflow.services";
import { task_create_bulk } from "@/api_services/task.service";

type Task = {
    localId: string;
    type: "api" | "email";
    name: string;
    config: any;
};

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

// status styling helpers (high-tech badges)
const statusClasses = (status?: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
        case "active":
        case "running":
            return "bg-emerald-700/20 text-emerald-200 border-emerald-600 ring-emerald-500/20 backdrop-blur-sm";
        case "paused":
        case "idle":
            return "bg-amber-700/20 text-amber-200 border-amber-600 ring-amber-500/20 backdrop-blur-sm";
        case "failed":
        case "error":
            return "bg-red-700/20 text-red-200 border-red-600 ring-red-500/20 backdrop-blur-sm";
        case "completed":
        case "done":
            return "bg-sky-700/20 text-sky-200 border-sky-600 ring-sky-500/20 backdrop-blur-sm";
        default:
            return "bg-zinc-800/30 text-zinc-300 border-zinc-700 ring-zinc-600/20 backdrop-blur-sm";
    }
};

const statusDotClass = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "running") return "bg-emerald-400 ring-emerald-400/40";
    if (s === "paused" || s === "idle") return "bg-amber-400 ring-amber-400/40";
    if (s === "failed" || s === "error") return "bg-red-400 ring-red-400/40";
    if (s === "completed" || s === "done") return "bg-sky-400 ring-sky-400/40";
    return "bg-zinc-500 ring-zinc-500/30";
};

const statusPulse = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "active" || s === "running" ? "animate-pulse" : "";
};

// helpers for JSON validation/parsing
const tryParseJSON = (val: any) => {
    if (val === undefined || val === null) return null;
    if (typeof val === "object") return val;
    if (typeof val !== "string") return null;
    try {
        return JSON.parse(val);
    } catch {
        return null;
    }
};

const isJSONObject = (val: any) => {
    const parsed = tryParseJSON(val);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
};

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
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

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

    function openCreate(type: Task["type"]) {
        if (saved) {
            alert("Workflow is saved. Click Edit to modify tasks.");
            return;
        }
        setNewType(type);
        setNewName("");
        setNewConfig({});
        setShowCreate(true);
    }

    function addTask() {
        const missing = validateNewTask();
        if (missing.length) {
            alert("Please fill required fields: " + missing.join(", "));
            return;
        }

        const t: Task = {
            localId: uid(),
            type: newType,
            name: newName || `${newType === "api" ? "API call" : "Email"} task`,
            // include request method for API tasks (default GET)
            config: newType === "api" ? { url: "", token: "", outputExample: "", method: "GET", requestBody: "" } : { subject: "", body: "", recipientlist: "" },
        };
        // copy any filled values from newConfig
        t.config = { ...t.config, ...newConfig };
        setTasks((s) => [...s, t]);
        setSaved(false);
        setShowCreate(false);
    }

    function removeTask(localId: string) {
        setTasks((s) => s.filter((t) => t.localId !== localId));
        setSaved(false);
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
            setSaved(false);
            return arr;
        });
    }

    function updateTask(localId: string, patch: Partial<Task>) {
        setTasks((s) => s.map((t) => (t.localId === localId ? { ...t, ...patch } : t)));
        setSaved(false);
    }

    function updateTaskConfig(localId: string, patch: any) {
        setTasks((s) => s.map((t) => (t.localId === localId ? { ...t, config: { ...t.config, ...patch } } : t)));
        setSaved(false);
    }

    // helper to validate the create dialog inputs
    const validateNewTask = () => {
        const e: string[] = [];
        if (!newName || !newName.toString().trim()) e.push("name");
        if (newType === "api") {
            if (!newConfig || !newConfig.url || !newConfig.url.toString().trim()) e.push("url");
            if (!newConfig || !newConfig.outputExample || !newConfig.outputExample.toString().trim()) e.push("outputExample");
            else if (!isJSONObject(newConfig.outputExample)) e.push("outputExample (invalid JSON - must be an object)");
            // if POST, require request body
            if ((newConfig?.method || "GET").toUpperCase() === "POST") {
                if (!newConfig || !newConfig.requestBody || !newConfig.requestBody.toString().trim()) e.push("requestBody");
                else if (!isJSONObject(newConfig.requestBody)) e.push("requestBody (invalid JSON - must be an object)");
            }
        } else {
            if (!newConfig || !newConfig.recipientlist || !newConfig.recipientlist.toString().trim()) e.push("recipientlist");
            if (!newConfig || !newConfig.subject || !newConfig.subject.toString().trim()) e.push("subject");
            if (!newConfig || !newConfig.body || !newConfig.body.toString().trim()) e.push("body");
        }
        return e;
    };

    function validateTasks() {
        const errs: Record<string, string[]> = {};
        tasks.forEach((t) => {
            const e: string[] = [];
            if (!t.name || !t.name.toString().trim()) e.push("name");
            if (t.type === "api") {
                if (!t.config || !t.config.url || !t.config.url.toString().trim()) e.push("url");
                if (!t.config || !t.config.outputExample || !t.config.outputExample.toString().trim()) e.push("outputExample");
                else if (!isJSONObject(t.config.outputExample)) e.push("outputExample (invalid JSON - must be an object)");
                // if POST, require request body
                if ((t.config?.method || "GET").toUpperCase() === "POST") {
                    if (!t.config || !t.config.requestBody || !t.config.requestBody.toString().trim()) e.push("requestBody");
                    else if (!isJSONObject(t.config.requestBody)) e.push("requestBody (invalid JSON - must be an object)");
                }
            } else if (t.type === "email") {
                if (!t.config || !t.config.recipientlist || !t.config.recipientlist.toString().trim()) e.push("recipientlist");
                if (!t.config || !t.config.subject || !t.config.subject.toString().trim()) e.push("subject");
                if (!t.config || !t.config.body || !t.config.body.toString().trim()) e.push("body");
            }
            if (e.length) errs[t.localId] = e;
        });
        return { valid: Object.keys(errs).length === 0, errs };
    }

    async function saveAndContinue() {
        // validate first
        if (saving) return;
        const { valid, errs } = validateTasks();
        if (!valid) {
            setErrors(errs);
            // focus first invalid task
            const firstId = Object.keys(errs)[0];
            const el = document.getElementById(`task-${firstId}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            alert("Please fix missing required fields before saving.");
            return;
        }

        setErrors({});
        setSaving(true);
        try {
            const payload = tasks.map((t, idx) => ({
                name: t.name,
                workflow_id: Number(id),
                // inputs: for API tasks include apiurl, type (method), body, token
                // for email tasks include recipientlist, subject, body
                inputs: t.type === "api" ? {
                    apiurl: t.config?.url || "",
                    type: (t.config?.method || "GET").toUpperCase(),
                    body: (t.config?.method || "GET").toUpperCase() === "POST" ? tryParseJSON(t.config?.requestBody) : null,
                    token: t.config?.token || null,
                } : t.type === "email" ? {
                    recipientlist: t.config?.recipientlist || "",
                    subject: t.config?.subject || "",
                    body: t.config?.body || "",
                } : null,
                // schema contains the output example as an object
                output_schema: tryParseJSON(t.config?.outputExample) || null,
                taskType: t.type,
                order: idx,
            }));
            const data = await task_create_bulk(payload);
            console.log("Bulk tasks created:", data);


            router.refresh();
            // persist snapshot locally as a single bulk save (optional draft)
            try {
                localStorage.setItem(storageKey, JSON.stringify(tasks));
            } catch (e) { /* ignore */ }
            setSaved(true);
            alert("Workflow tasks saved");
        } catch (err: any) {
            console.error("Error saving tasks:", err);
            alert("Failed to save tasks: " + (err?.message || err));
        } finally {
            setSaving(false);
        }
    }

    // helpers for email placeholders: list previous API tasks
    function apiTasksBefore(index: number) {
        return tasks.slice(0, index).map((e, idx) => ({
            ...e, index: idx
        })).filter((t) => t.type === "api");
    }

    return (
        <div className="mx-auto max-w-5xl p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Workflow {id}</h1>
                    <div className="text-sm text-zinc-400">Configure tasks for this workflow</div>

                    {/* workflow metadata - replaced with highlighted status badge */}
                    <div className="mt-2 text-sm text-zinc-400">
                        {workflowDesc.name && <div className="font-medium text-xl text-zinc-100">{workflowDesc.name}</div>}
                        {workflowDesc.description && <div className="text-sm text-zinc-400 mt-1">{workflowDesc.description}</div>}

                        <div className="mt-3 flex items-center gap-4">
                            <div className="text-xs text-zinc-500">Created: {workflowDesc.createdOn ? new Date(workflowDesc.createdOn).toLocaleString() : "-"}</div>

                            <div className={`inline-flex items-center gap-3 px-3 py-1.5 text-sm rounded-full border ${statusClasses(workflowDesc.status)} shadow-[0_10px_30px_rgba(2,6,23,0.6)]`}>
                                <span className={`w-3.5 h-3.5 rounded-full border-2 border-transparent ${statusDotClass(workflowDesc.status)} ${statusPulse(workflowDesc.status)}`}></span>
                                <span className="font-semibold capitalize tracking-wide">{workflowDesc.status || "unknown"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => openCreate("api")} disabled={saved} className={`rounded-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm ${saved ? "opacity-50 cursor-not-allowed" : ""}`}>+ API task</button>
                    <button onClick={() => openCreate("email")} disabled={saved} className={`rounded-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm ${saved ? "opacity-50 cursor-not-allowed" : ""}`}>+ Email task</button>
                    {saved ? (
                        <>
                            <div className="px-4 py-2 rounded bg-zinc-800 text-sm text-emerald-300">Saved</div>
                            <button onClick={() => setSaved(false)} className="rounded-full px-4 py-2 bg-zinc-700 border border-zinc-600 text-sm">Edit</button>
                        </>
                    ) : (
                        <button
                            onClick={saveAndContinue}
                            disabled={saving}
                            className={`rounded-full px-4 py-2 font-semibold transition ${saving ? "opacity-60 cursor-not-allowed bg-zinc-700" : "bg-linear-to-r from-[#00ffea] to-[#6a00ff] text-black"}`}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {tasks.length === 0 && <div className="text-zinc-500">No tasks yet — add a task to get started.</div>}

                {tasks.map((t, idx) => (
                    <div id={`task-${t.localId}`} key={t.localId} className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs text-zinc-400">{t.type.toUpperCase()} • Task {idx + 1}</div>
                                <input disabled={saved} value={t.name} onChange={(e) => updateTask(t.localId, { name: e.target.value })} className={`mt-1 bg-transparent border-b ${errors[t.localId]?.includes("name") ? "border-red-600" : "border-zinc-800"} text-lg text-zinc-100 focus:outline-none ${saved ? "opacity-60 cursor-not-allowed" : ""}`} />
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
                                        <label className="text-sm text-zinc-400">Request method</label>
                                        <select disabled={saved} value={t.config?.method || "GET"} onChange={(e) => updateTaskConfig(t.localId, { method: e.target.value })} className="mt-1 w-40 rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100">
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">API URL</label>
                                        <input disabled={saved} value={t.config.url || ""} onChange={(e) => updateTaskConfig(t.localId, { url: e.target.value })} className={`mt-1 w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${errors[t.localId]?.includes("url") ? "border border-red-600" : "border border-zinc-800"} ${saved ? "opacity-60 cursor-not-allowed" : ""}`} />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Auth token (optional)</label>
                                        <input disabled={saved} value={t.config.token || ""} onChange={(e) => updateTaskConfig(t.localId, { token: e.target.value })} className="mt-1 w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Output example (JSON)</label>
                                        <textarea disabled={saved} value={t.config.outputExample || ""} onChange={(e) => updateTaskConfig(t.localId, { outputExample: e.target.value })} className={`mt-1 w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${errors[t.localId]?.includes("outputExample") ? "border border-red-600" : "border border-zinc-800"} ${saved ? "opacity-60 cursor-not-allowed" : ""}`} rows={3} />
                                    </div>

                                    {/* request body for POST */}
                                    {t.config?.method === "POST" && (
                                        <div>
                                            <label className="text-sm text-zinc-400">Request body (JSON)</label>
                                            <textarea disabled={saved} value={t.config.requestBody || ""} onChange={(e) => updateTaskConfig(t.localId, { requestBody: e.target.value })} className={`mt-1 w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${errors[t.localId]?.includes("requestBody") ? "border border-red-600" : "border border-zinc-800"} ${saved ? "opacity-60 cursor-not-allowed" : ""}`} rows={4} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <label className="text-sm text-zinc-400">Recipient list</label>
                                        <input disabled={saved} value={t.config.recipientlist || ""} onChange={(e) => updateTaskConfig(t.localId, { recipientlist: e.target.value })} className={`mt-1 w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${errors[t.localId]?.includes("recipientlist") ? "border border-red-600" : "border border-zinc-800"} ${saved ? "opacity-60 cursor-not-allowed" : ""}`} placeholder="email1@example.com, email2@example.com" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Email subject</label>
                                        <input disabled={saved} value={t.config.subject || ""} onChange={(e) => updateTaskConfig(t.localId, { subject: e.target.value })} className={`mt-1 w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${errors[t.localId]?.includes("subject") ? "border border-red-600" : "border border-zinc-800"} ${saved ? "opacity-60 cursor-not-allowed" : ""}`} />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Email body</label>
                                        <textarea disabled={saved} value={t.config.body || ""} onChange={(e) => updateTaskConfig(t.localId, { body: e.target.value })} className={`mt-1 w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${errors[t.localId]?.includes("body") ? "border border-red-600" : "border border-zinc-800"} ${saved ? "opacity-60 cursor-not-allowed" : ""}`} rows={5} />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zinc-400">Insert value from previous API task</label>
                                        <div className="flex gap-2 mt-1">
                                            <select disabled={saved} onChange={(e) => {
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
                                                    <option key={a.index} value={a.index}>{a.name}</option>
                                                ))}
                                            </select>
                                            <div className="text-sm text-zinc-500 self-center">Tokens look like <code className="bg-zinc-900 px-1 py-0.5 rounded">{`{{taskId.output}}`}</code></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {errors[t.localId] && (
                                <div className="mt-2 text-sm text-red-400">
                                    Missing required: {errors[t.localId].join(", ")}
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

                        {/* show required indicator */}
                        <div className="text-xs text-zinc-400">Fields marked with <span className="text-red-400">*</span> are required</div>

                        {newType === "api" ? (
                            <>
                                <label className="text-sm text-zinc-400">API URL <span className="text-red-400">*</span></label>
                                <input value={newConfig.url || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, url: e.target.value }))} placeholder="API URL" className={`w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${validateNewTask().includes("url") ? "border border-red-600" : "border border-zinc-800"}`} />

                                <label className="text-sm text-zinc-400">Request method</label>
                                <select value={newConfig.method || "GET"} onChange={(e) => setNewConfig((s: any) => ({ ...s, method: e.target.value }))} className="mt-1 w-40 rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100">
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                </select>

                                {/* request body for POST in create dialog */}
                                {(newConfig.method || "GET").toUpperCase() === "POST" && (
                                    <>
                                        <label className="text-sm text-zinc-400">Request body (JSON) <span className="text-red-400">*</span></label>
                                        <textarea value={newConfig.requestBody || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, requestBody: e.target.value }))} placeholder='e.g. {"id":123,"value":"xyz"}' className={`w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${validateNewTask().includes("requestBody") ? "border border-red-600" : "border border-zinc-800"}`} rows={4} />
                                    </>
                                )}

                                <label className="text-sm text-zinc-400">Auth token (optional)</label>
                                <input value={newConfig.token || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, token: e.target.value }))} placeholder="Auth token (optional)" className="w-full rounded bg-[#0b0b0b] border border-zinc-800 px-3 py-2 text-zinc-100" />

                                <label className="text-sm text-zinc-400">Output example (JSON) <span className="text-red-400">*</span></label>
                                <textarea value={newConfig.outputExample || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, outputExample: e.target.value }))} placeholder='e.g. {"id":123,"value":"xyz"}' className={`w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${validateNewTask().includes("outputExample") ? "border border-red-600" : "border border-zinc-800"}`} rows={3} />
                            </>
                        ) : (
                            <>
                                <label className="text-sm text-zinc-400">Recipient list <span className="text-red-400">*</span></label>
                                <input value={newConfig.recipientlist || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, recipientlist: e.target.value }))} placeholder="email1@example.com, email2@example.com" className={`w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${validateNewTask().includes("recipientlist") ? "border border-red-600" : "border border-zinc-800"}`} />

                                <label className="text-sm text-zinc-400">Email subject <span className="text-red-400">*</span></label>
                                <input value={newConfig.subject || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, subject: e.target.value }))} placeholder="Email subject" className={`w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${validateNewTask().includes("subject") ? "border border-red-600" : "border border-zinc-800"}`} />

                                <label className="text-sm text-zinc-400">Email body <span className="text-red-400">*</span></label>
                                <textarea value={newConfig.body || ""} onChange={(e) => setNewConfig((s: any) => ({ ...s, body: e.target.value }))} placeholder="Email body" className={`w-full rounded bg-[#0b0b0b] px-3 py-2 text-zinc-100 ${validateNewTask().includes("body") ? "border border-red-600" : "border border-zinc-800"}`} rows={4} />
                            </>
                        )}

                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="px-3 py-2 rounded border border-zinc-700">Cancel</button>
                            <button onClick={addTask} disabled={validateNewTask().length > 0 || saved} className={`px-3 py-2 rounded text-black ${validateNewTask().length > 0 || saved ? "bg-zinc-700 opacity-60 cursor-not-allowed" : "bg-linear-to-r from-[#00ffea] to-[#6a00ff]"}`}>Add task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
