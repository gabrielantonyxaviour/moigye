# Moigye (모이계) — Product Requirements Document

## On-Chain ROSCA (Rotating Savings and Credit Association)

---

## 1. Executive Summary

**Product Name:** Moigye (모이계)
**Tagline:** "신뢰할 수 있는 디지털 계모임" (Trustworthy Digital Gye)
**Category:** DeFi / Social Finance

Moigye digitizes the traditional Korean "계" (rotating savings club) using smart contracts on VeryChain. By leveraging VeryChat's KYC-verified identities, Moigye solves the trust problem that plagues informal lending circles — ensuring participants can't disappear with funds.

---

## 2. Problem Statement

### The Traditional 계 Problem

계 (Gye) is a centuries-old Korean tradition where a group pools money monthly, with one member receiving the pot each round. It's essentially peer-to-peer microfinance built on social trust.

**Current Pain Points:**

| Problem | Impact |
|---------|--------|
| **Trust Erosion** | Members disappear after receiving their payout, leaving others with losses |
| **No Accountability** | Informal agreements have no legal enforcement |
| **Manual Tracking** | Spreadsheets, KakaoTalk messages, cash handling |
| **Limited Reach** | Only works with close personal networks |
| **No Recourse** | Victims have limited legal options for small amounts |

### Market Context

- Estimated 10M+ Koreans participate in 계 annually
- Average 계 size: 10-20 members, ₩100,000-500,000/month contribution
- Scam incidents regularly reported in Korean news
- Younger generations abandoning tradition due to trust issues

---

## 3. Solution Overview

Moigye creates trustless 계 circles where:

1. **Smart contracts enforce contributions** — Miss a payment, get automatically penalized
2. **KYC-verified identities** — No anonymous participants, real accountability
3. **Transparent fund management** — All transactions visible on-chain
4. **Automated distribution** — Winner receives funds instantly, no intermediary
5. **Reputation staking** — Build credit score across the Very ecosystem

---

## 4. Target Users

### Primary: Korean Millennials & Gen Z (25-40)
- Familiar with 계 concept from family
- Comfortable with digital payments
- Skeptical of informal trust arrangements
- Already using VeryChat

### Secondary: Overseas Koreans
- Want to participate in 계 with family/friends back home
- Cross-border payments are expensive
- Time zone differences make coordination hard

### Tertiary: Non-Korean Users
- Introduce ROSCA concept to global VeryChat users
- Particularly relevant for users from cultures with similar traditions (Chit funds in India, Tandas in Latin America)

---

## 5. User Flows

### Flow 1: Creating a 계

```
1. User opens Moigye dApp
2. Clicks "새 계 만들기" (Create New Gye)
3. Configures parameters:
   - 계 name
   - Contribution amount (in VERY)
   - Frequency (weekly/monthly)
   - Number of members (4-20)
   - Payout method (auction/random/fixed order)
   - Late payment penalty %
   - Required stake amount
4. Reviews terms and confirms
5. Smart contract deploys
6. Receives shareable invite link
7. Shares link via VeryChat/other channels
```

### Flow 2: Joining a 계

```
1. User receives invite link
2. Opens link → Moigye dApp
3. Logs in with VeryChat (verification code flow)
4. Views 계 details:
   - Creator profile (KYC verified badge)
   - Existing members
   - Terms and schedule
5. Reviews stake requirement
6. Connects Wepin wallet
7. Deposits stake + first contribution
8. Joins 계 (added to smart contract)
9. Receives confirmation in VeryChat (push notification)
```

### Flow 3: Monthly Contribution Cycle

```
1. User receives reminder (3 days before due date)
2. Opens Moigye → sees pending contribution
3. Clicks "납부하기" (Pay)
4. Wepin wallet opens
5. Confirms transaction
6. Contribution recorded on-chain
7. Status updates to "납부완료"
```

### Flow 4: Payout Round (Auction Method)

