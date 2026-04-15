import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/vote/change
// Body: { voter_token, new_duo_id }
export async function POST(req: NextRequest) {
  const { voter_token, new_duo_id } = await req.json();

  if (!voter_token || !new_duo_id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // 1. Find existing vote
  const { data: existingVote, error: findError } = await supabase
    .from("votes")
    .select("id, duo_id")
    .eq("voter_token", voter_token)
    .single();

  if (findError || !existingVote) {
    return NextResponse.json({ error: "Vote introuvable" }, { status: 404 });
  }

  const old_duo_id = existingVote.duo_id;

  if (old_duo_id === new_duo_id) {
    return NextResponse.json({ error: "Même duo" }, { status: 400 });
  }

  // 2. Decrement old duo vote_count
  await supabase.rpc("decrement_vote_count", { duo_id: old_duo_id });

  // 3. Delete old vote
  await supabase.from("votes").delete().eq("id", existingVote.id);

  // 4. Insert new vote
  const { error: insertError } = await supabase.from("votes").insert({
    duo_id: new_duo_id,
    voter_token,
  });

  if (insertError) {
    // Rollback: re-increment old duo
    await supabase.rpc("increment_vote_count", { duo_id: old_duo_id });
    return NextResponse.json({ error: "Erreur lors du changement" }, { status: 500 });
  }

  // 5. Increment new duo vote_count
  await supabase.rpc("increment_vote_count", { duo_id: new_duo_id });

  // 6. Return updated duo info
  const { data: newDuo } = await supabase
    .from("duos")
    .select("id, name, image_url")
    .eq("id", new_duo_id)
    .single();

  return NextResponse.json({ ok: true, duo: newDuo });
}
