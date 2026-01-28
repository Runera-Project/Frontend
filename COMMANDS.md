# Quick Commands Reference

## 🚀 Development

### Start Dev Server
```bash
pnpm dev
```
Server akan running di: http://localhost:3000

### Stop Dev Server
Press `Ctrl + C` di terminal

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

## 🧹 Troubleshooting Commands

### Clear Next.js Cache
```bash
# Windows
Remove-Item -Path ".next" -Recurse -Force

# Or
pnpm clean
```

### Reinstall Dependencies
```bash
# Remove node_modules
Remove-Item -Path "node_modules" -Recurse -Force

# Reinstall
pnpm install
```

### Check for TypeScript Errors
```bash
pnpm tsc --noEmit
```

### Lint Code
```bash
pnpm lint
```

## 🔧 Privy Commands

### Check Environment Variables
```bash
# Windows PowerShell
Get-Content .env.local

# Or
type .env.local
```

### Verify Privy App ID
```bash
echo $env:NEXT_PUBLIC_PRIVY_APP_ID
```

## 📦 Package Management

### Install New Package
```bash
pnpm add package-name
```

### Install Dev Dependency
```bash
pnpm add -D package-name
```

### Remove Package
```bash
pnpm remove package-name
```

### Update All Packages
```bash
pnpm update
```

## 🧪 Testing

### Test Login Flow
1. Open: http://localhost:3000
2. Should redirect to: http://localhost:3000/login
3. Click "Sign In"
4. Complete authentication
5. Should redirect to Home

### Test Protected Routes
Try accessing without login:
- http://localhost:3000/ → Should redirect to /login
- http://localhost:3000/event → Should redirect to /login
- http://localhost:3000/record → Should redirect to /login

### Test Logout
1. Login first
2. Click "Logout" button in Header
3. Should redirect to /login

## 🐛 Common Issues & Fixes

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /F /PID <PID>
```

### Lock File Error
```bash
# Remove lock file
Remove-Item -Path ".next\dev\lock" -Force

# Or remove entire .next folder
Remove-Item -Path ".next" -Recurse -Force
```

### Module Not Found
```bash
# Reinstall dependencies
pnpm install
```

### Environment Variables Not Loading
```bash
# Restart dev server
# Press Ctrl+C, then:
pnpm dev
```

## 📊 Useful Checks

### Check Node Version
```bash
node --version
# Should be >= 18.x
```

### Check pnpm Version
```bash
pnpm --version
```

### Check Next.js Version
```bash
pnpm list next
```

### Check Privy Version
```bash
pnpm list @privy-io/react-auth
```

## 🔍 Debugging

### View Dev Server Logs
Logs akan muncul di terminal tempat `pnpm dev` running

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "privy" to see auth requests

## 📝 Git Commands

### Check Status
```bash
git status
```

### Commit Changes
```bash
git add .
git commit -m "Add Privy authentication"
```

### Push to Remote
```bash
git push origin main
```

## 🎯 Quick Test Checklist

Run these to verify everything works:

```bash
# 1. Check environment
Get-Content .env.local

# 2. Check for TypeScript errors
pnpm tsc --noEmit

# 3. Start dev server
pnpm dev

# 4. Open browser
# Go to: http://localhost:3000
```

## 🚨 Emergency Reset

If everything is broken:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Remove build artifacts
Remove-Item -Path ".next" -Recurse -Force

# 3. Remove node_modules
Remove-Item -Path "node_modules" -Recurse -Force

# 4. Reinstall
pnpm install

# 5. Start fresh
pnpm dev
```

---

**Keep this file handy for quick reference!** 📌
