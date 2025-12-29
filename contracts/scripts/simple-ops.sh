#!/bin/bash
set -e

source .env
RPC="https://rpc.verylabs.io"
FACTORY="0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb"

# These are the wallets generated in Solidity (from previous run)
WALLET1="0x00cf200DEE673bfC754Aad36a6f9A9bF7603B134"

echo "=== VeryChain Simple Operations ==="
echo "Factory: $FACTORY"

DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Deployer: $DEPLOYER"

# Get start balance
START_BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC)
echo "Start balance: $(cast to-unit $START_BALANCE ether) VERY"

# Fund more wallets directly
echo ""
echo "=== Funding Additional Wallets ==="
FUND_AMOUNT="0.02ether"

# Create 5 new wallets from deployer key
for i in {1..5}; do
  NEW_KEY=$(cast wallet new --json | jq -r '.[0].private_key')
  NEW_ADDR=$(cast wallet address --private-key $NEW_KEY)
  echo "Funding new wallet $i: $NEW_ADDR"
  cast send $NEW_ADDR --value $FUND_AMOUNT --private-key $PRIVATE_KEY --rpc-url $RPC >/dev/null 2>&1
  echo "  Done!"

  if [ $i -eq 1 ]; then
    WALLET2_KEY=$NEW_KEY
    WALLET2=$NEW_ADDR
  elif [ $i -eq 2 ]; then
    WALLET3_KEY=$NEW_KEY
    WALLET3=$NEW_ADDR
  elif [ $i -eq 3 ]; then
    WALLET4_KEY=$NEW_KEY
    WALLET4=$NEW_ADDR
  elif [ $i -eq 4 ]; then
    WALLET5_KEY=$NEW_KEY
    WALLET5=$NEW_ADDR
  elif [ $i -eq 5 ]; then
    WALLET6_KEY=$NEW_KEY
    WALLET6=$NEW_ADDR
  fi
done

echo ""
echo "=== Creating Circle 1: Fixed Order ==="
CIRCLE_COUNT=$(cast call $FACTORY "circleCount()(uint256)" --rpc-url $RPC)
echo "Current circles: $CIRCLE_COUNT"

if [ "$CIRCLE_COUNT" = "0" ]; then
  echo "Deployer creating circle 1..."

  TX=$(cast send $FACTORY "createAndJoinCircle((string,uint256,uint256,uint256,uint256,uint256,uint8))" \
    "(Moigye Alpha,1000000000000000,60,3,3000000000000000,1000,2)" \
    --value 0.003ether \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC --json 2>&1 | jq -r '.transactionHash')
  echo "TX: $TX"

  CIRCLE1=$(cast call $FACTORY "circles(uint256)(address)" 0 --rpc-url $RPC)
  echo "Circle 1: $CIRCLE1"

  echo "Wallet 2 joining..."
  cast send $CIRCLE1 "join()" --value 0.003ether --private-key $WALLET2_KEY --rpc-url $RPC >/dev/null 2>&1

  echo "Wallet 3 joining..."
  cast send $CIRCLE1 "join()" --value 0.003ether --private-key $WALLET3_KEY --rpc-url $RPC >/dev/null 2>&1

  echo "Starting circle..."
  cast send $CIRCLE1 "startCircle()" --private-key $PRIVATE_KEY --rpc-url $RPC >/dev/null 2>&1

  echo "All contributing..."
  cast send $CIRCLE1 "contribute()" --value 0.001ether --private-key $PRIVATE_KEY --rpc-url $RPC >/dev/null 2>&1
  cast send $CIRCLE1 "contribute()" --value 0.001ether --private-key $WALLET2_KEY --rpc-url $RPC >/dev/null 2>&1
  cast send $CIRCLE1 "contribute()" --value 0.001ether --private-key $WALLET3_KEY --rpc-url $RPC >/dev/null 2>&1

  echo "Circle 1 complete!"
fi

echo ""
echo "=== Creating Circle 2: Random ==="
CIRCLE_COUNT=$(cast call $FACTORY "circleCount()(uint256)" --rpc-url $RPC)

if [ "$CIRCLE_COUNT" = "1" ]; then
  echo "Wallet 4 creating circle 2..."

  cast send $FACTORY "createAndJoinCircle((string,uint256,uint256,uint256,uint256,uint256,uint8))" \
    "(Moigye Beta,500000000000000,120,5,2000000000000000,500,1)" \
    --value 0.002ether \
    --private-key $WALLET4_KEY \
    --rpc-url $RPC >/dev/null 2>&1

  CIRCLE2=$(cast call $FACTORY "circles(uint256)(address)" 1 --rpc-url $RPC)
  echo "Circle 2: $CIRCLE2"

  echo "Wallet 5 joining..."
  cast send $CIRCLE2 "join()" --value 0.002ether --private-key $WALLET5_KEY --rpc-url $RPC >/dev/null 2>&1

  echo "Wallet 6 joining..."
  cast send $CIRCLE2 "join()" --value 0.002ether --private-key $WALLET6_KEY --rpc-url $RPC >/dev/null 2>&1

  echo "Circle 2 complete!"
fi

echo ""
echo "=== FINAL REPORT ==="
END_BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC)
SPENT=$((($START_BALANCE - $END_BALANCE)))

echo "Factory: $FACTORY"
echo "Circles created: $(cast call $FACTORY 'circleCount()(uint256)' --rpc-url $RPC)"
echo ""
echo "Circle 1: $(cast call $FACTORY 'circles(uint256)(address)' 0 --rpc-url $RPC 2>/dev/null || echo 'N/A')"
echo "Circle 2: $(cast call $FACTORY 'circles(uint256)(address)' 1 --rpc-url $RPC 2>/dev/null || echo 'N/A')"
echo ""
echo "Start: $(cast to-unit $START_BALANCE ether) VERY"
echo "End: $(cast to-unit $END_BALANCE ether) VERY"
echo "Spent: $(cast to-unit $SPENT ether) VERY"
echo ""
echo "=== DONE ==="
