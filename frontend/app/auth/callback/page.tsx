// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { loginGoogle } from "@/api_services/auth.service";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function handleGoogleLogin() {
            setLoading(true);
            setError(null);

            try {
                // Get the NextAuth session (Google user info)
                const session = await getSession();
                if (!session?.user?.email) {
                    setError("No user session found");
                    setLoading(false);
                    return;
                }

                // Call your backend to register/login the Google user
                await loginGoogle(session.user.email, session.user.name || "");

                // After backend sets access token, redirect to dashboard
                router.replace("/dashboard");
            } catch (err: any) {
                console.error("Backend login failed:", err);
                setError("Failed to login via Google");
            } finally {
                setLoading(false);
            }
        }

        handleGoogleLogin();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            {loading && <p>Logging in with Google...</p>}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
