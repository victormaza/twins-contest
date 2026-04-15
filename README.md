# Twins Contest 🏆

Application web mobile-first pour un concours de déguisement de jumeaux. ~60 personnes votent en temps réel via leur smartphone pour désigner le duo gagnant parmi ~30 participants.

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **shadcn/ui** + **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Realtime + Storage)
- **Déploiement** : Vercel

---

## Setup

### 1. Cloner & installer

```bash
git clone <votre-repo>
cd twins_contest

npm install
```

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Renseignez `.env.local` avec vos valeurs Supabase :

| Variable | Où trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon key |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Mot de passe de votre choix |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role key |

### 3. Supabase — Base de données

Dans l'éditeur SQL de Supabase, exécutez :

```sql
-- Duos participants
create table duos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  vote_count integer default 0,
  created_at timestamptz default now()
);

-- Votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  duo_id uuid references duos(id),
  voter_token text not null unique,
  created_at timestamptz default now()
);

-- Row Level Security
alter table duos enable row level security;
alter table votes enable row level security;

-- Policies duos : lecture publique
create policy "duos_select" on duos for select using (true);

-- Policies votes : lecture + insertion publiques (unique token)
create policy "votes_select" on votes for select using (true);
create policy "votes_insert" on votes for insert with check (true);

-- Fonction pour incrémenter le compteur de votes
create or replace function increment_vote_count(duo_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update duos set vote_count = vote_count + 1 where id = duo_id;
end;
$$;
```

### 4. Supabase — Storage

1. Allez dans **Storage** > **New bucket**
2. Créez un bucket nommé `duos` (cochez **Public bucket**)
3. Uploadez les images de vos duos dans ce bucket

### 5. Seed des duos

Éditez `scripts/seed.ts` pour renseigner vos duos et les noms de fichiers images correspondants, puis :

```bash
npx tsx scripts/seed.ts
```

### 6. Lancement local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Pages

| URL | Description |
|---|---|
| `/` | Page d'accueil avec CTA |
| `/vote` | Grille de vote |
| `/merci` | Confirmation après vote |
| `/admin` | Dashboard temps réel (protégé par mot de passe) |

---

## Déploiement Vercel

1. **Pushez** votre repo sur GitHub/GitLab
2. **Importez** le projet sur [vercel.com](https://vercel.com)
3. Ajoutez les **variables d'environnement** dans Vercel > Settings > Environment Variables :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
4. **Déployez** — Vercel détecte automatiquement Next.js

> Avertissement : Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` en variable `NEXT_PUBLIC_*`. Elle est utilisée uniquement pour le script de seed en local.

---

## Architecture

```
app/
├── page.tsx              # Page d'accueil
├── vote/
│   ├── page.tsx          # Server component (fetch duos)
│   └── vote-client.tsx   # Client component (logique de vote)
├── merci/page.tsx        # Page de confirmation
└── admin/
    ├── page.tsx
    └── admin-client.tsx  # Dashboard avec Supabase Realtime

components/
├── duo-grid.tsx          # Grille 2x2 des duos
├── duo-modal.tsx         # Modal avec swipe gestuel
└── ui/                   # Composants shadcn/ui

lib/
└── supabase.ts           # Client Supabase + types

scripts/
└── seed.ts               # Insertion des duos en base
```

---

## Anti-double vote

- Un `voter_token` (UUID) est généré au moment du vote et stocké en **localStorage**
- La table `votes` a une contrainte `UNIQUE` sur `voter_token` — le serveur rejette tout doublon
- A l'arrivée sur `/vote`, le token est vérifié en localStorage — mode lecture seule si déjà voté
