# Moigye (모이계) - Hackathon Submission

## 1. One Liner Vision

**Trustless on-chain Korean ROSCA (계) that eliminates scam risk through smart contracts and KYC-verified identities on VeryChain.**

---

## 2. GitHub URL

https://github.com/gabrielantonyxaviour/moigye

---

## 3. Key Innovation Domains

1. **DeFi** - Decentralized rotating savings and credit associations
2. **Social Finance** - Peer-to-peer community-based financial circles
3. **Cultural Heritage Digitization** - Modernizing centuries-old Korean 계 tradition

---

## 4. Detailed Description

### The Problem

계 (Gye) is a centuries-old Korean tradition where a group pools money monthly, with one member receiving the pot each rotation. It's peer-to-peer microfinance built on social trust. However:

- **Trust Erosion**: Members disappear after receiving their payout, leaving others with losses
- **No Accountability**: Informal agreements have no legal enforcement
- **Manual Tracking**: Spreadsheets, KakaoTalk messages, cash handling
- **Limited Reach**: Only works with close personal networks
- **No Recourse**: Victims have limited legal options for small amounts

An estimated 10M+ Koreans participate in 계 annually, with scam incidents regularly reported in Korean news. Younger generations are abandoning the tradition due to trust issues.

### Our Solution

**Moigye** creates trustless 계 circles on VeryChain where:

1. **Smart contracts enforce contributions** - Miss a payment, get automatically penalized from your stake
2. **KYC-verified identities** - No anonymous participants through VeryChat integration, ensuring real accountability
3. **Transparent fund management** - All transactions visible on-chain
4. **Automated distribution** - Winner receives funds instantly via smart contract, no intermediary
5. **Reputation staking** - Build credit score across the Very ecosystem

### Key Features

| Feature | Description |
|---------|-------------|
| **계 Creation** | Configure and deploy new 계 with custom parameters (contribution amount, frequency, member count, payout method) |
| **Three Payout Methods** | Auction (bid % to forfeit), Random lottery, or Fixed order rotation |
| **Stake-Based Security** | Members deposit stake that gets slashed on defaults, protecting other participants |
| **Automated Reminders** | Push notifications before due dates via VeryChat |
| **Default Handling** | Automatic penalty application and member removal if stake depleted |
| **Reputation System** | Cross-계 reliability scores for building trust |

### Technical Stack

- **Frontend**: Next.js + shadcn/ui
- **Smart Contracts**: Solidity (Foundry) - GyeFactory, GyeCircle, ReputationRegistry, StakeVault
- **Authentication**: WEPIN wallet + VeryChat KYC verification
- **Blockchain**: VeryChain (EVM compatible)
- **Indexing**: TheGraph (self-hosted)

### Why VeryChain?

VeryChain's integration with VeryChat provides the crucial KYC verification layer that makes Moigye possible. Unlike anonymous DeFi protocols, every 계 participant has a verified identity - recreating the social accountability of traditional 계 while adding the trustlessness of blockchain.

### Cultural Significance

| Traditional Element | Moigye Equivalent |
|--------------------|-------------------|
| 계주 (Gye leader) | Contract creator with no fund access |
| 월례회 (Monthly meeting) | Automated on-chain contribution |
| 신뢰 (Trust) | KYC verification + stake |
| 순번 (Turn order) | Smart contract enforcement |
| 수금 (Collection) | Automated blockchain transfer |

### Tagline

**"할머니의 지혜, 블록체인의 신뢰"**
*(Grandmother's wisdom, blockchain's trust)*

---

## Team

- **Gabriel** - Full Stack Developer

---

## Links

- **DoraHacks**: https://dorahacks.io/buidl/38081
- **GitHub**: https://github.com/gabrielantonyxaviour/moigye
- **Local Dev**: localhost:3004
