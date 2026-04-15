import { VotePageClient } from "./vote-client";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function VotePage() {
  const { data: duos, error } = await supabase
    .from("duos")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching duos:", error);
  }

  return <VotePageClient duos={duos ?? []} />;
}
