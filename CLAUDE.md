# Moigye (모이계) - VeryChain dApp

**⭐ Reference Implementation: `../04-shinroe/`**

Always look at Shinroe for patterns, code structure, and implementation details. Copy and adapt from Shinroe, not from template/.

---

## Stack Overview

| Layer | Technology | Notes |
|-------|------------|-------|
| **Auth** | WEPIN | Only auth layer supporting VeryChain mainnet |
| **Chat** | VeryChat API | Messaging integration |
| **Indexing** | TheGraph (self-hosted) | No external indexers support VeryChain |
| **Contracts** | Foundry | EVM compatible |
| **Frontend** | Next.js + shadcn/ui | Standard template |

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in Shinroe (`../04-shinroe/`)
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## Before Starting Any Work

1. **Read the PRD:** `../../prds/01-moigye-prd.md`
2. **Reference Shinroe:** Look at `../04-shinroe/` for all patterns
3. **Load required skills** before starting tasks

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | ABIs, addresses |
| `*-service.ts` | 300 | API services |

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

```
1. First resolve the library ID:
   mcp__context7__resolve-library-id({ libraryName: "viem" })

2. Then fetch the docs:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/wevm/viem",
     topic: "sendTransaction",
     mode: "code"
   })
```

### Libraries for This Project

| Library | Context7 ID |
|---------|-------------|
| viem | `/wevm/viem` |
| wagmi | `/wevm/wagmi` |
| Next.js | `/vercel/next.js` |
| shadcn/ui | `/shadcn-ui/ui` |
| TheGraph | `/graphprotocol/graph-node` |

---

## Skills (LOAD BEFORE STARTING TASKS)

| Task Type | Required Skill |
|-----------|----------------|
| **Strategy Planning** | `strategy` |
| **UI/Frontend** | `ui-dev` |
| **Smart Contract Interactions** | `web3-integration` |
| **Smart Contract Development** | `contracts-dev` |
| **Subgraph Development** | `thegraph-dev` |
| **Subgraph Queries** | `subgraph-frontend` |
| **E2E Testing** | `playwright-testing` |

---

## DO NOT

- **Create files over 300 lines**
- **Use WebFetch for documentation** - Use Context7
- **Skip loading skills**
- **Guess SDK/API usage** - Look it up via Context7
- Import from `wagmi` directly (use abstraction layer)
- Mock WEPIN/VeryChat implementations
- Use `template/` as reference - use `04-shinroe/` instead

## DO

- **Reference `../04-shinroe/`** for all patterns and code
- **Use `/strategy`** to plan multi-step integrations
- **Load skills FIRST** before starting work
- **Use Context7 MCP** for all documentation
- Keep files under 300 lines
- Self-host graph-node for VeryChain indexing

---

## Issues & Learnings (READ BEFORE STARTING)

### Before Starting These Tasks, Read Relevant Issues:

| Task Type | Read First |
|-----------|------------|
| Contract deployment | `docs/issues/contracts/README.md` → CONTRACT-001 (get PRIVATE_KEY first!) |
| Contract testing | `docs/issues/contracts/README.md` → CONTRACT-001 |
| Subgraph deployment | `docs/issues/subgraph/README.md` → SUBGRAPH-001 (local graph-node only!) |
| Subgraph integration | `docs/issues/subgraph/README.md` → SUBGRAPH-001 |
| i18n / multilingual | `docs/issues/ui/README.md` |
| VeryChain specifics | `docs/issues/verychain/README.md` |

### Key Learnings Summary

1. **Contract Deployment**: Copy `.env` from `../04-shinroe/contracts/.env` for `PRIVATE_KEY`. Deploy to **Polygon Amoy** testnet.

2. **Subgraph Deployment**: ALWAYS deploy to local graph-node at `/Users/gabrielantonyxaviour/Documents/starters/very/graph-node/`, NEVER to Graph Studio.
   ```bash
   graph create --node http://localhost:8020/ <project-name>
   graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 <project-name>
   ```
