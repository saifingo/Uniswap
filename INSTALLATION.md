# 📱 Uniswap Mobile - Installation Guide

## 🚀 Quick Start

Follow these steps to get the Uniswap mobile app running with full blockchain integration.

---

## 📋 Step 1: Install Dependencies

```bash
cd /Users/wajahatali/Downloads/Develophment-Setup/Uniswap-Android/Uniswap
npm install
```

**This will install all required packages including:**
- Blockchain libraries (ethers.js v6, @solana/web3.js)
- Alchemy SDK for Ethereum
- Secure storage (expo-secure-store)
- Biometric authentication (expo-local-authentication)
- State management (zustand)
- And all other dependencies

---

## 🔑 Step 2: Get Your Alchemy API Key

### Why do you need this?
Alchemy provides the infrastructure to interact with the Ethereum blockchain. Without it, the app cannot fetch balances or send transactions.

### How to get it (FREE):

1. **Go to Alchemy Dashboard**
   - Visit: https://dashboard.alchemy.com/
   - Click "Sign Up" (it's free!)

2. **Create Your Account**
   - Use your email or GitHub
   - Verify your email

3. **Create a New App**
   - Click "+ Create App" button
   - Fill in:
     - **Chain**: Ethereum
     - **Network**: Mainnet (for production) or Sepolia (for testing)
     - **Name**: "Uniswap Mobile" (or any name you like)
   - Click "Create App"

4. **Get Your API Key**
   - Find your app in the dashboard
   - Click "View Key"
   - Copy the **API Key** (not the HTTPS URL)
   - It looks like: `3tFBfw5kvwsOhI4xpLgVI_example`

### Free Tier Limits (More than enough!):
- ✅ 300 million compute units/month
- ✅ 3 requests per second
- ✅ Perfect for development and testing

---

## ⚙️ Step 3: Configure Environment

### Create .env file

```bash
cp .env.example .env
```

### Edit .env file

Open the `.env` file and paste your Alchemy API key:

```env
# Replace 'demo' with your actual Alchemy API key
EXPO_PUBLIC_ALCHEMY_API_KEY=your_actual_alchemy_api_key_here

# Solana RPC (this is fine as-is)
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Network (mainnet for real transactions, testnet for testing)
EXPO_PUBLIC_NETWORK=mainnet
```

**Example with real API key:**
```env
EXPO_PUBLIC_ALCHEMY_API_KEY=3tFBfw5kvwsOhI4xpLgVI_example
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_NETWORK=mainnet
```

---

## 🧪 Step 4: Test on Testnet First (RECOMMENDED)

Before using real money, test everything on testnet:

### Update .env for testnet:

```env
EXPO_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_NETWORK=testnet
```

### Get Free Testnet Tokens:

**Ethereum Sepolia Testnet:**
- Faucet 1: https://sepoliafaucet.com/
- Faucet 2: https://faucet.quicknode.com/ethereum/sepolia
- You'll need to create a wallet first, then paste your Ethereum address

**Solana Devnet:**
- Use Solana CLI or web faucets
- Visit: https://faucet.solana.com/

---

## 🏃 Step 5: Run the App

### Start the development server:

```bash
npm start
```

### Then choose your platform:

- **Android**: Press `a` or run `npm run android`
- **iOS**: Press `i` or run `npm run ios`
- **Web**: Press `w` or run `npm run web`

---

## ✅ Verify Installation

### Check if everything is working:

1. **App starts without errors** ✓
2. **You see the onboarding screen** ✓
3. **You can create a new wallet** ✓
4. **You see a 12-word seed phrase** ✓
5. **You can view the home screen** ✓

---

## 🎯 First-Time Setup

### Creating Your First Wallet:

1. **Launch the app**
2. **Tap "Get started with a new wallet"**
3. **Tap "Generate Wallet"**
4. **IMPORTANT: Write down your 12-word seed phrase**
   - Store it in a safe place
   - Never share it with anyone
   - You'll need it to recover your wallet
5. **Check the box "I have saved my seed phrase"**
6. **Tap "Continue"**

### You're now ready to use the app! 🎉

---

## 🔧 Troubleshooting

### "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules
npm install
```

### "Alchemy API error: 401"

**Problem:** Invalid API key

**Solution:**
- Double-check your API key in `.env`
- Make sure there are no extra spaces
- Ensure you copied the API Key (not the HTTPS URL)

### "Network request failed"

**Problem:** No internet connection or RPC endpoint down

**Solution:**
- Check your internet connection
- Try restarting the app
- Verify your RPC URLs in `.env`

### App crashes on startup

**Solution:**
```bash
# Clear cache
npm start -- --clear

# Or reset everything
rm -rf node_modules
npm install
npm start -- --clear
```

### "Invalid seed phrase" when importing

**Problem:** Typo or incorrect format

**Solution:**
- Ensure words are lowercase
- Check for typos
- Verify it's 12 or 24 words
- Words should be separated by single spaces
- No extra spaces at start or end

---

## 📱 Platform-Specific Setup

### iOS Setup

1. **Install CocoaPods dependencies:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Run on iOS:**
   ```bash
   npm run ios
   ```

### Android Setup

1. **Ensure Android Studio is installed**
2. **Start Android emulator or connect device**
3. **Run on Android:**
   ```bash
   npm run android
   ```

---

## 🔐 Security Checklist

Before using real funds:

- [ ] Tested on testnet first
- [ ] Backed up seed phrase securely
- [ ] Verified transactions work correctly
- [ ] Enabled biometric authentication
- [ ] Understand how to recover wallet
- [ ] Never shared seed phrase with anyone
- [ ] Using official Alchemy API key (not demo)

---

## 📚 Next Steps

1. ✅ **Read BLOCKCHAIN_SETUP.md** for detailed blockchain integration docs
2. ✅ **Test on testnet** before using real funds
3. ✅ **Enable biometric authentication** in settings
4. ✅ **Backup your seed phrase** in multiple secure locations
5. ✅ **Start with small amounts** when testing on mainnet

---

## 🆘 Need Help?

### Common Issues:

**Q: Where do I get testnet tokens?**
A: Use the faucets listed in Step 4

**Q: How do I switch between mainnet and testnet?**
A: Update `EXPO_PUBLIC_NETWORK` in `.env` file

**Q: Can I use the same wallet on multiple devices?**
A: Yes! Import using your seed phrase on the new device

**Q: What if I lose my seed phrase?**
A: Unfortunately, you'll lose access to your wallet. Always backup!

**Q: Is my seed phrase stored on servers?**
A: No! It's stored locally on your device using secure storage

---

## 📊 What's Included

### ✅ Fully Implemented Features:

**Wallet Management:**
- ✅ Create wallet with 12-word seed phrase
- ✅ Import wallet from seed phrase
- ✅ Secure storage with Expo SecureStore
- ✅ Biometric authentication support
- ✅ Multi-chain (Ethereum + Solana)

**Ethereum:**
- ✅ View ETH balance
- ✅ View ERC20 token balances
- ✅ Send ETH transactions
- ✅ Send ERC20 tokens
- ✅ Transaction history
- ✅ Gas estimation

**Solana:**
- ✅ View SOL balance
- ✅ View SPL token balances
- ✅ Send SOL transactions
- ✅ Send SPL tokens
- ✅ Transaction history
- ✅ Fee estimation

**Prices:**
- ✅ Real-time token prices (CoinGecko)
- ✅ 24h price changes
- ✅ Portfolio value calculation

---

## 🎉 You're All Set!

The app is now fully configured with blockchain integration. Start by creating a wallet and testing on testnet!

**Happy Building! 🚀**
