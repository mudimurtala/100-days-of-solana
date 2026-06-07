# Mudi's Solana Reference Guide
### From Zero to Confident — Everything You Need to Know

---

## PART 1: THE BIG PICTURE (Start Here)

### What is Web2?
Web2 is the internet you already know. When you log into Instagram, your account lives on Instagram's server. Instagram controls it. They can delete it, lock you out, or change the rules anytime. The same is true for banks, Google, Twitter, everything. A company owns your data and your identity on their platform.

### What is Web3?
Web3 is a different model. Instead of a company's server holding your account, a **blockchain** does. A blockchain is a shared ledger maintained by thousands of computers worldwide simultaneously. Nobody owns it. Nobody can shut it down. Your account belongs to you and only you, because the only thing that proves ownership is your private key, which only you hold.

### What is Solana?
Solana is one of the most popular blockchains. Think of it as a global public computer that anyone can write programs to and read data from. It is very fast (tens of thousands of transactions per second) and very cheap (fractions of a cent per transaction). Developers build wallets, tokens, games, and financial apps on it.

### The one sentence that explains everything:
> On Solana, your identity is a keypair, your storage is an account, and your logic is a program.

---

## PART 2: CORE TERMINOLOGY (The Words You Keep Hearing)

### Keypair
A keypair is two mathematically linked keys generated together.

- **Public key** = Your address. Like your bank account number. Safe to share with anyone.
- **Private key** = Your secret proof of ownership. Never share this with anyone, ever.

When you want to do something on Solana (send tokens, sign a transaction), you use your private key to sign it. Anyone can verify that signature using your public key. No company in the middle. No password. Just math.

```
Think of it like a padlock and a key.
The padlock (public key) is visible to everyone.
Only the key (private key) can open it.
```

### Wallet
A wallet is not where your money is stored. Your money (SOL) lives on the blockchain. A wallet is the tool that holds your private key and lets you interact with the blockchain. Browser wallets like Phantom store your private key securely and show you your balance. You used Phantom on Day 4.

### SOL
SOL is the native currency of Solana. You use it to pay for transactions (like paying petrol to run a car). Every action on Solana costs a tiny amount of SOL.

### Lamports
The smallest unit of SOL. Like kobo to naira or cents to dollars.
```
1 SOL = 1,000,000,000 lamports (one billion)
```
Solana always works in lamports internally. When you see large numbers in terminal output, divide by one billion to get the SOL value.

### Account
This is the most important word in all of Solana. **Everything on Solana is an account.**

Every account has exactly five fields:
| Field | What it means |
|-------|---------------|
| **Lamports** | The SOL balance (in lamports) |
| **Data** | Raw bytes of stored information |
| **Owner** | Which program controls this account |
| **Executable** | Is this account a program (true) or data (false)? |
| **Rent Epoch** | A legacy field, mostly ignore this |

Your wallet is an account. A smart contract is an account. A token is an account. A token balance is an account. All the same structure, different purposes.

### Program
A program is Solana's name for a smart contract. It is an account where `Executable: true`. It contains compiled code that can be run. Programs are stateless, meaning they do not store data inside themselves. They read from and write to separate data accounts.

```
Analogy: A program is like a web server.
The server runs code but stores data in a separate database.
On Solana, the program is the server.
The data accounts are the database.
```

### System Program
The root-level program on Solana. Its address is all ones: `11111111111111111111111111111111`. It is the only program that can create new accounts. It handles basic SOL transfers. Every regular wallet is owned by the System Program.

### RPC (Remote Procedure Call)
The way your code talks to Solana. When you run commands in the terminal or write JavaScript that reads the blockchain, it is sending RPC requests to a Solana node. The node responds with the data you asked for. Think of it like a fetch request to an API, except the API is the blockchain itself.

### Devnet
Solana's test environment. Completely separate from the real network (Mainnet). Devnet SOL has zero real monetary value. It is purely for developers to experiment without spending real money. Everything you have built in this challenge has been on Devnet.

