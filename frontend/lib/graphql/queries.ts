import { gql } from '@apollo/client'

export const GET_CIRCLES = gql`
  query GetCircles($first: Int, $skip: Int) {
    circles(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
      id
      address
      name
      creator
      contributionAmount
      frequency
      totalRounds
      currentRound
      stakeRequired
      status
      memberCount
    }
  }
`

export const GET_CIRCLES_FILTERED = gql`
  query GetCirclesFiltered(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: Circle_filter
  ) {
    circles(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      address
      name
      creator
      contributionAmount
      frequency
      totalRounds
      currentRound
      stakeRequired
      status
      memberCount
    }
  }
`

export const GET_CIRCLES_COUNT = gql`
  query GetCirclesCount($where: Circle_filter) {
    circles(where: $where) {
      id
    }
  }
`

export const GET_CIRCLE = gql`
  query GetCircle($id: ID!) {
    circle(id: $id) {
      id
      address
      name
      creator
      contributionAmount
      frequency
      totalRounds
      currentRound
      stakeRequired
      penaltyRate
      payoutMethod
      status
      memberCount
      totalContributed
      createdAt
      members {
        id
        address
        stakeDeposited
        hasReceivedPayout
        contributionCount
        joinedAt
      }
      rounds(orderBy: roundNumber) {
        id
        roundNumber
        deadline
        totalContributed
        contributionCount
        winner
        status
      }
    }
  }
`

export const GET_USER_CIRCLES = gql`
  query GetUserCircles($address: Bytes!) {
    members(where: { address: $address }) {
      id
      stakeDeposited
      hasReceivedPayout
      contributionCount
      totalContributed
      circle {
        id
        address
        name
        contributionAmount
        frequency
        currentRound
        totalRounds
        status
        memberCount
      }
    }
  }
`

export const GET_USER_CREATED_CIRCLES = gql`
  query GetUserCreatedCircles($creator: Bytes!) {
    circles(where: { creator: $creator }, orderBy: createdAt, orderDirection: desc) {
      id
      address
      name
      creator
      contributionAmount
      frequency
      totalRounds
      currentRound
      stakeRequired
      status
      memberCount
    }
  }
`

export const GET_CIRCLE_CONTRIBUTIONS = gql`
  query GetCircleContributions($circleId: ID!, $roundNumber: Int!) {
    contributions(
      where: { circle: $circleId, round_: { roundNumber: $roundNumber } }
      orderBy: timestamp
    ) {
      id
      member {
        address
      }
      amount
      timestamp
      txHash
    }
  }
`

// Leaderboard queries
export const GET_TOP_CIRCLES_BY_CONTRIBUTIONS = gql`
  query GetTopCirclesByContributions($first: Int) {
    circles(first: $first, orderBy: totalContributed, orderDirection: desc) {
      id
      address
      name
      totalContributed
      memberCount
      status
      currentRound
      totalRounds
    }
  }
`

export const GET_TOP_MEMBERS_BY_CONTRIBUTIONS = gql`
  query GetTopMembersByContributions($first: Int) {
    members(first: $first, orderBy: totalContributed, orderDirection: desc) {
      id
      address
      totalContributed
      contributionCount
      circle {
        id
        name
      }
    }
  }
`
