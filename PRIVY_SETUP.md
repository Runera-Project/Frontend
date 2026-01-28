# Privy Authentication Setup

## Overview
Runera menggunakan Privy.io untuk authentication yang mendukung:
- ✅ Email login (OTP)
- ✅ Google OAuth
- ✅ Web3 Wallet (MetaMask, WalletConnect, dll)
- ✅ Embedded wallet otomatis untuk user

## Setup Instructions

### 1. Create Privy Account
1. Kunjungi [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up / Login
3. Create new app

### 2. Configure Login Methods
Di Privy Dashboard → **Login Methods**:

#### Enable Email Login
1. Go to **Authentication** tab
2. Toggle **Email** ON
3. Configure OTP settings (default 10 minutes)

#### Enable Google OAuth
1. Go to **Socials** tab
2. Toggle **Google** ON
3. **Option A - Quick Start**: Use Privy's default credentials
4. **Option B - Production**: Configure your own OAuth credentials
   - Create OAuth app di [Google Cloud Console](https://console.cloud.google.com)
   - Set redirect URI: `https://auth.privy.io/api/v1/oauth/callback`
   - Copy Client ID & Client Secret ke Privy Dashboard

#### Enable Wallet Login
1. Go to **Authentication** tab
2. Toggle **Wallet** ON
3. Supports: MetaMask, WalletConnect, Coinbase Wallet, etc.

### 3. Configure Embedded Wallets
Di Privy Dashboard → **Embedded Wallets**:
1. Toggle **Create on login** ON
2. Select: "Users without wallets"
3. Choose network: **Base** (recommended)

### 4. Get Your App ID
1. Go to **Settings** tab
2. Copy your **App ID**
3. Paste ke `.env.local`:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your-app-id-here
```

### 5. Configure Allowed Domains
Di Privy Dashboard → **Settings** → **Allowed domains**:
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Environment Variables

Create `.env.local` file:

```bash
# Privy App ID (Required)
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxx

# Optional: Custom configuration
NEXT_PUBLIC_APP_NAME=Runera
NEXT_PUBLIC_APP_URL=https://runera.app
```

## Code Structure

### Provider Setup
```typescript
// app/providers.tsx
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  config={{
    loginMethods: ['email', 'google', 'wallet'],
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
    defaultChain: base,
  }}
>
  {children}
</PrivyProvider>
```

### Login Page
```typescript
// app/login/page.tsx
const { login } = usePrivy();

<button onClick={login}>
  Sign In
</button>
```

### Protected Routes
```typescript
// components/AuthGuard.tsx
const { ready, authenticated } = usePrivy();

if (!authenticated) {
  router.push('/login');
}
```

### User Info
```typescript
const { user, logout } = usePrivy();

// User data
user?.email?.address
user?.wallet?.address
user?.google?.email
```

## Features

### 1. Multi-Login Support
Users dapat login dengan:
- Email (OTP dikirim ke email)
- Google account
- Web3 wallet (MetaMask, etc.)

### 2. Embedded Wallet
- Otomatis create wallet untuk user yang login via email/social
- User tidak perlu install MetaMask
- Wallet tersimpan secure di Privy

### 3. Session Management
- Auto-refresh token
- Persistent login (localStorage)
- Secure logout

### 4. User Profile
Access user data:
```typescript
const { user } = usePrivy();

console.log(user?.id); // Unique user ID
console.log(user?.email); // Email info
console.log(user?.wallet); // Wallet address
console.log(user?.google); // Google profile
```

## Testing

### Local Development
1. Start dev server: `pnpm dev`
2. Go to `http://localhost:3000/login`
3. Test login dengan:
   - Email (check inbox untuk OTP)
   - Google account
   - MetaMask wallet

### Production
1. Update allowed domains di Privy Dashboard
2. Deploy app
3. Test all login methods

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use different App IDs for dev/prod
- ✅ Rotate credentials regularly

### 2. OAuth Credentials
- ✅ Use your own OAuth credentials in production
- ✅ Restrict redirect URIs
- ✅ Enable MFA for Privy dashboard

### 3. Wallet Security
- ✅ Use Base network (lower gas fees)
- ✅ Enable embedded wallet for better UX
- ✅ Educate users about wallet security

## Troubleshooting

### Login button tidak muncul
- Check `NEXT_PUBLIC_PRIVY_APP_ID` di `.env.local`
- Restart dev server setelah update env

### OAuth error
- Verify redirect URI: `https://auth.privy.io/api/v1/oauth/callback`
- Check OAuth credentials di Privy Dashboard
- Ensure domain is whitelisted

### Wallet connection failed
- Check network configuration (Base)
- Verify user has wallet extension installed
- Try different wallet provider

## Resources

- [Privy Documentation](https://docs.privy.io)
- [Privy Dashboard](https://dashboard.privy.io)
- [Base Network](https://base.org)
- [React SDK Reference](https://docs.privy.io/reference/react-auth)

## Support

Need help? Contact:
- Privy Support: support@privy.io
- Privy Discord: [Join here](https://discord.gg/privy)