```
1. Contribution deadline passes
2. All funds pooled in contract
3. Auction period opens (24-48 hours)
4. Eligible members (haven't received payout yet) bid
5. Bid = % of pot they're willing to forfeit
6. Highest bidder wins
7. Winner receives (pot - bid amount)
8. Bid amount distributed to remaining members
9. Winner marked as "received" for future rounds
```

### Flow 5: Handling Defaults

```
1. Member misses payment deadline
2. Grace period (configurable: 24-72 hours)
3. If still unpaid:
   - Penalty deducted from stake
   - Other members notified
   - Member's reputation score impacted
4. If stake depleted:
   - Member removed from 계
   - Remaining stake distributed to others
   - Permanent record on member's profile
```

---

## 6. Feature Breakdown

### Core Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **계 Creation** | Configure and deploy new 계 contract | P0 |
| **Member Onboarding** | Join via invite link with stake deposit | P0 |
| **Contribution Tracking** | View payment status for all members | P0 |
| **Automated Reminders** | Push notifications before due dates | P0 |
| **Payout Distribution** | Smart contract sends funds to winner | P0 |
| **Stake Management** | Deposit, view, withdraw (after 계 ends) | P0 |
| **Default Handling** | Automatic penalty application | P0 |
| **Transaction History** | View all 계 transactions | P0 |
| **KYC Verification Display** | Show verified badge on profiles | P0 |

### Payout Methods

| Method | How It Works | Use Case |
|--------|--------------|----------|
| **Auction (경매)** | Members bid % to forfeit; highest wins | When someone urgently needs funds |
| **Random (추첨)** | Fair lottery each round | Equal urgency among members |
| **Fixed Order (순번)** | Pre-determined rotation | Predictable planning |

### Secondary Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **계 Discovery** | Browse public 계 groups to join | P1 |
| **Reputation Score** | Cross-계 reliability score | P1 |
| **Multi-currency** | Support wrapped stablecoins | P1 |
| **Emergency Withdrawal** | Early exit with penalty | P1 |
| **Dispute Resolution** | Community arbitration for edge cases | P2 |
| **계 Templates** | Pre-configured common setups | P2 |

---

