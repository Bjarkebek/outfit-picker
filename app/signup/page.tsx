"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const dynamic = "force-dynamic";

export default function SignupPage() {
    return (
        <Suspense fallback={null}>
        <SignupInner />
        </Suspense>
    );
}

function SignupInner() {
    const supabase = supabaseBrowser();
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [msg, setMsg] = useState("");
    const qp = useSearchParams();
    const router = useRouter();

    // Sync auth -> server cookies, så middleware kan se sessionen
    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event, session }),
            });
            if (event === "SIGNED_IN") window.location.replace("/");
        }
        );
        return () => sub.subscription.unsubscribe();
    }, [supabase]);



    const onSignup = async () => {
        const { error } = await supabase.auth.signUp({ email, password: pw });
        if (error) setMsg(error.message);
        else setMsg("Bruger oprettet – tjek mail, og log derefter ind.");
    };
    const goBack = async () => {
        router.push('/login')
    };

return (
<div className="mx-auto max-w-sm mt-24 p-6 rounded-xl border bg-white dark:bg-white/5 dark:border-white/10">
    <h1 className="text-xl font-semibold mb-4">Opret Bruger</h1>
    <form className="grid gap-3" onSubmit={onSignup}>
    <input
        className="border rounded px-3 py-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
    />
    <input
        className="border rounded px-3 py-2"
        type="password"
        placeholder="Password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
    />
    <button className="bg-green-600 text-white py-2 rounded" name="sign in" type="submit">
        Opret
    </button>
    <button
    className="mt-3 w-full bg-blue-600 text-white py-2 rounded" type="button"
    onClick={goBack}>
    Tilbage til Login
    </button>
    </form>
    {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
</div>
);
}
