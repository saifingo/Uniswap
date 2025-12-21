# 🚀 Blockchain Integration Setup Guide

## 📋 Overview

This guide will help you set up the complete blockchain integration for the Uniswap mobile app with Ethereum and Solana support.

---

## 🔧 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Expo CLI
- iOS/Android development environment

---

## 📦 Step 1: Install Dependencies

Run the following command to install all required blockchain dependencies:

```bash
npm install
```

This will install:
- **ethers v6** - Ethereum blockchain interaction
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/spl-token** - Solana token operations
- **alchemy-sdk** - Ethereum data provider
- **bip39** - Seed phrase generation
- **expo-secure-store** - Secure wallet storage
- **expo-local-authentication** - Biometric authentication
- **zustand** - State management
- **@tanstack/react-query** - API data fetching

---

## 🔑 Step 2: Get API Keys

### Alchemy API Key (REQUIRED for Ethereum)

1. Go to https://dashboard.alchemy.com/
2. Create a free account
3. Click "Create App"
4. Select:
   - **Chain**: Ethereum
   - **Network**: Mainnet (or Sepolia for testing)
   - **Name**: "Uniswap Mobile"
5. Click "Create App"
6. Click "View Key" and copy the **API Key**

**Free Tier Includes:**
- 300M compute units/month
- 3 requests/second
- Perfect for development

### CoinGecko API (No Key Required)

- Free public API
- No registration needed
- Rate limit: 10-50 calls/minute
- Used for token prices

### Solana RPC (Free Public RPC)

- Default: `https://api.mainnet-beta.solana.com`
- No API key required
- Free to use

---

## ⚙️ Step 3: Configure Environment Variables

### Create .env file

Copy the example file and add your API keys:

```bash
cp .env.example .env
```

### Edit .env file

Open `.env` and add your Alchemy API key:

```env
# REQUIRED - Your Alchemy API Key
EXPO_PUBLIC_ALCHEMY_API_KEY=your_actual_alchemy_api_key_here

# Solana RPC (default is fine)
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Network (mainnet or testnet)
EXPO_PUBLIC_NETWORK=mainnet
```

**For Testing (Recommended First):**

```env
EXPO_PUBLIC_ALCHEMY_API_KEY=your_sepolia_testnet_key
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_NETWORK=testnet
```

---

## 🏃 Step 4: Run the Application

Start the Expo development server:

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web

---

## 🔐 Features Implemented

### ✅ Wallet Management
- ✅ Create new wallet with 12-word seed phrase
- ✅ Import wallet from seed phrase
- ✅ Secure storage with Expo SecureStore
- ✅ Biometric authentication (Face ID/Touch ID)
- ✅ Multi-chain support (Ethereum + Solana)

### ✅ Ethereum Integration
- ✅ ETH balance fetching via Alchemy
- ✅ ERC20 token balances
- ✅ Send ETH transactions
- ✅ Send ERC20 tokens
- ✅ Transaction history
- ✅ Gas estimation
- ✅ Real-time token metadata

### ✅ Solana Integration
- ✅ SOL balance fetching
- ✅ SPL token balances
- ✅ Send SOL transactions
- ✅ Send SPL tokens
- ✅ Transaction history
- ✅ Fee estimation

### ✅ Price Integration
- ✅ Real-time token prices from CoinGecko
- ✅ 24h price changes
- ✅ Price caching for performance
- ✅ Support for major tokens (ETH, SOL, USDC, etc.)

---

## 📱 How to Use

### Creating a New Wallet

1. Open the app
2. Tap "Get started with a new wallet"
3. Tap "Generate Wallet"
4. **IMPORTANT**: Write down your 12-word seed phrase
5. Store it safely (never share it!)
6. Tap "I've Saved My Phrase"

### Importing an Existing Wallet

1. Open the app
2. Tap "or import an existing wallet"
3. Enter your 12 or 24-word seed phrase
4. Tap "Import Wallet"

### Viewing Balances

- Navigate to the **Home** tab
- See your total portfolio value
- View individual token balances
- Pull down to refresh

### Sending Transactions

1. Go to the **Send** tab
2. Select the token to send
3. Enter recipient address (or scan QR code)
4. Enter amount
5. Review transaction details
6. Tap "Send"
7. Confirm with biometric authentication (if enabled)

### Viewing Transaction History

- Go to the **Home** tab
- Scroll down to see recent transactions
- Tap any transaction for details

---

## 🧪 Testing on Testnet

### Ethereum Sepolia Testnet

1. Get testnet ETH from faucet:
   - https://sepoliafaucet.com/
   - https://faucet.quicknode.com/ethereum/sepolia

