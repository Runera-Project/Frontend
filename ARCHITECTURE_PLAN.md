# Runera Architecture Plan - GPS Tracking & Data Persistence

## 📋 Overview

Dokumen ini menjelaskan arsitektur untuk menyimpan data tracking GPS user dan implementasi reward system.

## 🎯 Current Status

### ✅ Sudah Implemented:
- GPS Tracking real-time (Leaflet + Geolocation API)
- Route visualization dengan polyline
- Stats calculation (distance, pace, time)
- Local state management
- Privy authentication (Email, Google, Wallet)

### ⚠️ Belum Ada:
- Data persistence (activity hilang saat refresh)
- Activity history
- User profile stats
- Reward system
- Leaderboard

## 🏗️ Arsitektur Options

### Option 1: Backend API (Recommended untuk MVP) ⭐

**Stack**:
- Frontend: Next.js (current)
- Backend: Next.js API Routes
- Database: Supabase / PostgreSQL / MongoDB
- Storage: Database untuk route coordinates

**Pros**:
- ✅ Cepat implement (1-2 hari)
- ✅ No gas fees untuk save activity
- ✅ Fast queries untuk history/stats
- ✅ Flexible data structure
- ✅ Better UX (instant save)

**Cons**:
- ❌ Centralized
- ❌ Perlu hosting database
- ❌ No blockchain benefits

**Implementation Steps**:
1. Setup database (Supabase recommended)
2. Create API routes (`/api/activities`)
3. Save activity after recording
4. Fetch user activities for history
5. Calculate aggregate stats

**Estimated Time**: 1-2 days

---

### Option 2: Smart Contract Only (Full Web3)

**Stack**:
- Frontend: Next.js (current)
- Smart Contract: Solidity on Base
- Storage: IPFS untuk route data
- No traditional backend

**Pros**:
- ✅ Fully decentralized
- ✅ Transparent & verifiable
- ✅ True Web3 experience
- ✅ Can integrate NFTs/tokens directly

**Cons**:
- ❌ Gas fees per activity save (~$0.01-0.10)
- ❌ Slower (blockchain confirmation)
- ❌ Complex untuk query/filter data
- ❌ Route data perlu IPFS (large data)
- ❌ Lebih lama implement (3-5 hari)

**Implementation Steps**:
1. Write Solidity smart contract
2. Deploy to Base testnet
3. Setup IPFS untuk route storage
4. Integrate wagmi/viem
5. Handle gas fees & confirmations

**Estimated Time**: 3-5 days

---

### Option 3: Hybrid Approach (Best Long-term) 🌟

**Stack**:
- Frontend: Next.js (current)
- Backend: Next.js API Routes + Database
- Smart Contract: Solidity on Base (untuk rewards only)
- Storage: Database + IPFS (optional)

**Architecture**:
```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  - GPS Tracking (Leaflet)                       │
│  - Display activities                           │
│  - User interface                               │
└──────────────┬──────────────────────────────────┘
               │
               ├─────────────────┬─────────────────┐
               ▼                 ▼                 ▼
        ┌──────────┐      ┌──────────┐    ┌──────────┐
        │ Backend  │      │ Database │    │  Smart   │
        │   API    │◄────►│          │    │ Contract │
        │          │      │ Activity │    │ (Rewards)│
        │ Validate │      │   Data   │    │          │
        └──────────┘      └──────────┘    └──────────┘
               │                                  │
               └──────────────────────────────────┘
                    Trigger reward minting
```

**Flow**:
```
1. User records run (Frontend GPS tracking)
   ↓
2. User stops → Save to database (Backend API)
   ↓
3. Backend validates activity (anti-cheat)
   ↓
4. If valid → Call smart contract
   ↓
5. Smart contract mints reward tokens
   ↓
6. User receives tokens in wallet
```

**Pros**:
- ✅ Best UX (no gas for saving)
- ✅ Fast queries untuk history
- ✅ Web3 benefits (rewards on-chain)
- ✅ Scalable
- ✅ Flexible

**Cons**:
- ❌ More complex architecture
- ❌ Perlu maintain backend + smart contract
- ❌ Lebih lama implement (5-7 hari)

**Implementation Steps**:
1. Setup database (Supabase)
2. Create API routes
3. Write smart contract untuk rewards
4. Deploy contract to Base
5. Integrate backend with contract
6. Add validation logic

