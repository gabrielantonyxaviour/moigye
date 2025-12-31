# Moigye (모이계)

**Trustless on-chain Korean ROSCA (계) that eliminates scam risk through smart contracts and KYC-verified identities on VeryChain.**

> "할머니의 지혜, 블록체인의 신뢰"
> *(Grandmother's wisdom, blockchain's trust)*

## Overview

Moigye digitalizes the traditional Korean 계 (Gye) system - a centuries-old peer-to-peer rotating savings and credit association (ROSCA) - using smart contracts on VeryChain. By combining blockchain's trustlessness with VeryChat's KYC verification, Moigye recreates the social accountability of traditional 계 while eliminating the scam risks that have eroded trust in the system.

### The Problem

계 (Gye) is Korea's traditional peer-to-peer microfinance system where groups pool money monthly, with one member receiving the pot each rotation. An estimated 10M+ Koreans participate annually, but the system faces critical issues:

- **Trust Erosion** - Members disappear after receiving payouts, leaving others with losses
- **No Accountability** - Informal agreements have no legal enforcement
- **Manual Tracking** - Spreadsheets, KakaoTalk messages, cash handling
- **Limited Reach** - Only works with close personal networks
- **No Recourse** - Victims have limited legal options for small amounts

### The Solution

Moigye creates trustless 계 circles where:

- Smart contracts automatically enforce contribution rules
- KYC-verified identities via VeryChat ensure real accountability
- All transactions are transparent and on-chain
- Automatic distribution removes intermediary risk
- Stake-based security protects members from defaults

## Features

| Feature | Description |
|---------|-------------|
| **계 Creation** | Deploy circles with custom contribution amounts, frequency, and member limits |
| **Three Payout Methods** | Auction (bid % to forfeit), Random lottery, or Fixed order rotation |
| **Stake-Based Security** | Members deposit stake that gets slashed on defaults |
| **Automated Enforcement** | Smart contracts handle contributions, penalties, and payouts |
| **Default Handling** | Automatic penalty application when payments are missed |
| **Multi-language** | Full Korean and English support |

### Payout Methods

1. **Auction** - Members bid a percentage to forfeit; highest bidder wins the pot minus their bid
2. **Random** - Fair lottery selection each round using on-chain randomness
3. **Fixed Order** - Pre-determined rotation based on join order

## Architecture

```
moigye/
├── contracts/          # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── GyeFactory.sol      # Factory for deploying circles
│   │   ├── GyeCircle.sol       # Individual circle logic
│   │   ├── interfaces/         # Contract interfaces
│   │   └── libraries/          # Shared types & utilities
│   └── test/                   # Unit & integration tests
├── frontend/           # Next.js web application
│   ├── app/                    # App router pages
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Hooks, services, utilities
│   └── constants/              # Contract addresses, ABIs
└── subgraph/           # TheGraph indexer
    ├── src/                    # Event handlers
    ├── schema.graphql          # Entity definitions
    └── subgraph.yaml           # Subgraph manifest
```

## Tech Stack

### Frontend
- **Next.js 16** - React 19 framework
- **shadcn/ui** - Component library built on Radix UI
- **TailwindCSS** - Utility-first styling
- **Wagmi + Viem** - Type-safe Ethereum integration
- **WEPIN SDK** - Wallet connection
- **Apollo Client** - GraphQL queries

### Smart Contracts
- **Solidity 0.8.26** - Contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Proxy patterns (EIP-1167 clones)

### Indexing
- **TheGraph** - Event indexing and querying
- **AssemblyScript** - Subgraph handlers

## Smart Contracts

### GyeFactory

Factory contract using EIP-1167 minimal proxy pattern for gas-efficient circle deployment.

**Key Functions:**
- `createCircle()` - Deploy new 계 with custom configuration
- `createAndJoinCircle()` - Deploy and join as first member
- `getCircle()` - Get circle address by ID
- `getUserCircles()` - Get all circles for a user

### GyeCircle

Individual ROSCA instance managing contributions, payouts, and member state.

**Key Functions:**
- `join()` / `joinFor()` - Member onboarding with stake deposit
- `contribute()` - Make contribution payment
- `bid()` - Place bid for auction-based payout
- `claimPayout()` - Claim payout (fixed order method)
- `distributeRound()` - Distribute payout to winner
- `slash()` - Penalize member for missed payment
- `withdrawStake()` - Withdraw stake after completion

### Deployed Addresses

| Network | Contract | Address |
|---------|----------|---------|
| VeryChain Mainnet | GyeFactory | `0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb` |
| Polygon Amoy | GyeFactory | `0x03b50f9245d8526c2BcCd6D9d8e6539F6eBf43ec` |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Foundry (for contracts)
- Graph CLI (for subgraph)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

The app will be available at `http://localhost:3001`

### Contract Development

```bash
cd contracts
forge install
forge build
forge test
```

### Subgraph Deployment

```bash
cd subgraph
npm install
graph codegen
graph build

# Deploy to local graph-node
graph create --node http://localhost:8020/ moigye
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 moigye
```

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # WalletConnect project ID
NEXT_PUBLIC_APP_MODE=testnet            # testnet | mainnet | both
NEXT_PUBLIC_INDEXER_URL=                # Subgraph endpoint
```

## Cultural Context

Moigye preserves the essence of traditional Korean 계 while modernizing it for the blockchain era:

| Traditional Element | Moigye Equivalent |
|--------------------|-------------------|
| 계주 (Gye leader) | Contract creator with no fund access |
| 월례회 (Monthly meeting) | Automated on-chain contribution |
| 신뢰 (Trust) | KYC verification + stake deposit |
| 순번 (Turn order) | Smart contract enforcement |
| 수금 (Collection) | Automated blockchain transfer |

## Why VeryChain?

VeryChain's integration with VeryChat provides the crucial KYC verification layer that makes Moigye possible. Unlike anonymous DeFi protocols, every 계 participant has a verified identity - recreating the social accountability of traditional 계 while adding the trustlessness of blockchain.

## Links

- **DoraHacks**: https://dorahacks.io/buidl/38081
- **GitHub**: https://github.com/gabrielantonyxaviour/moigye

## License

MIT
