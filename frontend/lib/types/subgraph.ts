export interface Circle {
  id: string
  address: string
  name: string
  creator: string
  contributionAmount: string
  frequency: string
  totalRounds: number
  currentRound: number
  stakeRequired: string
  penaltyRate: number
  payoutMethod: number
  status: number
  memberCount: number
  totalContributed: string
  createdAt: string
  members: Member[]
  rounds: Round[]
}

export interface CircleListItem {
  id: string
  address: string
  name: string
  creator: string
  contributionAmount: string
  frequency: string
  totalRounds: number
  currentRound: number
  stakeRequired: string
  status: number
  memberCount: number
}

export interface Member {
  id: string
  address: string
  stakeDeposited: string
  hasReceivedPayout: boolean
  contributionCount: number
  totalContributed: string
  joinedAt: string
  circle: Circle
}

export interface MembershipWithCircle {
  id: string
  stakeDeposited: string
  hasReceivedPayout: boolean
  contributionCount: number
  totalContributed: string
  circle: CircleListItem
}

export interface Round {
  id: string
  roundNumber: number
  deadline: string
  totalContributed: string
  contributionCount: number
  winner: string | null
  status: number
}

export interface Contribution {
  id: string
  member: { address: string }
  amount: string
  timestamp: string
  txHash: string
}

// Query response types
export interface GetCirclesResponse {
  circles: CircleListItem[]
}

export interface GetCircleResponse {
  circle: Circle | null
}

export interface GetUserCirclesResponse {
  members: MembershipWithCircle[]
}

export interface GetCircleContributionsResponse {
  contributions: Contribution[]
}

// User stats calculated from memberships
export interface UserCircleStats {
  totalCircles: number
  totalContributed: bigint
  activeCircles: number
  completedPayouts: number
}

// Leaderboard types
export interface LeaderboardCircle {
  id: string
  address: string
  name: string
  totalContributed: string
  memberCount: number
  status: number
  currentRound: number
  totalRounds: number
}

export interface LeaderboardMember {
  id: string
  address: string
  totalContributed: string
  contributionCount: number
  circle: {
    id: string
    name: string
  }
}

export interface GetTopCirclesResponse {
  circles: LeaderboardCircle[]
}

export interface GetTopMembersResponse {
  members: LeaderboardMember[]
}
