import { createSolanaRpc, devnet, address } from "@solana/kit";

// 1. Establish an open connection to Solana's public Devnet cluster
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

// 2. Set the target address you want to look up
// PUT YOUR OWN WALLET PUBLIC KEY STRING INSIDE THE QUOTES BELOW
const targetAddress = address("cRrbhRLCyJcWV6Tmzti4v7aXXXSaRVckTGwaDCspNZM");

// 3. Query the live ledger account state directly
const { value: balanceInLamports } = await rpc
  .getBalance(targetAddress)
  .send();

// 4. Convert the raw lamports into a human-readable SOL format
const balanceInSol = Number(balanceInLamports) / 1_000_000_000;

// 5. Output the results cleanly into your terminal
console.log(`Address: ${targetAddress}`);
console.log(`Balance: ${balanceInSol} SOL`);
