/**
 * Gye (계) Contract Utilities
 * Provides hooks and utilities for interacting with GyeFactory and GyeCircle contracts
 */

import type { Address, PublicClient, WalletClient, Abi } from 'viem'
import { getContract } from 'viem'
import { getContractAbi, getContractByName } from '@/constants/contracts'
import { verychain } from '@/constants/chains/verychain'

// VeryChain mainnet
const CHAIN_ID = 4613

// Cached ABIs
let gyeFactoryAbi: Abi | null = null
let gyeCircleAbi: Abi | null = null

/**
 * Load GyeFactory ABI
 */
export async function getGyeFactoryAbi(): Promise<Abi> {
  if (!gyeFactoryAbi) {
    gyeFactoryAbi = await getContractAbi(CHAIN_ID, 'GyeFactory')
    if (!gyeFactoryAbi) {
      throw new Error('GyeFactory ABI not found')
    }
  }
  return gyeFactoryAbi
}

/**
 * Load GyeCircle ABI
 */
export async function getGyeCircleAbi(): Promise<Abi> {
  if (!gyeCircleAbi) {
    gyeCircleAbi = await getContractAbi(CHAIN_ID, 'GyeCircle')
    if (!gyeCircleAbi) {
      throw new Error('GyeCircle ABI not found')
    }
  }
  return gyeCircleAbi
}

/**
 * Get GyeFactory contract address
 */
export async function getGyeFactoryAddress(): Promise<Address> {
  const contract = await getContractByName(CHAIN_ID, 'GyeFactory')
  if (!contract) {
    throw new Error('GyeFactory contract not found')
  }
  return contract.address
}

/**
 * Create GyeFactory contract instance for read operations
 */
export async function getGyeFactoryContract(publicClient: PublicClient) {
  const [address, abi] = await Promise.all([
    getGyeFactoryAddress(),
    getGyeFactoryAbi(),
  ])

  return getContract({
    address,
    abi,
    client: publicClient,
  })
}

/**
 * Create GyeFactory contract instance for write operations
 */
export async function getGyeFactoryWriteContract(
  publicClient: PublicClient,
  walletClient: WalletClient
) {
  const [address, abi] = await Promise.all([
    getGyeFactoryAddress(),
    getGyeFactoryAbi(),
  ])

  return getContract({
    address,
    abi,
    client: { public: publicClient, wallet: walletClient },
  })
}

/**
 * Create GyeCircle contract instance for read operations
 */
export async function getGyeCircleContract(
  publicClient: PublicClient,
  circleAddress: Address
) {
  const abi = await getGyeCircleAbi()

  return getContract({
    address: circleAddress,
    abi,
    client: publicClient,
  })
}

/**
 * Create GyeCircle contract instance for write operations
 */
export async function getGyeCircleWriteContract(
  publicClient: PublicClient,
  walletClient: WalletClient,
  circleAddress: Address
) {
  const abi = await getGyeCircleAbi()

  return getContract({
    address: circleAddress,
    abi,
    client: { public: publicClient, wallet: walletClient },
  })
}

// Export chain config for convenience
export { verychain, CHAIN_ID }
