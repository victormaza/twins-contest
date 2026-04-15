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

// POST /api/admin/duo — créer un duo (upload image + insertion DB)
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const file = formData.get("image") as File;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Image requise" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Sanitize filename
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("duos")
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload échoué : ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("duos").getPublicUrl(filename);
  const image_url = urlData.publicUrl;

  // Insert duo in DB
  const { data: duo, error: dbError } = await supabase
    .from("duos")
    .insert({ name: name.trim(), image_url, vote_count: 0 })
    .select()
    .single();

  if (dbError) {
    // Cleanup uploaded file if DB insert fails
    await supabase.storage.from("duos").remove([filename]);
    return NextResponse.json(
      { error: `Insertion DB échouée : ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ duo }, { status: 201 });
}

// DELETE /api/admin/duo — supprimer un duo
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Get image URL to delete from storage
  const { data: duo } = await supabase
    .from("duos")
    .select("image_url")
    .eq("id", id)
    .single();

  // Delete from DB (cascade will handle votes)
  const { error } = await supabase.from("duos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Delete image from storage
  if (duo?.image_url) {
    const filename = duo.image_url.split("/").pop();
    if (filename) {
      await supabase.storage.from("duos").remove([filename]);
    }
  }

  return NextResponse.json({ ok: true });
}