## 7. Technical Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - 계 Dashboard                                              │
│  - Creation Wizard                                          │
│  - Member Management                                        │
│  - Payment Interface                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Optional)                       │
│  - Notification scheduler                                   │
│  - Analytics aggregation                                    │
│  - Invite link management                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────┬─────────────────┬───────────────────────┐
│   VeryChat Auth   │   Wepin Wallet  │   VeryChain (EVM)     │
│   - Login         │   - Sign txns   │   - GyeFactory        │
│   - Profile       │   - View balance│   - GyeCircle         │
│   - KYC status    │   - Send VERY   │   - ReputationRegistry│
└───────────────────┴─────────────────┴───────────────────────┘
```

### Smart Contract Structure

| Contract | Purpose |
|----------|---------|
| **GyeFactory** | Deploys new 계 circles, tracks all active circles |
| **GyeCircle** | Individual 계 instance with all logic |
| **ReputationRegistry** | Tracks member reliability scores across all 계 |
| **StakeVault** | Holds member stakes with release conditions |

### Data Model

**Gye Circle:**
- circleId
- name
- creator (address)
- contributionAmount
- frequency
- totalRounds
- currentRound
- payoutMethod
- penaltyRate
- stakeRequired
- members[]
- status (forming/active/completed)

**Member:**
- address
- veryChatHandle
- kycVerified
- stakeDeposited
- contributionsPaid[]
- hasReceivedPayout
- reputationScore

**Round:**
- roundNumber
- dueDate
- contributions[]
- winner
- amountDistributed
- status

---

## 8. VeryChat & Wepin Integration

### VeryChat Integration

| Touchpoint | Implementation |
|------------|----------------|
| **Login** | VeryChat verification code flow |
| **Profile Display** | Show VeryChat handle + profile image |
| **KYC Badge** | Query and display verified status |
| **Notifications** | Deep links back to dApp (via invite URLs) |

### Wepin Integration

| Touchpoint | Implementation |
|------------|----------------|
| **Wallet Connection** | Wepin widget for wallet access |
| **Stake Deposit** | Transaction signing via Wepin |
| **Contributions** | Monthly payment transactions |
| **Payout Receipt** | View incoming funds |
| **Balance Check** | Show VERY balance in dApp |

---

## 9. Success Metrics

### Primary KPIs

| Metric | Target (3 months post-launch) |
|--------|-------------------------------|
| Total 계 created | 500+ |
| Total members | 3,000+ |
| Total value locked (TVL) | 1M+ VERY |
| 계 completion rate | >85% |
| Default rate | <5% |

### Secondary KPIs

| Metric | Target |
|--------|--------|
| Average 계 size | 8+ members |
| Repeat participation | 40% create/join second 계 |
| Referral rate | 30% join via member invite |
| Average contribution | 500+ VERY |

---

## 10. Korean Market Positioning

### Messaging

**Primary:** "할머니의 지혜, 블록체인의 신뢰"  
(Grandmother's wisdom, blockchain's trust)

**Secondary:** "먹튀 걱정 없는 스마트 계모임"  
(Smart Gye without scam worries)

### Cultural Alignment

| Traditional Element | Moigye Equivalent |
|--------------------|-------------------|
| 계주 (Gye leader) | Contract creator with no fund access |
| 월례회 (Monthly meeting) | Automated on-chain contribution |
| 신뢰 (Trust) | KYC verification + stake |
| 순번 (Turn order) | Smart contract enforcement |
| 수금 (Collection) | Automated blockchain transfer |

### Competitive Differentiation

| Competitor | Moigye Advantage |
|------------|------------------|
| KakaoTalk 계 groups | No manual tracking, no trust issues |
| Traditional 계 | Can't run with funds, transparent |
| Bank savings clubs | Higher returns, peer-based |
| Other crypto ROSCAs | KYC-verified members, Korean UX |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Smart contract bug | Medium | Critical | Audit, start with small amounts |
| Mass defaults in bear market | Medium | High | Require sufficient stake, reputation system |
| Low initial adoption | Medium | Medium | Seed with VeryChat community groups |
| Regulatory concerns | Low | High | Not securities, pure savings club |
| Gas fee spikes | Low | Medium | Batch operations, L2 if needed |

---

## 12. Demo Script (For Hackathon)

### Scene 1: The Problem (30 sec)
- Show news headline about 계 scam
- "Traditional 계 relies on trust. Trust can be broken."

### Scene 2: Create a 계 (45 sec)
- Demo account creates new 계
- Sets 10 members, 100 VERY/month, 12 rounds
- Shows deployed contract

### Scene 3: Join and Contribute (45 sec)
- Second account joins via invite
- Makes first contribution
- Shows on-chain confirmation

### Scene 4: Payout Round (30 sec)
- Fast-forward to payout
- Auction/random selection
- Winner receives funds automatically

### Scene 5: Default Handling (30 sec)
- Show what happens when someone misses payment
- Stake slashed, others protected

### Closing: (15 sec)
- "계의 지혜, 블록체인의 신뢰. Moigye."

---

## 13. Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Design | 3 days | UI/UX mockups, contract architecture |
| Smart Contracts | 5 days | GyeFactory, GyeCircle, tests |
| Frontend | 7 days | All user flows implemented |
| Integration | 3 days | VeryChat auth, Wepin wallet |
| Testing | 3 days | E2E testing, bug fixes |
| Demo Prep | 2 days | Recording, pitch deck |
| **Total** | **~3 weeks** | |

---

## 14. Open Questions

1. Should we support multiple currencies (wrapped USDT, etc.) or VERY only?
2. What's the minimum viable 계 size? (Suggest 4 members)
3. Should 계 discovery be public or invite-only for MVP?
4. Do we need off-chain notifications beyond VeryChat deep links?
