/**
 * Transaction Utilities
 * Common utilities for handling transactions with Korean error messages
 */

import type { Hash, PublicClient, TransactionReceipt, Abi } from 'viem'
import { decodeEventLog } from 'viem'

export interface TransactionResult<T = undefined> {
  hash: Hash
  success: boolean
  data?: T
  receipt?: TransactionReceipt
}

/**
 * Wait for transaction confirmation and return the receipt
 */
export async function waitForTx(
  publicClient: PublicClient,
  hash: Hash
): Promise<TransactionReceipt> {
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  return receipt
}

export interface ParsedEvent {
  eventName: string
  args: Record<string, unknown>
}

/**
 * Parse event logs from a transaction receipt
 */
export function parseEventLogs(
  receipt: TransactionReceipt,
  abi: Abi,
  eventName: string
): ParsedEvent[] {
  const events: ParsedEvent[] = []

  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics,
      })
      if (decoded.eventName === eventName) {
        events.push({
          eventName: decoded.eventName,
          args: (decoded.args ?? {}) as Record<string, unknown>,
        })
      }
    } catch {
      // Skip logs that don't match the ABI
    }
  }

  return events
}

/**
 * Get the i18n key for a transaction error
 * Returns a translation key that should be used with the t() function
 */
export function getTxErrorKey(error: Error | unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  // User rejection
  if (message.includes('user rejected') || message.includes('User rejected')) {
    return 'errors.userRejected'
  }

  // Insufficient funds
  if (message.includes('insufficient funds') || message.includes('InsufficientFunds')) {
    return 'errors.insufficientFunds'
  }

  // Gas estimation failures
  if (message.includes('gas') && message.includes('exceed')) {
    return 'errors.gasExceeded'
  }

  // Contract errors - Gye specific
  if (message.includes('AlreadyMember')) {
    return 'errors.alreadyMember'
  }
  if (message.includes('NotMember')) {
    return 'errors.notMember'
  }
  if (message.includes('InsufficientStake')) {
    return 'errors.insufficientStake'
  }
  if (message.includes('InsufficientContribution')) {
    return 'errors.insufficientContribution'
  }
  if (message.includes('CircleNotForming')) {
    return 'errors.circleNotForming'
  }
  if (message.includes('CircleNotActive')) {
    return 'errors.circleNotActive'
  }
  if (message.includes('MaxMembersReached')) {
    return 'errors.maxMembersReached'
  }
  if (message.includes('AlreadyContributed')) {
    return 'errors.alreadyContributed'
  }
  if (message.includes('RoundDeadlinePassed')) {
    return 'errors.roundDeadlinePassed'
  }
  if (message.includes('RoundNotEnded')) {
    return 'errors.roundNotEnded'
  }
  if (message.includes('AlreadyReceivedPayout')) {
    return 'errors.alreadyReceivedPayout'
  }
  if (message.includes('NotEligibleForPayout')) {
    return 'errors.notEligibleForPayout'
  }
  if (message.includes('BidTooLow')) {
    return 'errors.bidTooLow'
  }
  if (message.includes('InvalidConfig')) {
    return 'errors.invalidConfig'
  }

  // Network errors
  if (message.includes('network') || message.includes('connection')) {
    return 'errors.networkError'
  }

  // Timeout
  if (message.includes('timeout')) {
    return 'errors.timeout'
  }

  // Default error
  return 'errors.default'
}

/**
 * @deprecated Use getTxErrorKey instead and translate in the component
 */
export function formatTxError(error: Error | unknown): string {
  return getTxErrorKey(error)
}

/**
 * Common constants for Gye contracts
 */
export const GYE_CONSTANTS = {
  // Payout methods
  PAYOUT_AUCTION: 0,
  PAYOUT_RANDOM: 1,
  PAYOUT_FIXED_ORDER: 2,

  // Circle status
  STATUS_FORMING: 0,
  STATUS_ACTIVE: 1,
  STATUS_COMPLETED: 2,

  // Time constants
  WEEKLY: 604800n,    // 7 days in seconds
  BIWEEKLY: 1209600n, // 14 days in seconds
  MONTHLY: 2592000n,  // 30 days in seconds

  // Penalty defaults
  DEFAULT_PENALTY_RATE: 500, // 5% in basis points
} as const

export type PayoutMethod = 0 | 1 | 2
export type CircleStatus = 0 | 1 | 2
