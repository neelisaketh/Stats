import { createHash, timingSafeEqual } from "node:crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const secret = process.env.ADMIN_ACCESS_PASSWORD,
    key = process.env.SUPABASE_SECRET_KEY;
  if (!isSupabaseConfigured || !secret || !key)
    return Response.json(
      {
        error:
          "Administrator access has not been configured by the site owner.",
      },
      { status: 503 },
    );
  try {
    const client = await createClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user || !user.email_confirmed_at)
      return Response.json(
        { error: "Sign in with a verified email first." },
        { status: 401 },
      );
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: allowed, error: limitError } = await service.rpc(
      "reserve_admin_access",
      { target_user: user.id },
    );
    if (limitError)
      return Response.json(
        { error: "Administrator setup is incomplete. Contact the site owner." },
        { status: 503 },
      );
    if (!allowed)
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    const digest = (value: string) =>
      createHash("sha256").update(value).digest();
    if (
      !password ||
      password.length > 256 ||
      !timingSafeEqual(digest(password), digest(secret))
    )
      return Response.json(
        { error: "Incorrect administrator password." },
        { status: 403 },
      );
    const { error: grantError } = await service
      .from("administrators")
      .upsert({ user_id: user.id });
    if (grantError)
      return Response.json(
        { error: "Could not enable administrator access." },
        { status: 500 },
      );
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Could not process the request. Please try again." },
      { status: 400 },
    );
  }
}