### Mainnet
The real Solana network where real money lives. You never touched this during the challenge except to read data from a known program address on Day 24.

### Transaction
A signed instruction you send to the Solana network. It can contain one or more instructions. It must be signed by the relevant keypair(s). Validators process it, execute the instructions, and permanently record it on the blockchain. Even failed transactions are recorded and you pay the fee.

### Blockhash
A recent block identifier included in every transaction. It acts as a timestamp and prevents replay attacks. It expires after roughly 60 to 90 seconds, which is why transactions must be sent promptly after being built.

### Signature
The cryptographic proof that a transaction was authorized by the private key holder. Every transaction has at least one signature. Once a transaction is confirmed you get a signature hash back, which is your receipt that can be looked up on Solana Explorer forever.

### Fee / Rent
- **Transaction fee**: A tiny amount of SOL paid to validators for processing your transaction. Even failed transactions cost this fee because validators still did the work of evaluating it.
- **Rent**: A deposit paid to keep an account alive on-chain. Because validators store all account data in RAM, you pay for the space. This deposit is fully refundable if you close the account.

---

## PART 3: THE TOKEN SYSTEM (What You Built in Days 29 to 37)

### What is a Token?
A token is a digital asset you create on Solana. Unlike SOL which is the native currency, tokens are created by developers. Examples: stablecoins, loyalty points, game currencies, certificates, voting rights. Any fungible or non-fungible asset can be a token.

### Mint Account
The master record for a token. Think of it as the central bank for that specific currency.

The mint stores:
- Who has authority to create more tokens (mint authority)
- How many tokens exist in total (supply)
- How many decimal places the token uses (decimals)
- Any extensions configured at creation time

```
Mint = Factory definition
"This token exists, it has 6 decimals, and wallet X can create more of it"
```

### Token Account
A separate account that holds a specific token for a specific wallet. Your main wallet cannot hold tokens directly. It needs a token account for each token it holds.

```
Wallet = Your bag
Token Account = A specific pocket inside the bag for one token type
One wallet can have many token accounts, one per token
```

### Associated Token Account (ATA)
A token account whose address is mathematically derived from your wallet address and the mint address. Anyone can calculate where your tokens are without you telling them. This is the standard way token accounts work on Solana.

### SPL Token Program
The original Solana token program. Address: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. Handles basic token operations.

### Token Extensions Program (Token-2022)
The newer, more powerful token program. Address: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`. Supports extra features called extensions. This is what you used from Day 29 onwards.

**Critical rule:** Extensions must be declared when the mint is first created. You cannot add them later.

### Extensions (The Extra Features You Configured)

| Extension | What it does | Days used |
|-----------|-------------|-----------|
| **Metadata** | Stores name, symbol, and URI directly on the mint | 30, 32, 37 |
| **Transfer Fee** | Automatically withholds a % of every transfer | 31, 32, 37 |
| **Non-Transferable** | Permanently prevents tokens from being sent | 33 |
| **Interest-Bearing** | Attaches a rate so displayed balance grows over time | 36, 37 |

### Basis Points
A unit for expressing percentages precisely. Used to avoid decimal confusion.
```
100 basis points = 1%
200 basis points = 2%
500 basis points = 5%
15000 basis points = 150%
```

### Withheld Tokens
When a transfer fee is configured, the fee does not go directly to the creator. It is held in a special locked balance inside the recipient's token account. Only the withdrawal authority (the wallet that created the mint) can collect it using the `withdraw-withheld-tokens` command.

### Burn
Permanently destroying tokens. The total supply decreases. Only the token holder can burn their own tokens. Non-transferable tokens can still be burned.

### Metadata
Information that gives a token an identity. Stored directly on the mint account with Token-2022.
- **Name**: The full name (e.g. "ReinforceCoin")
- **Symbol**: The short ticker (e.g. "RFC")
- **URI**: A link to a JSON file with extended details like description and image

---

## PART 4: ENCODING FORMATS (The Three Ways to Write Bytes)

You encountered these on Day 24 when decoding account data. They are three different ways to represent the same raw bytes as readable text.

| Format | Used for | Example |
|--------|---------|---------|
| **Base64** | How RPC sends account data | `SGVsbG8=` |
| **Base16 (Hex)** | Debugging, seeing raw bytes | `48656c6c6f` |
| **Base58** | Solana addresses | `9xKp3...Fq2` |

A Solana address is literally just 32 raw bytes written in Base58. Nothing special about it beyond that.

---

## PART 5: THE COMMANDS YOU HAVE USED (Quick Reference)

### Solana CLI Commands
```bash
# Check your configuration
solana config get

