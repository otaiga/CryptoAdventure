#!/bin/bash
set -e

run_client(){
  cd client
  npm run dev
}

run_hathat_node(){
  npx hardhat node
}

run_hathat_node | cat - &
npx hardhat run --network localhost ./scripts/deployLocal.ts
run_client &
wait