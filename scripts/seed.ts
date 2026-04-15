/**
 * Seed script — insère les duos en base de données Supabase.
 *
 * Usage :
 *   npx tsx scripts/seed.ts
 *
 * Prérequis :
 *   - Variables d'environnement définies dans .env.local
 *   - Bucket Supabase Storage "duos" créé (public)
 *   - Images uploadées dans le bucket
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // utiliser la clé service pour le seed

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌  Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Données des duos ──────────────────────────────────────────────────────────
// Remplacez les noms et noms de fichiers image par vos données réelles.
// Les images doivent être uploadées dans le bucket "duos" de Supabase Storage.

const BUCKET_URL = `${supabaseUrl}/storage/v1/object/public/duos`;

const duos = [
  { name: "Mario & Luigi", image: "mario-luigi.jpg" },
  { name: "Batman & Robin", image: "batman-robin.jpg" },
  { name: "Mickey & Minnie", image: "mickey-minnie.jpg" },
  { name: "Jack & Barbossa", image: "jack-barbossa.jpg" },
  { name: "Shrek & Donkey", image: "shrek-donkey.jpg" },
  { name: "Bonnie & Clyde", image: "bonnie-clyde.jpg" },
  { name: "Romeo & Juliette", image: "romeo-juliette.jpg" },
  { name: "Sherlock & Watson", image: "sherlock-watson.jpg" },
  { name: "Astérix & Obélix", image: "asterix-obelix.jpg" },
  { name: "Laurel & Hardy", image: "laurel-hardy.jpg" },
];

async function seed() {
  console.log("🌱 Démarrage du seed...\n");

  // Vider la table duos avant de réinsérer
  const { error: deleteError } = await supabase
    .from("duos")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("❌ Erreur suppression:", deleteError.message);
    process.exit(1);
  }

  console.log("✓ Table duos vidée");

  // Insérer les nouveaux duos
  const records = duos.map((d) => ({
    name: d.name,
    image_url: `${BUCKET_URL}/${d.image}`,
    vote_count: 0,
  }));

  const { data, error } = await supabase
    .from("duos")
    .insert(records)
    .select();

  if (error) {
    console.error("❌ Erreur insertion:", error.message);
    process.exit(1);
  }

  console.log(`✓ ${data?.length} duos insérés :\n`);
  data?.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.name}`);
  });

  console.log("\n🎉 Seed terminé !");
}

seed().catch((err) => {
  console.error("❌ Erreur inattendue:", err);
  process.exit(1);
});
