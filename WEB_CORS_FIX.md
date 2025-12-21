# Web CORS Issue - Fix Required

## Problem
Browser pe CORS errors aa rahe hain kyunki:
1. Alchemy API direct browser se call nahi ho sakti (CORS policy)
2. Solana public RPC rate limited hai aur 403 errors de raha hai

## Current Errors
```
Access to fetch at 'https://eth-mainnet.g.alchemy.com/v2/...' from origin 'http://localhost:19006' 
has been blocked by CORS policy
```

## Solutions

### Option 1: Use Testnet (RECOMMENDED for Development)
✅ **Already implemented** - Changed to testnet in `.env.local`

**Benefits:**
- No CORS issues on testnet
- Free to use
- Good for development

**Limitations:**
- Need testnet tokens to see balances
- Not real mainnet data

### Option 2: Run on Mobile (BEST for Production)
Mobile apps don't have CORS restrictions!

```bash
# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Or use Expo Go app
npx expo start
# Then scan QR code with Expo Go app
```

### Option 3: Create Proxy Server (Advanced)
Create a backend proxy to bypass CORS:

```javascript
// server.js (Node.js backend)
const express = require('express');
const cors = require('cors');
const { Alchemy, Network } = require('alchemy-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const alchemy = new Alchemy({
  apiKey: 'YOUR_API_KEY',
  network: Network.ETH_MAINNET,
});

app.get('/api/balance/:address', async (req, res) => {
  const balance = await alchemy.core.getBalance(req.params.address);
  res.json({ balance: balance.toString() });
});

app.listen(3001, () => console.log('Proxy running on :3001'));
```

### Option 4: Use Public RPC Endpoints (Limited)
Some public endpoints allow CORS:

```typescript
// For Ethereum
const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

// For Solana  
const connection = new Connection('https://solana-api.projectserum.com');
```

**Limitations:**
- Rate limited
- Slower
- Less reliable

## Current Fix Applied

✅ Changed to **testnet** in `.env.local`:
- Ethereum: Sepolia testnet
- Solana: Devnet
- Complete Alchemy API key added

## To Get Testnet Tokens

### Ethereum Sepolia Testnet:
1. Visit: https://sepoliafaucet.com/
2. Enter your address: `0x41c4ed9805B9CD02027E4603F3F606894D51CB74`
3. Get free testnet ETH

### Solana Devnet:
```bash
solana airdrop 2 4FGmvwfi4p2rEbURy66qkc2tYGd3r8xRtui4Ze4YSiHX --url devnet
```

Or visit: https://solfaucet.com/

## Next Steps

1. **Restart the app** to load new environment variables:
   ```bash
   # Stop current server (Ctrl+C)
   # Clear cache and restart
   npx expo start -c
   ```

2. **Get testnet tokens** from faucets above

3. **Test on mobile** for best experience (no CORS issues)

## For Production

When deploying to production:
1. Use mobile app (iOS/Android) - no CORS issues
2. Or create a backend proxy server
3. Never expose API keys in frontend code
4. Use environment variables properly

## Why Web Has CORS Issues

Browsers block cross-origin requests for security. Blockchain APIs don't allow direct browser access because:
- Prevents API key theft
- Stops abuse
- Security best practice

**Mobile apps don't have this restriction!**
