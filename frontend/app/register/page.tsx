"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/api_services/auth.service';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
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

                    <button disabled={loading} type="submit" className="w-full rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] py-3 font-semibold text-black hover:brightness-105 transition disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button>
                </form>

                {error && <div className="text-sm text-red-400" style={{ display: 'flex', justifyContent: 'center' }}>{error}</div>}

                <div className="text-center text-sm text-zinc-500">
                    <p>Already have an account? <Link href="/login" className="text-[#00ffea] hover:underline">Sign in</Link></p>
                </div>
            </div>
        </div>
    )
}
