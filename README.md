# Nexora - Collective Intelligence Platform

> Better decisions through collective intelligence

Nexora is a privacy-preserving, decentralized platform that helps teams make better decisions by aggregating individual perspectives, reasoning, and positions into actionable group insights — powered by AI synthesis and secured by Web3 infrastructure.

## What It Does

Teams often make poor decisions because dominant voices drown out minority perspectives, participation is uneven, and there's no structured way to capture reasoning — not just opinions.

Nexora solves this by:
- Giving every member an equal, anonymous voice
- Requiring reasoning behind every position (not just agree/disagree)
- Using AI to synthesize collective intelligence into actionable insights
- Securing all data with decentralized encryption and blockchain coordination

## Live Demo

**[https://nexora-nine-pi.vercel.app](https://nexora-nine-pi.vercel.app)**

## Hackathon Track

**PL Genesis — Neurotech Track**

Nexora addresses cognitive augmentation and privacy-preserving identity by treating group decision-making as a form of collective neural processing — where individual reasoning is encrypted, coordinated on-chain, and synthesized by AI.

**Track:** Fresh Code
**Sponsor Bounties Integrated:**
- Lit Protocol — privacy-preserving identity encryption
- Filecoin — immutable decision record storage (CID generation)
- NEAR Protocol — trust-minimized coordination layer

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Encryption | Lit Protocol (AES-GCM + access control) |
| Storage | Filecoin/Storacha (immutable decision records) |
| Coordination | NEAR Protocol Testnet |
| AI Synthesis | Groq (LLaMA 3.3 70B) |
| Deployment | Vercel |

## Architecture
```
User → Join Session → Answer Questions
                           ↓
              Lit Protocol encrypts identity
                           ↓
              Responses stored in Supabase
                           ↓
         Admin views Results + AI Synthesis (Groq)
                           ↓
         Decision stored on Filecoin (immutable CID)
                           ↓
         Session registered on NEAR testnet
```

## Key Features

- **Balanced Participation** — every member answers independently before seeing others' responses
- **Reasoning Required** — positions must be backed by written reasoning
- **Privacy-Preserving Identity** — member identities encrypted with Lit Protocol
- **AI Decision Synthesis** — Groq LLaMA analyzes all responses and generates actionable insights
- **Immutable Records** — decisions stored permanently on Filecoin
- **On-Chain Coordination** — sessions registered on NEAR testnet blockchain
- **Cognitive Diversity Score** — measures how diverse the group's thinking is

## Sponsor Integrations

### Lit Protocol
Member identities are encrypted client-side using AES-GCM encryption with Lit Protocol access control conditions. This ensures privacy-preserving identity — only authorized parties can decrypt who said what.

### Filecoin / Storacha
After a session is complete, the full decision record (questions, responses, AI synthesis) is stored immutably on Filecoin via the Storacha protocol, generating a permanent Content Identifier (CID).

### NEAR Protocol
Every session creation triggers a real RPC call to NEAR testnet, verifying the account, retrieving the current block hash and nonce, and registering the session as a trust-minimized coordination record on-chain.


## Running Locally

### Prerequisites
- Node.js 18+
- Supabase account
- Groq API key (free at console.groq.com)
- NEAR testnet account (free at testnet.mynearwallet.com)

### Setup
```bash
git clone https://github.com/theeagle2407/Nexora.git
cd Nexora
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
NEAR_ACCOUNT_ID=your-account.testnet
NEAR_PRIVATE_KEY=ed25519:your-private-key
NEAR_PUBLIC_KEY=ed25519:your-public-key
```

### Database Setup

Run in Supabase SQL Editor:
```sql
create table sessions (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  title text not null,
  created_by uuid,
  status text default 'active',
  near_tx_hash text,
  near_explorer_url text,
  created_at timestamp with time zone default now()
);

create table questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  text text not null,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

create table responses (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references questions(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  member_name text not null,
  position text not null,
  reasoning text not null,
  encrypted boolean default false,
  encryption_hash text,
  access_conditions jsonb,
  created_at timestamp with time zone default now()
);
```

### Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
nexora/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── auth/page.tsx               # Sign in / Sign up
│   ├── dashboard/page.tsx          # User dashboard
│   ├── create/page.tsx             # Create session
│   ├── session/[code]/page.tsx     # Session management
│   ├── join/page.tsx               # Join by code
│   ├── respond/[code]/page.tsx     # Answer questions
│   ├── results/[code]/page.tsx     # Results + AI synthesis
│   └── api/
│       ├── synthesize/route.ts     # Groq AI synthesis
│       └── near/route.ts           # NEAR blockchain
├── lib/
│   ├── supabase.ts                 # Database client
│   ├── lit.ts                      # Lit Protocol encryption
│   ├── filecoin.ts                 # Filecoin storage
│   └── near.ts                     # NEAR coordination
└── contexts/
    └── AuthContext.tsx             # Authentication
```

---

## Team

X: @theeagle2407
Discord: @theeagle_0001
Email: elijahoreoluwa45@gmail.com
LinkedIn: ElijahOAremu

---

## License

MIT License