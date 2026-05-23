import {
  createSolanaRpc,
  devnet,
  generateKeyPair,
  createKeyPairSignerFromBytes,
  createSignerFromKeyPair,
} from "@solana/kit";
import { readFile, writeFile } from "node:fs/promises";

// 1. Define the filename where our wallet secrets will be saved on your hard drive
const WALLET_FILE = "wallet.json";

// 2. Connect our script to Solana's online playground (Devnet)
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

/**
 * This function handles the logic of reloading an old wallet or making a new one.
 * It uses a try/catch block: it "tries" to read a file, and if that fails (error), 
 * it drops down to the "catch" block to create a brand new file.
 */
async function loadOrCreateWallet() {
  try {
    // TRYING TO LOAD AN EXISTING WALLET
    // Read the wallet.json file as text data
    const fileContent = await readFile(WALLET_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    
    // Convert the array of numbers back into a raw computer memory format (Uint8Array)
    const secretBytes = new Uint8Array(data.secretKey);
    
    // Reconstruct the usable wallet object using those raw bytes
    const wallet = await createKeyPairSignerFromBytes(secretBytes);
    
    console.log("🟢 Loaded existing wallet from disk:", wallet.address);
    return wallet;

  } catch (error) {
    // CATCHING THE FAILURE (Runs only if wallet.json does not exist yet)
    console.log("🟡 No existing wallet found. Generating a brand new one...");

    // Generate keys. We pass 'true' to allow extracting the raw inner bytes to save them.
    const keyPair = await generateKeyPair(true);

    // Export the public key part into raw numbers
    const publicKeyBytes = new Uint8Array(
      await crypto.subtle.exportKey("raw", keyPair.publicKey)
    );

    // Export the private key. Node.js requires a special wrapper layout called "pkcs8"
    const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    
    // The "pkcs8" format adds a 16-byte header. We slice off the last 32 bytes to get the pure key data.
    const privateKeyBytes = new Uint8Array(pkcs8).slice(-32);

    // Combine them: 32 bytes of Private Key + 32 bytes of Public Key = 64 bytes total
    const keypairBytes = new Uint8Array(64);
    keypairBytes.set(privateKeyBytes, 0);       // Put private bytes at the start (index 0)
    keypairBytes.set(publicKeyBytes, 32);       // Put public bytes right after (index 32)

    // Convert the raw data into a standard readable text array and save it to wallet.json
    await writeFile(
      WALLET_FILE,
      JSON.stringify({ secretKey: Array.from(keypairBytes) }, null, 2)
    );

    // Turn our active keypair into an app-ready signer object
    const wallet = await createSignerFromKeyPair(keyPair);
    console.log("💾 Saved new wallet securely to:", WALLET_FILE);
    return wallet;
  }
}

// --- EXECUTION START ---

// Run our load/create helper function
const wallet = await loadOrCreateWallet();

// Fetch the account balance directly from the Solana Devnet blockchain
const { value: balance } = await rpc.getBalance(wallet.address).send();

// Convert the balance from Lamports (fractions) to standard SOL units
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`\nAddress: ${wallet.address}`);
console.log(`Balance: ${balanceInSol} SOL`);

// Friendly warning if the wallet balance is completely empty
if (balanceInSol === 0) {
  console.log("\n❌ This wallet has no SOL.");
  console.log("Go to https://faucet.solana.com/ and airdrop some to this address:");
  console.log(wallet.address);
}
