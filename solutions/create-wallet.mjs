import {
  generateKeyPairSigner,
  createSolanaRpc,
  devnet,
  address,
} from "@solana/kit";

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

// Paste YOUR funded address from step 4 here
const myAddress = address("AZdQbA5QnJaYJdmdCBAE93YjoFSMcqeHJA6JXPir9gSy");

const { value: balance } = await rpc.getBalance(myAddress).send();
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`Balance: ${balanceInSol} SOL`);
