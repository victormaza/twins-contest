"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Trophy,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Plus,
  Camera,
  Trash2,
  User,
  ImageIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { supabase, type Duo } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ADMIN_LOGIN = "twinscontestadmin";
const ADMIN_PASSWORD = "macbookpro";
const ADMIN_STORAGE_KEY = "twins_admin_auth";

function makeAuthHeader() {
  return Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}`).toString("base64");
}

// ─── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
      onAuth();
    } else {
      setError("Identifiants incorrects.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 border space-y-6"
        style={{ background: "oklch(0.13 0 0)", borderColor: "oklch(1 0 0 / 0.1)" }}
      >
        <div className="text-center space-y-2">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full mx-auto"
            style={{ background: "oklch(0.82 0.18 85 / 0.15)" }}
          >
            <Lock style={{ color: "oklch(0.82 0.18 85)" }} size={20} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Administration</h1>
          <p className="text-white/40 text-sm">Twins Contest</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Login */}
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Identifiant"
              autoComplete="username"
              autoFocus
              className="w-full h-11 pl-9 pr-4 rounded-lg text-white text-sm focus:outline-none"
              style={{
                background: "oklch(1 0 0 / 0.07)",
                border: "1px solid oklch(1 0 0 / 0.12)",
              }}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="w-full h-11 pl-9 pr-10 rounded-lg text-white text-sm focus:outline-none"
              style={{
                background: "oklch(1 0 0 / 0.07)",
                border: "1px solid oklch(1 0 0 / 0.12)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full font-semibold mt-1"
            style={{ background: "oklch(0.82 0.18 85)", color: "oklch(0.1 0 0)" }}
          >
            Accéder
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Add Duo form ──────────────────────────────────────────────────────────────

function AddDuoForm({ onAdded }: { onAdded: (duo: Duo) => void }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorMsg("Donne un nom au duo."); return; }
    if (!file) { setErrorMsg("Sélectionne une photo."); return; }

    setStatus("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("image", file);

      const res = await fetch("/api/admin/duo", {
        method: "POST",
        headers: { "x-admin-auth": makeAuthHeader() },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur inconnue");

      setStatus("success");
      onAdded(json.duo);

      // Reset form
      setTimeout(() => {
        setName("");
        setFile(null);
        setPreview(null);
        setStatus("idle");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div
      className="rounded-xl border p-4 space-y-4"
      style={{ background: "oklch(0.13 0 0)", borderColor: "oklch(0.82 0.18 85 / 0.2)" }}
    >
      <div className="flex items-center gap-2">
        <Plus style={{ color: "oklch(0.82 0.18 85)" }} size={16} />
        <h2 className="text-white font-semibold text-sm">Ajouter un duo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Image picker */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="duo-image-input"
          />

          {preview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-video rounded-xl overflow-hidden border-2 block"
              style={{ borderColor: "oklch(0.82 0.18 85 / 0.4)" }}
            >
              <Image src={preview} alt="Aperçu" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                <Camera className="text-white" size={24} />
                <span className="text-white text-sm ml-2">Changer</span>
              </div>
            </button>
          ) : (
            <label
              htmlFor="duo-image-input"
              className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-colors"
              style={{ borderColor: "oklch(1 0 0 / 0.15)", background: "oklch(1 0 0 / 0.03)" }}
            >
              <Camera style={{ color: "oklch(0.82 0.18 85)" }} size={28} className="mb-2" />
              <span className="text-white/60 text-sm font-medium">Prendre une photo</span>
              <span className="text-white/30 text-xs mt-0.5">ou choisir depuis la galerie</span>
            </label>
          )}
        </div>

        {/* Name */}
        <div className="relative">
          <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du duo (ex: Mario & Luigi)"
            className="w-full h-11 pl-9 pr-4 rounded-lg text-white text-sm focus:outline-none"
            style={{
              background: "oklch(1 0 0 / 0.07)",
              border: "1px solid oklch(1 0 0 / 0.12)",
            }}
          />
        </div>

        {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

        <Button
          type="submit"
          disabled={status === "uploading" || status === "success"}
          className="w-full font-semibold h-11 gap-2"
          style={
            status === "success"
              ? { background: "oklch(0.6 0.2 145)", color: "white" }
              : { background: "oklch(0.82 0.18 85)", color: "oklch(0.1 0 0)" }
          }
        >
          {status === "uploading" && <Loader2 size={15} className="animate-spin" />}
          {status === "success" && <CheckCircle2 size={15} />}
          {status === "uploading"
            ? "Envoi en cours…"
            : status === "success"
            ? "Duo ajouté !"
            : "Ajouter le duo"}
        </Button>
      </form>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

export function AdminPageClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [duos, setDuos] = useState<Duo[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"votes" | "duos">("votes");

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_STORAGE_KEY) === "true") {
      setAuthenticated(true);
    }
  }, []);

  const fetchDuos = useCallback(async () => {
    const { data } = await supabase
      .from("duos")
      .select("*")
      .order("vote_count", { ascending: false });
    if (data) {
      setDuos(data);
      setTotalVotes(data.reduce((sum, d) => sum + d.vote_count, 0));
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchDuos();

    const channel = supabase
      .channel("admin-votes")
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, fetchDuos)
      .on("postgres_changes", { event: "*", schema: "public", table: "duos" }, fetchDuos)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authenticated, fetchDuos]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("duos").update({ vote_count: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");
      await fetchDuos();
    } finally {
      setIsResetting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch("/api/admin/duo", {
        method: "DELETE",
        headers: {
          "x-admin-auth": makeAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setDuos((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuoAdded = (duo: Duo) => {
    setDuos((prev) => [...prev, duo].sort((a, b) => b.vote_count - a.vote_count));
  };

  if (!authenticated) {
    return <LoginScreen onAuth={() => setAuthenticated(true)} />;
  }

  const winner = duos[0];
  const maxVotes = winner?.vote_count ?? 0;
  // Sort duos by name for the management tab
  const duosByName = [...duos].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: "rgba(15,15,15,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <Trophy style={{ color: "oklch(0.82 0.18 85)" }} size={18} strokeWidth={1.5} />
          <span className="font-heading font-bold text-lg text-gold-gradient">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-white/30 text-xs">
              {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "oklch(0.7 0.2 145)", animation: "voted-pulse 2s ease-in-out infinite" }}
            title="Temps réel actif"
          />
        </div>
      </header>

      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "oklch(0.13 0 0)" }}
        >
          {(["votes", "duos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                activeTab === tab
                  ? { background: "oklch(0.82 0.18 85)", color: "oklch(0.1 0 0)" }
                  : { color: "oklch(0.6 0 0)" }
              }
            >
              {tab === "votes" ? "Résultats" : "Gérer les duos"}
            </button>
          ))}
        </div>

        {/* ── TAB VOTES ── */}
        {activeTab === "votes" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total votes", value: totalVotes },
                { label: "Duos", value: duos.length },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 border"
                  style={{ background: "oklch(0.13 0 0)", borderColor: "oklch(1 0 0 / 0.1)" }}
                >
                  <p className="text-white/40 text-xs">{label}</p>
                  <p className="text-3xl font-bold font-heading mt-1" style={{ color: "oklch(0.82 0.18 85)" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Winner */}
            {winner && maxVotes > 0 && (
              <div
                className="rounded-xl p-4 border flex items-center gap-3"
                style={{ background: "oklch(0.82 0.18 85 / 0.1)", borderColor: "oklch(0.82 0.18 85 / 0.4)" }}
              >
                <Crown style={{ color: "oklch(0.82 0.18 85)" }} size={24} />
                <div>
                  <p className="text-white/50 text-xs">En tête</p>
                  <p className="font-heading font-bold text-lg" style={{ color: "oklch(0.82 0.18 85)" }}>
                    {winner.name}
                  </p>
                  <p className="text-white/50 text-xs">
                    {winner.vote_count} vote{winner.vote_count > 1 ? "s" : ""}
                    {totalVotes > 0 && ` · ${Math.round((winner.vote_count / totalVotes) * 100)}%`}
                  </p>
                </div>
              </div>
            )}

            {/* Reset */}
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isResetting}
                      className="gap-2 border-red-800/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      <RefreshCw size={14} className={isResetting ? "animate-spin" : ""} />
                      Réinitialiser les votes
                    </Button>
                  }
                />
                <AlertDialogContent className="border-white/10 max-w-[340px]" style={{ background: "#1a1a1a" }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Réinitialiser tous les votes ?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      Cette action supprimera définitivement tous les votes. Les participants pourront re-voter.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/20 text-white/70 bg-transparent hover:bg-white/10">
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                      Réinitialiser
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Ranking table */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "oklch(0.13 0 0)", borderColor: "oklch(1 0 0 / 0.1)" }}
            >
              <Table>
                <TableHeader>
                  <TableRow style={{ borderBottomColor: "oklch(1 0 0 / 0.08)" }}>
                    <TableHead className="text-white/40 text-xs w-10">#</TableHead>
                    <TableHead className="text-white/40 text-xs">Duo</TableHead>
                    <TableHead className="text-white/40 text-xs text-right">Votes</TableHead>
                    <TableHead className="text-white/40 text-xs text-right w-16">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duos.map((duo, index) => {
                    const isWinner = index === 0 && maxVotes > 0;
                    const pct = totalVotes > 0 ? Math.round((duo.vote_count / totalVotes) * 100) : 0;
                    return (
                      <TableRow
                        key={duo.id}
                        style={{
                          borderBottomColor: "oklch(1 0 0 / 0.05)",
                          background: isWinner ? "oklch(0.82 0.18 85 / 0.05)" : undefined,
                        }}
                      >
                        <TableCell className="text-white/30 text-sm font-mono">
                          {isWinner ? <Crown style={{ color: "oklch(0.82 0.18 85)" }} size={14} /> : index + 1}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${isWinner ? "" : "text-white/80"}`}
                            style={isWinner ? { color: "oklch(0.82 0.18 85)" } : undefined}
                          >
                            {duo.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden sm:block w-16 h-1 rounded-full overflow-hidden bg-white/10">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  background: isWinner ? "oklch(0.82 0.18 85)" : "oklch(0.55 0.22 290)",
                                }}
                              />
                            </div>
                            <span
                              className={`text-sm font-semibold tabular-nums ${isWinner ? "" : "text-white/70"}`}
                              style={isWinner ? { color: "oklch(0.82 0.18 85)" } : undefined}
                            >
                              {duo.vote_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-white/40 text-xs tabular-nums">{pct}%</TableCell>
                      </TableRow>
                    );
                  })}
                  {duos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-white/30 py-8">
                        Aucun duo enregistré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* ── TAB DUOS ── */}
        {activeTab === "duos" && (
          <>
            <AddDuoForm onAdded={handleDuoAdded} />

            {/* List of existing duos */}
            {duosByName.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/40 text-xs px-1">{duosByName.length} duo{duosByName.length > 1 ? "s" : ""} enregistré{duosByName.length > 1 ? "s" : ""}</p>
                {duosByName.map((duo) => (
                  <div
                    key={duo.id}
                    className="flex items-center gap-3 rounded-xl p-3 border"
                    style={{ background: "oklch(0.13 0 0)", borderColor: "oklch(1 0 0 / 0.08)" }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      <Image src={duo.image_url} alt={duo.name} fill className="object-cover" sizes="48px" />
                    </div>

                    {/* Name + votes */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{duo.name}</p>
                      <p className="text-white/40 text-xs">{duo.vote_count} vote{duo.vote_count > 1 ? "s" : ""}</p>
                    </div>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button
                            disabled={deletingId === duo.id}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0"
                          >
                            {deletingId === duo.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        }
                      />
                      <AlertDialogContent className="border-white/10 max-w-[340px]" style={{ background: "#1a1a1a" }}>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Supprimer ce duo ?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60">
                            <span className="font-semibold text-white">{duo.name}</span> sera supprimé définitivement, ainsi que ses votes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-white/20 text-white/70 bg-transparent hover:bg-white/10">Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(duo.id)} className="bg-red-600 hover:bg-red-700 text-white">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