# Set network to devnet
solana config set --url devnet

# See your wallet address
solana address

# Check your SOL balance
solana balance

# Request free devnet SOL
solana airdrop 2

# Inspect any account
solana account [ADDRESS]

# Inspect account in JSON format
solana account [ADDRESS] --output json

# Check how much rent N bytes costs
solana rent [NUMBER_OF_BYTES]

# Send SOL to another address
solana transfer [ADDRESS] [AMOUNT] --allow-unfunded-recipient
```

### Keypair Commands
```bash
# Generate a new keypair and save it
solana-keygen new --outfile ~/wallet-name.json

# Generate without passphrase prompt
solana-keygen new --outfile ~/wallet-name.json --no-bip39-passphrase

# Overwrite an existing keypair file
solana-keygen new --outfile ~/wallet-name.json --no-bip39-passphrase --force

# Get the public key of a saved keypair
solana address --keypair ~/wallet-name.json
solana-keygen pubkey ~/wallet-name.json
```

### SPL Token Commands
```bash
# Create a basic token
spl-token create-token

# Create a Token-2022 token
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# Create with metadata enabled
spl-token create-token --program-id TokenzQd... --enable-metadata --decimals 6

# Create with transfer fee (200 basis points = 2%)
spl-token create-token --program-id TokenzQd... --transfer-fee-basis-points 200 --transfer-fee-maximum-fee 5000

# Create non-transferable token
spl-token create-token --program-id TokenzQd... --enable-non-transferable

# Create interest-bearing token (500 bps = 5%)
spl-token create-token --program-id TokenzQd... --interest-rate 500

# Add metadata to a mint (must happen before minting)
spl-token initialize-metadata [MINT] "TokenName" "SYMBOL" "https://uri.json"

# Create a token account for your wallet
spl-token create-account [MINT]

# Create a token account for someone else's wallet
spl-token create-account [MINT] --owner [WALLET_ADDRESS] --fee-payer ~/.config/solana/id.json

# Mint tokens into your account
spl-token mint [MINT] 1000

# Check your token balance
spl-token balance [MINT]

# Check someone else's token balance
spl-token balance [MINT] --owner [WALLET_ADDRESS]

# Transfer tokens
spl-token transfer [MINT] [AMOUNT] [RECIPIENT_WALLET] --allow-unfunded-recipient

# Transfer with expected fee
spl-token transfer [MINT] [AMOUNT] [RECIPIENT_WALLET] --expected-fee [FEE_AMOUNT] --allow-unfunded-recipient

# View full mint details including extensions
spl-token display [MINT]

# List your token accounts
spl-token accounts

# List token accounts with addresses shown
spl-token accounts -v

# Collect withheld transfer fees
spl-token withdraw-withheld-tokens [YOUR_TOKEN_ACCOUNT] [RECIPIENT_TOKEN_ACCOUNT]

# Burn tokens
spl-token burn [YOUR_TOKEN_ACCOUNT] [AMOUNT]

# Update interest rate
spl-token set-interest-rate [MINT] [NEW_RATE_IN_BPS]
```

---

## PART 6: IMPORTANT ADDRESSES TO KNOW

| Name | Address |
|------|---------|
| System Program | `11111111111111111111111111111111` |
| SPL Token Program | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Token Extensions Program (Token-2022) | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Devnet RPC | `https://api.devnet.solana.com` |
| Mainnet RPC | `https://api.mainnet-beta.solana.com` |

