"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/api_services/auth.service';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setValidationError(null);

        if (!email.trim() || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);

        try {
            const res = await login(email, password);
            router.push("/");
        } catch (err: any) {
            setError(err?.response?.data?.detail || err?.message || "Network error");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-zinc-50">
            <div className="w-full max-w-md p-10 space-y-8 bg-gradient-to-br from-[#050505] via-[#0b0b0b] to-[#0f1115] border border-zinc-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-tr from-[#00ffea] to-[#6a00ff] shadow-md flex items-center justify-center text-black font-bold">W</div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@domain.com" className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#00ffea]/40" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Password</label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#6a00ff]/40" />
                    </div>

                    <button disabled={loading} type="submit" className="w-full rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] py-3 font-semibold text-black hover:brightness-105 transition disabled:opacity-60">
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {error && <div className="text-sm text-red-400" style={{ display: 'flex', justifyContent: 'center' }}>{error}</div>}

                <div className="text-center text-sm text-zinc-500">
                    <p>Don't have an account? <Link href="/register" className="text-[#00ffea] hover:underline">Register</Link></p>
                </div>
            </div>
        </div>
    )
}
