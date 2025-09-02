// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const { event, session } = await req.json();
  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => req.cookies.get(key)?.value,
        set: (key: string, value: string, options?: any) => {
          res.cookies.set({ name: key, value, ...options });
        },
        remove: (key: string, options?: any) => {
          res.cookies.set({ name: key, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }
  if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
  }

  return res;
}