---

## PART 7: COMMON ERRORS AND WHAT THEY MEAN

| Error | What went wrong | Fix |
|-------|----------------|-----|
| `Could not deserialize token account` | You passed a mint address where a token account address was expected | Use the token account address from `spl-token accounts -v` |
| `The recipient address is not funded` | Recipient wallet has no SOL | Add `--allow-unfunded-recipient` flag |
| `Non-transferable token` | You tried to transfer a soulbound token | This is working correctly, the token cannot be transferred by design |
| `custom program error: 0x1` | Insufficient funds | The wallet does not have enough SOL or tokens for this transaction |
| `Blockhash expired` | Transaction took too long to send | Rebuild and resend the transaction |

---

## PART 8: THE MENTAL MODELS (How to Think About All of This)

### Web2 vs Solana comparison table

| Web2 concept | Solana equivalent |
|-------------|------------------|
| Username + password | Keypair (public key + private key) |
| Your account on a server | Account on the blockchain |
| Database table | Collection of accounts |
| API endpoint | Program instruction |
| Payment processor fee | Transfer fee extension |
| Interest calculation service | Interest-bearing extension |
| Verified badge that cannot be sold | Non-transferable token |
| Staging environment | Devnet |
| Production environment | Mainnet |
| Changing environment variables | Changing the RPC URL |

### The ownership chain
```
System Program owns → Your wallet account
Your wallet creates → Token accounts
Token Program owns → Token accounts
Your wallet is authority over → Your token accounts
```

### How a token transfer works step by step
1. You sign a transaction with your private key
2. Transaction is sent to a Solana node via RPC
3. Validators verify your signature using your public key
4. If valid, the Token Program deducts from your token account
5. If transfer fee is configured, it withholds the fee in recipient's account
6. Token Program adds the remaining amount to recipient's token account
7. Transaction is confirmed and permanently recorded
8. You receive a transaction signature as your receipt

---

## PART 9: YOUR PERSONAL PRACTICE PLAN

Work through these in order before returning to the daily challenges:

**Level 1: Foundations**
- [ ] Can you explain what a keypair is to someone who has never heard of it?
- [ ] Can you explain the difference between a wallet and an account?
- [ ] Can you explain why failed transactions still cost a fee?
- [ ] Can you explain what lamports are and how to convert to SOL?

**Level 2: Accounts**
- [ ] Can you explain the five fields of every Solana account from memory?
- [ ] Can you explain what the Owner field means and why it matters for security?
- [ ] Can you explain the difference between an Executable: true and Executable: false account?
- [ ] Run `solana account $(solana address)` and explain every line of the output

**Level 3: Tokens**
- [ ] Can you explain the difference between a mint and a token account?
- [ ] Can you create a Token-2022 token from scratch without looking at notes?
- [ ] Can you explain what basis points are and convert any percentage to basis points in your head?
- [ ] Can you explain how withheld fees work and which command collects them?
- [ ] Can you explain why extensions cannot be added after mint creation?

**Level 4: Confident explanation**
- [ ] Explain the whole Solana account model to a friend using only analogies, no jargon
- [ ] Walk someone through what happens behind the scenes when you transfer tokens

---

## PART 10: TOOLS AND LINKS

| Tool | What it does | Link |
|------|-------------|------|
| Solana Explorer | View any account, transaction, or program on-chain | explorer.solana.com |
| Solscan | Feature-rich explorer with labeled accounts | solscan.io |
| Solana Faucet | Get free devnet SOL | faucet.solana.com |
| Phantom Wallet | Browser wallet for testing | phantom.app |
| Solana Docs | Official documentation | docs.solana.com |

---

*This guide was built from your personal journey through Days 1 to 37 of the 100 Days of Solana challenge with Major League Hacking. Every command, every concept, and every analogy in here came from something you actually did.*
