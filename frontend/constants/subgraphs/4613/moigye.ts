import type { SubgraphConfig } from '../index'

export const moigyeSubgraph: SubgraphConfig = {
  name: 'moigye',
  description: 'Indexes Gye circles, members, rounds, contributions, and bids on VeryChain',
  thegraph: {
    endpoint: '', // Constructed dynamically from NEXT_PUBLIC_INDEXER_URL
  },
  goldsky: {
    endpoint: '',
    versionEndpoint: '',
  },
  activeProvider: 'thegraph',
  contracts: [
    {
      name: 'GyeFactory',
      address: '0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb',
      chainId: 4613,
      chainName: 'VeryChain',
      explorerUrl: 'https://www.veryscan.io/address/0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb',
      startBlock: 4131357,
    },
  ],
  schemaContent: `
type Circle @entity {
  id: ID!
  address: Bytes!
  creator: Bytes!
  name: String!
  contributionAmount: BigInt!
  frequency: BigInt!
  totalRounds: Int!
  currentRound: Int!
  stakeRequired: BigInt!
  penaltyRate: Int!
  payoutMethod: Int!
  status: Int!
  memberCount: Int!
  totalContributed: BigInt!
  members: [Member!]! @derivedFrom(field: "circle")
  rounds: [Round!]! @derivedFrom(field: "circle")
  createdAt: BigInt!
  createdAtBlock: BigInt!
}

type Member @entity {
  id: ID!
  circle: Circle!
  address: Bytes!
  stakeDeposited: BigInt!
  hasReceivedPayout: Boolean!
  contributionCount: Int!
  totalContributed: BigInt!
  joinedAt: BigInt!
  contributions: [Contribution!]! @derivedFrom(field: "member")
}

type Round @entity {
  id: ID!
  circle: Circle!
  roundNumber: Int!
  startTime: BigInt!
  deadline: BigInt!
  totalContributed: BigInt!
  contributionCount: Int!
  winner: Bytes
  winnerAmount: BigInt
  status: Int!
  contributions: [Contribution!]! @derivedFrom(field: "round")
  bids: [Bid!]! @derivedFrom(field: "round")
}

type Contribution @entity {
  id: ID!
  circle: Circle!
  round: Round!
  member: Member!
  amount: BigInt!
  timestamp: BigInt!
  txHash: Bytes!
}

type Bid @entity {
  id: ID!
  circle: Circle!
  round: Round!
  bidder: Bytes!
  amount: BigInt!
  timestamp: BigInt!
}
`,
}
