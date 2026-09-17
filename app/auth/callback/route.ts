import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (code && isSupabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (url.searchParams.get("next") === "/auth/reset-password") return NextResponse.redirect(`${origin}/auth/reset-password`);
      const { data: admin } = await supabase.from("administrators").select("user_id").maybeSingle();
      return NextResponse.redirect(`${origin}${admin ? "/admin" : "/account"}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback`);
}
