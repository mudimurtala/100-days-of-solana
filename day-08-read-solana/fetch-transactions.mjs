import { createSolanaRpc, devnet, address } from "@solana/kit";

// 1. Instantiating our client connection to the public Devnet cluster
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

// 2. Pointing at the Token-2022 Program ID (high-volume on-chain activity)
const targetAddress = address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

console.log(`Connecting to devnet and fetching history for: ${targetAddress}...\n`);

// 3. Requesting the 5 most recent transaction metadata payloads
const signatures = await rpc
  .getSignaturesForAddress(targetAddress, { limit: 5 })
  .send();

console.log(`Last 5 transactions for ${targetAddress}:\n`);

// 4. Map over the transaction logs and output them cleanly
for (const tx of signatures) {
  // Translate the Unix epoch timestamp if present
  const time = tx.blockTime
    ? new Date(Number(tx.blockTime) * 1000).toLocaleString()
    : "unknown";

  console.log(`Signature : ${tx.signature}`);
  console.log(`Slot      : ${tx.slot}`);
  console.log(`Time      : ${time}`);
  console.log(`Status    : ${tx.err ? "Failed" : "Success"}`);
  console.log("---");
}