2. Update `.env`:
   ```env
   EXPO_PUBLIC_NETWORK=testnet
   ```

### Solana Devnet

1. Get testnet SOL:
   ```bash
   solana airdrop 2 <your_solana_address> --url devnet
   ```

2. Update `.env`:
   ```env
   EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   EXPO_PUBLIC_NETWORK=testnet
   ```

---

## 🔒 Security Best Practices

### ✅ Implemented
- ✅ Seed phrases stored in Expo SecureStore
- ✅ Private keys never logged
- ✅ Biometric authentication support
- ✅ Transaction confirmation screens
- ✅ Input validation
- ✅ Error handling

### ⚠️ Important Warnings
- **NEVER** share your seed phrase with anyone
- **NEVER** enter your seed phrase on websites
- **ALWAYS** backup your seed phrase securely
- **TEST** on testnet before using real funds
- **VERIFY** recipient addresses before sending

---

## 🐛 Troubleshooting

### "Cannot find module" errors

Run:
```bash
npm install
```

### "Alchemy API error"

- Check your API key in `.env`
- Ensure you're using the correct network (mainnet/testnet)
- Verify you haven't exceeded rate limits

### "Insufficient balance" error

- Check you have enough balance for the transaction
- Ensure you have enough for gas fees
- Try reducing the amount

### "Invalid seed phrase" error

- Check for typos
- Ensure words are lowercase
- Verify it's 12 or 24 words
- Make sure words are separated by spaces

### Biometric authentication not working

- Ensure device has Face ID/Touch ID enabled
- Check app permissions
- Try disabling biometric in settings

---

## 📚 API Documentation

### Wallet Service

```typescript
import { WalletService } from './src/services/walletService';

// Create new wallet
const wallet = await WalletService.createWallet();

// Import wallet
const wallet = await WalletService.importWallet(mnemonic);

// Get addresses
const addresses = await WalletService.getWalletAddresses();

// Check if wallet exists
const hasWallet = await WalletService.hasWallet();
```

### Ethereum Service

```typescript
import { EthereumService } from './src/services/ethereumService';

// Get ETH balance
const balance = await EthereumService.getEthBalance(address);

// Get token balances
const tokens = await EthereumService.getTokenBalances(address);

// Send ETH
const result = await EthereumService.sendEthTransaction(to, amount);

// Get transaction history
const txs = await EthereumService.getTransactionHistory(address);
```

### Solana Service

```typescript
import { SolanaService } from './src/services/solanaService';

// Get SOL balance
const balance = await SolanaService.getSolBalance(address);

// Get token balances
const tokens = await SolanaService.getTokenBalances(address);

// Send SOL
const result = await SolanaService.sendSolTransaction(to, amount);

// Get transaction history
const txs = await SolanaService.getTransactionHistory(address);
```

### Price Service

```typescript
import { PriceService } from './src/services/priceService';

// Get token price
const price = await PriceService.getPriceBySymbol('ETH');

// Get multiple prices
const prices = await PriceService.getPricesBySymbols(['ETH', 'SOL']);
```

---

## 📊 Project Structure

```
src/
├── config/
│   └── env.ts                 # Environment configuration
├── services/
│   ├── storage.ts             # Secure storage service
│   ├── walletService.ts       # Wallet creation/import
│   ├── ethereumService.ts     # Ethereum blockchain
│   ├── solanaService.ts       # Solana blockchain
│   └── priceService.ts        # Token prices
├── screens/
│   ├── Wallet/
│   │   ├── CreateWalletScreen.tsx
│   │   └── ImportWalletScreen.tsx
│   ├── Home/
│   │   └── HomeScreen.tsx
│   └── Send/
│       └── SendScreen.tsx
└── components/
    └── common/
```

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Get Alchemy API key
3. ✅ Configure `.env` file
4. ✅ Test on testnet first
5. ✅ Create/import wallet
6. ✅ Test sending transactions
7. ✅ Switch to mainnet when ready

---

## 💡 Tips

- **Start with testnet** to avoid losing real funds
- **Backup your seed phrase** in multiple secure locations
- **Test small amounts** first on mainnet
- **Monitor gas fees** before sending transactions
- **Keep API keys secure** - never commit to git

---

## 🆘 Support

If you encounter issues:

1. Check this documentation
2. Review error messages carefully
3. Check API key configuration
4. Verify network connectivity
5. Test on testnet first

---

## 📝 License

MIT License - See LICENSE file for details

---

**🎉 You're all set! Start building with blockchain integration!**
