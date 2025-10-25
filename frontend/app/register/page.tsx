"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginGoogle, register } from '@/api_services/auth.service';
import { getSession, signIn } from "next-auth/react";
import { auth } from '@/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !password) {
            setError("Name, email and password are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await register(name, email, password);
            router.push("/");
        } catch (err: any) {
            setError(err?.response?.data?.detail || err?.message || "Network error");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-zinc-50">
            <div className="w-full max-w-md p-10 space-y-8 bg-gradient-to-br from-[#050505] via-[#07070a] to-[#0d0d12] border border-zinc-800 rounded-2xl shadow-[0_10px_50px_rgba(10,10,10,0.8)]">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-tr from-[#00ffea] to-[#6a00ff] shadow-md flex items-center justify-center text-black font-bold">W</div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Create account</h1>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your name" className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#00ffea]/40" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@domain.com" className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#00ffea]/40" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300">Password</label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="mt-2 w-full rounded-lg bg-[#0b0b0b] border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#6a00ff]/40" />
                    </div>

                    <button style={{ cursor: 'pointer' }} disabled={loading} type="submit" className="w-full rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] py-3 font-semibold text-black hover:brightness-105 transition disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button>
                </form>

                <div className="mt-4">
                    <div className="relative flex items-center">
                        <hr className="flex-1 border-zinc-800/60" />
                        <span className="mx-3 text-xs text-zinc-500">or continue with</span>
                        <hr className="flex-1 border-zinc-800/60" />
                    </div>

                    <div className="mt-4">
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await signIn("google", { callbackUrl: "/auth/callback" });
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-100 hover:bg-zinc-900 transition"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M21.6 12.227c0-.68-.06-1.333-.175-1.96H12v3.716h5.334c-.23 1.25-.935 2.31-1.99 3.02v2.51h3.216c1.885-1.735 2.99-4.294 2.99-7.286z" fill="#4285F4" />
                                <path d="M12 22c2.7 0 4.966-.896 6.622-2.432l-3.216-2.51c-.894.6-2.04.957-3.406.957-2.62 0-4.842-1.77-5.636-4.155H3.09v2.607C4.74 19.83 8.13 22 12 22z" fill="#34A853" />
                                <path d="M6.364 13.86a6.01 6.01 0 010-3.72V7.533H3.09a9.999 9.999 0 000 8.934l3.274-2.607z" fill="#FBBC05" />
                                <path d="M12 6.5c1.47 0 2.8.506 3.847 1.498l2.878-2.878C16.962 3.59 14.7 2.5 12 2.5 8.13 2.5 4.74 4.67 3.09 7.533l3.274 2.607C7.158 8.27 9.38 6.5 12 6.5z" fill="#EA4335" />
                            </svg>
                            <span>{loading ? "Opening Google…" : "Sign up with Google"}</span>
                        </button>
                    </div>
                </div>

                {error && <div className="text-sm text-red-400" style={{ display: 'flex', justifyContent: 'center' }}>{error}</div>}

                <div className="text-center text-sm text-zinc-500">
                    <p>Already have an account? <Link href="/login" className="text-[#00ffea] hover:underline">Sign in</Link></p>
                </div>
            </div>
        </div>
    )
}
