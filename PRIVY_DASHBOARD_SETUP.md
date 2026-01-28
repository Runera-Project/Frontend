# Privy Dashboard Configuration

## 🔧 Required Setup Steps

### 1. Add Allowed Domain (IMPORTANT!)

Your app won't work until you add localhost to allowed domains:

1. Go to: **https://dashboard.privy.io**
2. Login and select your app
3. Click **Settings** (left sidebar)
4. Scroll to **Allowed domains** section
5. Click **Add domain**
6. Enter: `http://localhost:3000`
7. Click **Save**

### 2. Verify Login Methods

Go to **Login Methods** tab and ensure these are enabled:

#### Authentication Tab:
- ✅ **Email** - Toggle ON
  - OTP expiration: 10 minutes (default)
  - Allow + in emails: Your choice
  
- ✅ **Wallet** - Toggle ON
  - Sign in with Ethereum (SIWE): Enabled
  - Restrict to single wallet: Optional

#### Socials Tab:
- ✅ **Google** - Toggle ON
  - Use Privy's default credentials (for development)
  - Or configure your own OAuth credentials (for production)

### 3. Configure Embedded Wallets

Go to **Embedded Wallets** tab:

1. Toggle **Create on login** → ON
2. Select: **Users without wallets**
3. Default network: **Base** (already configured in code)
4. Password requirement: **OFF** (for better UX)

### 4. App Settings

Go to **Settings** tab:

- **App name**: Runera
- **App ID**: `cmky60ltc00vpl80cuca2k36w` (already set)
- **Allowed domains**: 
  - Development: `http://localhost:3000`
  - Production: Add your domain when ready

## 📋 Checklist

Before testing, verify:

- [ ] Allowed domain `http://localhost:3000` added
- [ ] Email login enabled
- [ ] Google login enabled  
- [ ] Wallet login enabled
- [ ] Embedded wallets enabled
- [ ] Base network configured

## 🎯 Quick Links

- **Dashboard**: https://dashboard.privy.io
- **Your App**: https://dashboard.privy.io/apps/cmky60ltc00vpl80cuca2k36w
- **Documentation**: https://docs.privy.io
- **Support**: support@privy.io

## ⚠️ Common Issues

### "Domain not allowed" error
→ Add `http://localhost:3000` to allowed domains

### Google OAuth not working
→ Normal in development, use email/wallet instead

### Email OTP not arriving
→ Check spam folder, wait 1-2 minutes

### Wallet connection failed
→ Ensure MetaMask is installed and unlocked

## 🚀 After Setup

Once configured, run:
```bash
pnpm dev
```

Then test at: **http://localhost:3000/login**

---

**Need help?** Check TEST_LOGIN.md for detailed testing guide.
