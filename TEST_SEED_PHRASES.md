# Test Seed Phrases for Wallet Import

## ⚠️ IMPORTANT: These are TEST wallets only!
**NEVER use these seed phrases for real funds!**

## Valid Test Seed Phrases (12 words)

### Test Wallet 1
```
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
```

### Test Wallet 2
```
legal winner thank year wave sausage worth useful legal winner thank yellow
```

### Test Wallet 3
```
letter advice cage absurd amount doctor acoustic avoid letter advice cage above
```

### Test Wallet 4
```
zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong
```

## How to Test Wallet Import

1. **Open the app**
2. **Go to "Import Wallet"**
3. **Copy one of the test seed phrases above**
4. **Paste it in the text field**
5. **Click "Import Wallet"**
6. **You should see:**
   - Loading indicator
   - Success message with ETH and SOL addresses
   - Navigation to home screen

## Console Logs to Check

Open the Expo dev tools console and look for:
```
=== Import Wallet Started ===
Phrase length: 95
Phrase word count: 12
Import state set to true
Calling WalletService.importWallet...
Wallet imported successfully!
ETH Address: 0x...
SOL Address: ...
```

## If Import Fails

Check console for error messages:
```
=== Import Error ===
Error type: ...
Error message: ...
```

Common errors:
- **"Invalid seed phrase"** - Check word count (must be 12 or 24)
- **"Module not found"** - Run `npm install` again
- **No error shown** - Check if button is actually calling the function

## Testing on Different Platforms

### Web
- Press `w` in terminal
- Open browser console (F12)
- Check for logs

### Android/iOS
- Use Expo Go app
- Shake device to open dev menu
- Enable "Remote JS Debugging"
- Check Chrome DevTools console

## Expected Behavior

✅ **Success:**
- Button shows loading spinner
- Alert shows "Success! ✅"
- Shows ETH and SOL addresses
- Navigates to home screen

❌ **Failure:**
- Alert shows "Import Failed ❌"
- Error message explains the issue
- Can try again with different phrase
