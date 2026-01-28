# Quick Start - Privy Authentication

## 🚀 Setup dalam 5 Menit

### Step 1: Get Privy App ID
1. Buka [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up (gratis)
3. Create new app → Copy App ID

### Step 2: Configure Environment
Create file `.env.local`:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=paste-your-app-id-here
```

### Step 3: Enable Login Methods
Di Privy Dashboard:
1. **Authentication** tab → Toggle ON:
   - ✅ Email
   - ✅ Wallet
2. **Socials** tab → Toggle ON:
   - ✅ Google

### Step 4: Add Allowed Domain
Di Privy Dashboard → **Settings** → **Allowed domains**:
```
http://localhost:3000
```

### Step 5: Run App
```bash
pnpm dev
```

Visit: `http://localhost:3000/login`

## ✅ That's it!

User sekarang bisa login dengan:
- 📧 Email (OTP)
- 🔐 Google
- 👛 MetaMask / WalletConnect

## 🎯 What Happens After Login?

1. User login → Privy verifies
2. Auto redirect ke Home page
3. Embedded wallet created (jika belum punya)
4. User data tersimpan di `usePrivy()` hook

## 🔧 Customize (Optional)

### Change Theme
Edit `app/providers.tsx`:
```typescript
appearance: {
  theme: 'light', // or 'dark'
  accentColor: '#3B82F6', // your brand color
}
```

### Add More Login Methods
Enable di Privy Dashboard:
- Twitter/X
- Discord
- Apple
- Farcaster
- Telegram

### Custom Logo
```typescript
appearance: {
  logo: 'https://your-domain.com/logo.png',
}
```

## 📱 User Flow

```
┌─────────────┐
│ /login page │
└──────┬──────┘
       │
       ├─ Click "Sign In"
       │
       ├─ Privy modal opens
       │
       ├─ Choose method:
       │  ├─ Email → Enter email → OTP
       │  ├─ Google → OAuth flow
       │  └─ Wallet → Connect MetaMask
       │
       ├─ Authentication success
       │
       └─ Redirect to Home (/)
```

## 🛡️ Protected Routes

All pages kecuali `/login` sudah protected dengan `AuthGuard`:
- `/` - Home
- `/event` - Events
- `/record` - GPS Tracking
- `/market` - Marketplace
- `/profile` - User Profile

## 🧪 Testing

### Test Email Login
1. Go to `/login`
2. Click "Sign In"
3. Choose "Email"
4. Enter email
5. Check inbox untuk OTP code
6. Enter code → Login success!

### Test Google Login
1. Click "Sign In"
2. Choose "Google"
3. Select Google account
4. Approve permissions
5. Login success!

### Test Wallet Login
1. Install MetaMask extension
2. Click "Sign In"
3. Choose "Wallet"
4. Connect MetaMask
5. Sign message
6. Login success!

## 💡 Pro Tips

1. **Development**: Use Privy's default OAuth credentials (sudah included)
2. **Production**: Setup your own OAuth credentials untuk branding
3. **Testing**: Create test accounts dengan email aliases (user+test@gmail.com)
4. **Security**: Enable MFA di Privy Dashboard

## 🐛 Common Issues

### "App ID not found"
→ Check `.env.local` file exists dan restart dev server

### "Domain not allowed"
→ Add `localhost:3000` di Privy Dashboard → Settings → Allowed domains

### Google OAuth not working
→ Normal di development, use email/wallet instead atau setup custom OAuth

## 📚 Next Steps

- [ ] Customize login page design
- [ ] Add user profile page
- [ ] Implement wallet features
- [ ] Setup production OAuth credentials
- [ ] Deploy to production

## 🎉 You're Ready!

Authentication sudah fully functional. User bisa:
- ✅ Login dengan multiple methods
- ✅ Auto-create embedded wallet
- ✅ Access protected routes
- ✅ Logout safely

Happy coding! 🚀
