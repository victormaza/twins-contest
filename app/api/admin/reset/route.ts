import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_LOGIN = "twinscontestadmin";
const ADMIN_PASSWORD = "macbookpro";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-auth");
  if (!auth) return false;
  const [login, password] = Buffer.from(auth, "base64").toString().split(":");
  return login === ADMIN_LOGIN && password === ADMIN_PASSWORD;
}

// POST /api/admin/reset — supprimer tous les votes et remettre les compteurs à 0
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = getAdminClient();

  const { error: votesError } = await supabase
    .from("votes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  const { error: duosError } = await supabase
    .from("duos")
    .update({ vote_count: 0 })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (duosError) {
    return NextResponse.json({ error: duosError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
