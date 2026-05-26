import { 
  address,
  createKeyPairSignerFromBytes, // Critical helper from course text
  createSolanaRpc,
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayerSigner, // Uses the Signer model
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  signTransactionMessageWithSigners, // Automatically signs the built message
  getSignatureFromTransaction,
  getBase64EncodedWireTransaction,
  lamports,
  devnet
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { readFileSync } from "fs";
import { homedir } from "os";

// 1. Ingest input arguments from terminal execution
const [,, recipientInput, amountInput] = process.argv;

console.log("====================================");
console.log("   LIVE TRACKING TRANSFER ENGINE    ");
console.log("====================================\n");

if (!recipientInput || !amountInput) {
  console.log("Usage: node transfer.mjs <recipient_address> <sol_amount>");
  console.log("Example: node transfer.mjs 8eyFmGoAy... 0.01\n");
  process.exit(1);
}

const solAmount = parseFloat(amountInput);

// Step 3: Progress indicator helper
function statusUpdate(message) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(message);
}

// Step 4: The exact confirmation logic provided in the challenge gist
const COMMITMENT_LEVELS = ["processed", "confirmed", "finalized"];

async function waitForCommitment(rpc, signature, targetCommitment) {
  const targetIndex = COMMITMENT_LEVELS.indexOf(targetCommitment);

  while (true) {
    const { value } = await rpc
      .getSignatureStatuses([signature], { searchTransactionHistory: true })
      .send();

    const status = value[0];

    if (status?.err) {
      throw new Error(`Transaction failed on-chain: ${JSON.stringify(status.err)}`);
    }

    if (status) {
      const currentIndex = COMMITMENT_LEVELS.indexOf(status.confirmationStatus);
      if (currentIndex >= targetIndex) break;
    }

    await new Promise((r) => setTimeout(r, 500));
  }
}

async function transferWithConfirmation(rpc, signer, toAddress, amountInSOL) {
  const destination = address(toAddress);
  const lamportAmount = lamports(BigInt(Math.round(amountInSOL * 1_000_000_000)));

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(signer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(
        getTransferSolInstruction({
          source: signer,
          destination,
          amount: lamportAmount,
        }),
        tx
      )
  );

  const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
  const signature = getSignatureFromTransaction(signedTransaction);
  const wireTransaction = getBase64EncodedWireTransaction(signedTransaction);

  console.log(`Sending ${amountInSOL} SOL to ${toAddress}...\n`);

  // Step A: Send the transaction
  statusUpdate("Status: Sending transaction...");
  
  // Hand the wire transaction directly to the RPC endpoint execution line
  await rpc.sendTransaction(wireTransaction, { encoding: "base64" }).send();

  statusUpdate("Status: Processed (included in a block)...");

  // Step B: Wait for confirmed status
  await waitForCommitment(rpc, signature, "confirmed");
  statusUpdate("Status: Confirmed (supermajority voted)...");

  // Step C: Wait for finalized status
  await waitForCommitment(rpc, signature, "finalized");
  statusUpdate("Status: Finalized (irreversible)");

  console.log("\n");

  return signature;
}

// Main operational driver
async function main() {
  try {
    const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

    // Extract local keypair and generate a fully validated KeyPairSigner instance
    const keypairPath = `${homedir()}/.config/solana/id.json`;
    const rawKeypairFileData = JSON.parse(readFileSync(keypairPath, "utf-8"));
    const secretKeyBytes = new Uint8Array(rawKeypairFileData);
    const sender = await createKeyPairSignerFromBytes(secretKeyBytes);

    // Run steps 5 & 6 with error handling
    const signature = await transferWithConfirmation(rpc, sender, recipientInput, solAmount);
    
    console.log("Transaction successful!");
    console.log(`Signature: ${signature}`);
    console.log(`View on Solana Explorer:`);
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet\n`);

  } catch (error) {
    console.error("\nTransaction failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();