**Estimated Time**: 5-7 days

---

## 📊 Data Schema

### Database Schema (Backend)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  privy_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR,
  wallet_address VARCHAR,
  username VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  distance DECIMAL(10,2), -- in kilometers
  duration INTEGER, -- in seconds
  pace VARCHAR, -- e.g., "5:30"
  calories INTEGER,
  route JSONB, -- Array of {lat, lng, timestamp}
  activity_type VARCHAR, -- 'running', 'walking', 'cycling'
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  reward_minted BOOLEAN DEFAULT FALSE
);
```

#### User Stats Table (Aggregate)
```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_distance DECIMAL(10,2),
  total_activities INTEGER,
  total_duration INTEGER,
  avg_pace VARCHAR,
  current_streak INTEGER,
  longest_streak INTEGER,
  total_rewards DECIMAL(18,8),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Smart Contract Schema

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RuneraToken is ERC20, Ownable {
    // Reward rates (tokens per km)
    uint256 public constant REWARD_PER_KM = 10 * 10**18; // 10 tokens per km
    
    // Activity verification
    mapping(bytes32 => bool) public activityVerified;
    mapping(address => uint256) public userTotalDistance;
    
    event ActivityRecorded(
        address indexed user,
        bytes32 activityId,
        uint256 distance,
        uint256 reward
    );
    
    constructor() ERC20("Runera Token", "RUN") Ownable(msg.sender) {
        // Mint initial supply to contract
        _mint(address(this), 1000000 * 10**18);
    }
    
    function recordActivity(
        bytes32 activityId,
        uint256 distance // in meters
    ) external onlyOwner {
        require(!activityVerified[activityId], "Activity already verified");
        
        activityVerified[activityId] = true;
        userTotalDistance[msg.sender] += distance;
        
        // Calculate reward (distance in km * reward rate)
        uint256 reward = (distance * REWARD_PER_KM) / 1000;
        
        // Transfer reward to user
        _transfer(address(this), msg.sender, reward);
        
        emit ActivityRecorded(msg.sender, activityId, distance, reward);
    }
    
    function getUserStats(address user) external view returns (
        uint256 totalDistance,
        uint256 balance
    ) {
        return (userTotalDistance[user], balanceOf(user));
    }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: MVP - Backend API (Week 1-2) ⭐ RECOMMENDED START

**Goal**: Users can save and view their activity history

**Tasks**:
1. [ ] Setup Supabase project
2. [ ] Create database tables (users, activities, user_stats)
3. [ ] Create API routes:
   - `POST /api/activities` - Save new activity
   - `GET /api/activities` - Get user activities
   - `GET /api/activities/[id]` - Get single activity
   - `GET /api/stats` - Get user stats
4. [ ] Update Record page to save to API
5. [ ] Create Activities history page
6. [ ] Update Profile page with stats
7. [ ] Add loading states & error handling

**Deliverables**:
- ✅ Activity persistence
- ✅ Activity history page
- ✅ User stats (total distance, runs, avg pace)
- ✅ No data loss on refresh

**Tech Stack**:
- Next.js API Routes
- Supabase (PostgreSQL)
- Privy for auth

---

### Phase 2: Add Validation & Anti-Cheat (Week 3)

**Goal**: Prevent fake activities

**Tasks**:
1. [ ] Validate GPS coordinates (check speed, distance)
2. [ ] Detect suspicious patterns
3. [ ] Add manual review for flagged activities
4. [ ] Implement rate limiting
5. [ ] Add activity verification status

**Deliverables**:
- ✅ Activity validation
- ✅ Anti-cheat system
- ✅ Verified badge on activities

---

### Phase 3: Smart Contract Integration (Week 4-5)

**Goal**: Add Web3 rewards

**Tasks**:
1. [ ] Write Runera Token smart contract
2. [ ] Deploy to Base testnet
3. [ ] Test contract functions
4. [ ] Deploy to Base mainnet
5. [ ] Create backend service to call contract
6. [ ] Add reward claiming UI
7. [ ] Display token balance in profile

**Deliverables**:
- ✅ ERC20 token on Base
- ✅ Automatic reward minting
- ✅ Token balance display
- ✅ Reward history

---

### Phase 4: Advanced Features (Week 6+)

**Tasks**:
1. [ ] NFT badges for achievements
2. [ ] On-chain leaderboard
3. [ ] Social features (follow, like)
4. [ ] Challenges & events
5. [ ] Marketplace for skins (use tokens)
6. [ ] Staking rewards

---

## 💰 Cost Estimation

### Backend API Approach:
- Supabase Free Tier: $0/month (up to 500MB, 2GB bandwidth)
- Supabase Pro: $25/month (8GB, 50GB bandwidth)
- Vercel Hosting: Free (hobby) or $20/month (pro)

**Total**: $0-45/month

### Smart Contract Approach:
- Contract deployment: ~$5-20 (one-time, Base network)
- Per activity save: ~$0.01-0.10 (user pays gas)
- IPFS storage: $0-5/month (Pinata/Web3.Storage)

**Total**: $5-25 one-time + user gas fees

### Hybrid Approach:
- Backend: $0-45/month
- Smart Contract: $5-20 one-time
- Gas fees: Only for rewards (backend pays or user pays)

**Total**: $5-65 initial + $0-45/month

---

## 🎯 Recommended Path

### **Start with Phase 1 (Backend API)** ⭐

**Why?**:
1. Fastest to implement (1-2 days)
2. Best UX (no gas fees, instant save)
3. Easy to test and iterate
4. Can add smart contract later without breaking changes
5. Users can start using immediately

**Next Steps**:
1. Setup Supabase
2. Create API routes
3. Update Record page
4. Test end-to-end
5. Deploy

**Then add Phase 3 (Smart Contract)** when ready for rewards.

---

## 📝 API Endpoints Design

### POST /api/activities
```typescript
// Request
{
  distance: 5.2, // km
  duration: 1800, // seconds
  pace: "5:45", // min/km
  calories: 450,
  route: [
    { lat: -7.7956, lng: 110.3695, timestamp: 1234567890 },
    { lat: -7.7957, lng: 110.3696, timestamp: 1234567891 },
    // ...
  ],
  activityType: "running"
}

// Response
{
  id: "uuid",
  userId: "uuid",
  distance: 5.2,
  duration: 1800,
  pace: "5:45",
  calories: 450,
  verified: false,
  rewardMinted: false,
  createdAt: "2025-01-29T10:00:00Z"
}
```

### GET /api/activities
```typescript
// Response
{
  activities: [
    {
      id: "uuid",
      distance: 5.2,
      duration: 1800,
      pace: "5:45",
      activityType: "running",
      createdAt: "2025-01-29T10:00:00Z",
      verified: true
    },
    // ...
  ],
  total: 25,
  page: 1,
  limit: 10
}
```

### GET /api/stats
```typescript
// Response
{
  totalDistance: 125.5, // km
  totalActivities: 25,
  totalDuration: 45000, // seconds
  avgPace: "5:30",
  currentStreak: 7, // days
  longestStreak: 14,
  totalRewards: 1255.0, // tokens
  lastActivity: "2025-01-29T10:00:00Z"
}
```

---

## 🔐 Security Considerations

### Backend API:
1. **Authentication**: Use Privy JWT for API auth
2. **Rate Limiting**: Max 10 activities per day per user
3. **Validation**: Check GPS coordinates validity
4. **Anti-Cheat**: Detect impossible speeds/distances
5. **Data Privacy**: User data encrypted at rest

### Smart Contract:
1. **Access Control**: Only backend can call recordActivity
2. **Reentrancy Guard**: Prevent reentrancy attacks
3. **Pausable**: Emergency stop mechanism
4. **Upgradeable**: Use proxy pattern for upgrades
5. **Audit**: Get contract audited before mainnet

---

## 📚 Resources

### Backend:
- Supabase Docs: https://supabase.com/docs
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction
- Privy Auth: https://docs.privy.io

### Smart Contract:
- OpenZeppelin: https://docs.openzeppelin.com
- Base Network: https://docs.base.org
- Hardhat: https://hardhat.org/docs
- Wagmi: https://wagmi.sh

### Tools:
- Leaflet: https://leafletjs.com
- Viem: https://viem.sh
- IPFS: https://docs.ipfs.tech

---

## 🎉 Next Action

**Recommended**: Start with Phase 1 (Backend API)

**Command to start**:
```bash
# Create Supabase project
# Then implement API routes
```

**Estimated completion**: 1-2 days for MVP

---

**Last Updated**: January 29, 2025  
**Status**: Planning Phase  
**Next Milestone**: Phase 1 - Backend API Implementation
