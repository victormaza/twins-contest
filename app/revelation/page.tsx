import { supabase } from "@/lib/supabase";
import { RevelationClient } from "./revelation-client";

export const dynamic = "force-dynamic";

export default async function RevelationPage() {
  const { data: winner } = await supabase
    .from("duos")
    .select("id, name, image_url, vote_count")
    .order("vote_count", { ascending: false })
    .limit(1)
    .single();

  return <RevelationClient winner={winner ?? null} />;
}
