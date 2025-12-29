#!/bin/bash
set -e

# Load environment
source .env

RPC="https://rpc.verylabs.io"
FACTORY="0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb"

echo "=== VeryChain Mainnet Operations ==="
echo "Factory: $FACTORY"

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Deployer: $DEPLOYER"
echo "Balance: $(cast balance $DEPLOYER --rpc-url $RPC --ether) VERY"

# Generate deterministic wallet keys
echo ""
echo "=== Generating Test Wallets ==="
WALLET_KEYS=()
WALLET_ADDRS=()

for i in {1..10}; do
  # Generate key deterministically (same as in Solidity)
  KEY=$(cast keccak "$(cast abi-encode 'f(uint256,string,uint256)' $PRIVATE_KEY 'moigye_test' $i)")
  ADDR=$(cast wallet address --private-key $KEY)
  WALLET_KEYS+=("$KEY")
  WALLET_ADDRS+=("$ADDR")
  echo "Wallet $i: $ADDR"
done

# Fund wallets that need it
echo ""
echo "=== Funding Wallets ==="
FUND_AMOUNT="0.015ether"

for i in {0..9}; do
  ADDR="${WALLET_ADDRS[$i]}"
  BALANCE=$(cast balance $ADDR --rpc-url $RPC)
  if [ "$BALANCE" = "0" ]; then
    echo "Funding wallet $((i+1))..."
    cast send $ADDR --value $FUND_AMOUNT --private-key $PRIVATE_KEY --rpc-url $RPC >/dev/null 2>&1
    echo "  Funded: $(cast balance $ADDR --rpc-url $RPC --ether) VERY"
  else
    echo "Wallet $((i+1)) already has $(cast to-unit $BALANCE ether) VERY"
  fi
done

echo ""
echo "=== Creating Circle 1: Fixed Order (3 members) ==="

# Check if circles exist
CIRCLE_COUNT=$(cast call $FACTORY "circleCount()(uint256)" --rpc-url $RPC)
echo "Current circle count: $CIRCLE_COUNT"

if [ "$CIRCLE_COUNT" = "0" ]; then
  # Create circle 1 with wallet 0
  echo "Creating circle with wallet 1..."

  # Encode CircleConfig struct for createAndJoinCircle
  # name, contributionAmount, frequency, totalRounds, stakeRequired, penaltyRate, payoutMethod
  cast send $FACTORY "createAndJoinCircle((string,uint256,uint256,uint256,uint256,uint256,uint8))" \
    "(Moigye Alpha,1000000000000000,60,3,3000000000000000,1000,2)" \
    --value 0.003ether \
    --private-key "${WALLET_KEYS[0]}" \
    --rpc-url $RPC >/dev/null 2>&1

  echo "Circle 1 created!"

  # Get circle address
  CIRCLE1=$(cast call $FACTORY "circles(uint256)(address)" 0 --rpc-url $RPC)
  echo "Circle 1 address: $CIRCLE1"

  # Wallet 1 and 2 join
  echo "Wallet 2 joining..."
  cast send $CIRCLE1 "join()" --value 0.003ether --private-key "${WALLET_KEYS[1]}" --rpc-url $RPC >/dev/null 2>&1

  echo "Wallet 3 joining..."
  cast send $CIRCLE1 "join()" --value 0.003ether --private-key "${WALLET_KEYS[2]}" --rpc-url $RPC >/dev/null 2>&1

  # Start circle
  echo "Starting circle..."
  cast send $CIRCLE1 "startCircle()" --private-key "${WALLET_KEYS[0]}" --rpc-url $RPC >/dev/null 2>&1

  # All contribute
  echo "All members contributing..."
  cast send $CIRCLE1 "contribute()" --value 0.001ether --private-key "${WALLET_KEYS[0]}" --rpc-url $RPC >/dev/null 2>&1
  cast send $CIRCLE1 "contribute()" --value 0.001ether --private-key "${WALLET_KEYS[1]}" --rpc-url $RPC >/dev/null 2>&1
  cast send $CIRCLE1 "contribute()" --value 0.001ether --private-key "${WALLET_KEYS[2]}" --rpc-url $RPC >/dev/null 2>&1

  echo "Circle 1 complete with all contributions!"
fi

echo ""
echo "=== Creating Circle 2: Random (5 members) ==="

CIRCLE_COUNT=$(cast call $FACTORY "circleCount()(uint256)" --rpc-url $RPC)
if [ "$CIRCLE_COUNT" = "1" ]; then
  echo "Creating circle 2 with wallet 4..."

  cast send $FACTORY "createAndJoinCircle((string,uint256,uint256,uint256,uint256,uint256,uint8))" \
    "(Moigye Beta,500000000000000,120,5,2000000000000000,500,1)" \
    --value 0.002ether \
    --private-key "${WALLET_KEYS[3]}" \
    --rpc-url $RPC >/dev/null 2>&1

  CIRCLE2=$(cast call $FACTORY "circles(uint256)(address)" 1 --rpc-url $RPC)
  echo "Circle 2 address: $CIRCLE2"

  # Wallets 4-7 join
  for i in {4..7}; do
    echo "Wallet $((i+1)) joining..."
    cast send $CIRCLE2 "join()" --value 0.002ether --private-key "${WALLET_KEYS[$i]}" --rpc-url $RPC >/dev/null 2>&1
  done

  echo "Circle 2 complete!"
fi

echo ""
echo "=== Creating Circle 3: Auction (10 members) ==="

CIRCLE_COUNT=$(cast call $FACTORY "circleCount()(uint256)" --rpc-url $RPC)
if [ "$CIRCLE_COUNT" = "2" ]; then
  echo "Creating circle 3 with wallet 9..."

  cast send $FACTORY "createAndJoinCircle((string,uint256,uint256,uint256,uint256,uint256,uint8))" \
    "(Moigye Gamma,200000000000000,180,10,1000000000000000,2000,0)" \
    --value 0.001ether \
    --private-key "${WALLET_KEYS[8]}" \
    --rpc-url $RPC >/dev/null 2>&1

  CIRCLE3=$(cast call $FACTORY "circles(uint256)(address)" 2 --rpc-url $RPC)
  echo "Circle 3 address: $CIRCLE3"

  # All wallets except 8 join
  for i in 0 1 2 3 4 5 6 7 9; do
    echo "Wallet $((i+1)) joining..."
    cast send $CIRCLE3 "join()" --value 0.001ether --private-key "${WALLET_KEYS[$i]}" --rpc-url $RPC >/dev/null 2>&1
  done

  echo "Circle 3 complete!"
fi

echo ""
echo "=== FINAL REPORT ==="
echo "Factory: $FACTORY"
echo "Circle count: $(cast call $FACTORY 'circleCount()(uint256)' --rpc-url $RPC)"
echo ""
echo "Circle 1: $(cast call $FACTORY 'circles(uint256)(address)' 0 --rpc-url $RPC)"
echo "Circle 2: $(cast call $FACTORY 'circles(uint256)(address)' 1 --rpc-url $RPC)"
echo "Circle 3: $(cast call $FACTORY 'circles(uint256)(address)' 2 --rpc-url $RPC)"
echo ""
echo "Deployer balance: $(cast balance $DEPLOYER --rpc-url $RPC --ether) VERY"
echo ""
echo "=== SUCCESS ==="
