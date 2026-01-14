# User Workflow & Flowchart - Borrow, Not Buy

## Complete User Journey

```
┌──────────────────────────────────────────────────────────────┐
│                     LANDING PAGE                             │
│              (Phone number input or login)                   │
└──────────────────┬───────────────────────────────────────────┘
                   │
         ┌─────────▼────────────┐
         │  User has account?   │
         └────┬──────────────┬──┘
              │              │
          NO  │              │ YES
         ┌────▼──────┐  ┌────▼────────────┐
         │ Request   │  │ Request OTP for │
         │ OTP       │  │ existing user   │
         └────┬──────┘  └────┬────────────┘
              │              │
              └──────┬───────┘
                     │
         ┌──────────▼───────────┐
         │  Enter OTP + Name    │
         │  (New users only)    │
         └──────────┬───────────┘
                    │
         ┌──────────▼──────────────┐
         │ ✓ OTP Verified          │
         │ Create/Update User      │
         │ Issue JWT Token         │
         └──────────┬──────────────┘
                    │
    ┌───────────────▼────────────────┐
    │    DASHBOARD (Main Hub)        │
    │ - Trust Score Display          │
    │ - Quick Actions Menu           │
    │ - Stats: Borrows, Lends        │
    └────┬────────────┬──────────────┘
         │            │
    ┌────▼──┐   ┌────▼─────────┐
    │LIST   │   │SEARCH/BROWSE │
    │ITEM   │   │ITEMS          │
    └────┬──┘   └────┬─────────┘
         │           │
         │      ┌────▼──────────────┐
         │      │ Browse nearby     │
         │      │ items (Geo filter)│
         │      │ or by category    │
         │      └────┬──────────────┘
         │           │
         │      ┌────▼──────────────┐
         │      │ VIEW ITEM DETAIL  │
         │      │ - Photos          │
         │      │ - Owner info      │
         │      │ - Reviews/Rating  │
         │      │ - Condition       │
         │      │ - Duration        │
         │      └────┬──────────────┘
         │           │
         │      ┌────▼──────────────┐
         │      │ REQUEST TO BORROW │
         │      │ - Select dates    │
         │      │ - Add notes       │
         │      └────┬──────────────┘
         │           │
    ┌────▼────┐ ┌────▼──────────────┐
    │ITEM     │ │ WAIT FOR APPROVAL │
    │POSTED   │ │ (Lender reviews)  │
    └────┬────┘ └────┬──────────────┘
         │           │
         │      ┌────▼────────┬──────────┐
         │      │             │          │
         │  APPROVED      REJECTED   (TIMEOUT)
         │      │             │          │
         │  ┌───▼──┐      ┌───▼──┐      │
         │  │ACTIVE│      │CANCEL│      │
         │  │BORROW│      │ REQUEST      │
         │  └───┬──┘      └──────┘      │
         │      │                │       │
         │      │ (Handover)     └───┬───┘
         │      │                    │
         │      │            ┌───────▼────┐
         │      │            │ Back to    │
         │      │            │ Dashboard  │
         │      │            └────────────┘
         │      │
         │  ┌───▼──────────────────────────┐
         │  │ ITEM BORROW ACTIVE            │
         │  │ - Timer counting down         │
         │  │ - Return date displayed       │
         │  │ - Notification on due date    │
         │  └───┬──────────────────────────┘
         │      │
         │      │ (Return Item)
         │      │
         │  ┌───▼──────────────────────────┐
         │  │ MARK AS RETURNED              │
         │  │ - Condition feedback          │
         │  │ - Optional damage claim       │
         │  │ - Notes                       │
         │  └───┬──────────────────────────┘
         │      │
         └──┬───▼──────────────────────────┐
            │ BORROW COMPLETED              │
            │ - Trust score updated         │
            │ - Can now leave reviews       │
            │ - Back to dashboard           │
            └───┬──────────────────────────┘
                │
            ┌───▼──────────────────────────┐
            │ OPTIONAL: LEAVE REVIEW        │
            │ - Rate user (1-5)             │
            │ - Rate item condition         │
            │ - Write comment               │
            │ - Submit                      │
            └───┬──────────────────────────┘
                │
            ┌───▼──────────────────────────┐
            │ CYCLE COMPLETE                │
            │ - Return to Dashboard         │
            │ - Trust score increased       │
            │ - Reputation updated          │
            └───────────────────────────────┘
```

---

## Parallel Flows

### LENDER VIEW (Item Owner)

```
┌────────────────────────────────┐
│ Dashboard                       │
│ - My Listed Items               │
│ - Pending Requests              │
│ - Active Borrows                │
└────────┬───────────────────────┘
         │
    ┌────▼─────────────────────┐
    │ View Borrow Request       │
    │ - Borrower info           │
    │ - Trust score             │
    │ - Reviews from others     │
    │ - Requested dates         │
    └────┬─────────────────────┘
         │
    ┌────▼─────────────────────┐
    │ Decision: Approve/Reject  │
    └────┬────────────────────┬─┘
         │                    │
     APPROVE              REJECT
         │                    │
    ┌────▼────────┐      ┌────▼──────┐
    │Update Status │      │Send reason │
    │to Approved   │      │Notify user │
    └────┬────────┘      └────┬──────┘
         │                    │
    ┌────▼──────────────────┐ │
    │ Await Handover         │ │
    │ - Notify borrower      │ │
    │ - Confirm pickup date  │ │
    └────┬──────────────────┘ │
         │                    │
    ┌────▼──────────────────┐ │
    │ Item Handed Over       │ │
    │ - Status: Active       │ │
    │ - Track return date    │ │
    └────┬──────────────────┘ │
         │                    │
    ┌────▼──────────────────┐ │
    │ RETURN RECEIVED        │ │
    │ - Verify condition     │ │
    │ - Note any damage      │ │
    │ - Leave feedback       │ │
    └────┬──────────────────┘ │
         │                    │
    ┌────▼──────────────────┐ │
    │ CYCLE COMPLETE         │ │
    │ - Item back available  │ │
    │ - Can list again       │ │
    └────────────────────────┘ │
                               │
         ┌─────────────────────┘
         │
    ┌────▼──────────────────┐
    │ REQUEST REJECTED       │
    │ - Item stays available │
    │ - List other requests  │
    └────────────────────────┘
```

---

## Trust Score Update Flow

```
┌──────────────────────────────────┐
│ Borrow Status: RETURNED           │
└──────────────┬───────────────────┘
               │
        ┌──────▼──────────┐
        │ Check return    │
        │ timeliness      │
        └──────┬──────────┘
               │
        ┌──────▼─────────────────┐
        │ Late?                  │
        └──┬──────────────────┬──┘
           │                  │
          YES                 NO
           │                  │
       ┌───▼────┐          ┌──▼────┐
       │ -3 pts │          │ +2 pts │
       │Penalty │          │Bonus   │
       └───┬────┘          └──┬────┘
           │                  │
           └────────┬─────────┘
                    │
            ┌───────▼────────┐
            │ Check reviews  │
            │ received       │
            └───────┬────────┘
                    │
            ┌───────▼───────────┐
            │ Add rating score  │
            │ × 5 per star      │
            └───────┬───────────┘
                    │
            ┌───────▼────────────────┐
            │ Calculate new score    │
            │ (Base + all changes)   │
            │ Clamp 0-100           │
            └───────┬────────────────┘
                    │
            ┌───────▼────────────────┐
            │ Update User profile    │
            │ Update TrustScore doc  │
            │ Add to history log     │
            └───────┬────────────────┘
                    │
            ┌───────▼────────────────┐
            │ TRUST SCORE UPDATED    │
            │ - Reflected on profile │
            │ - Visible to others    │
            └────────────────────────┘
```

---

## Time-Based Reminders

```
┌──────────────────────────────────┐
│ Borrow ACTIVE (Item with borrower)│
└──────────────┬───────────────────┘
               │
        ┌──────▼──────────────────┐
        │ Days until return       │
        └──┬─────────────────────┬─┐
           │                     │ │
        >3 days            1-3 days
           │                     │
        QUIET              ┌──────▼──────────┐
        MODE               │ Notification    │
                           │ "Return soon"   │
                           └────────────────┘
                                 │
                    ┌────────────▼──────────┐
                    │ On return date        │
                    └────────────┬──────────┘
                                 │
                          ┌──────▼────────┐
                          │ "Due today"   │
                          │ Notification  │
                          └──────┬────────┘
                                 │
                    ┌────────────▼───────┐
                    │ If not returned    │
                    │ next day           │
                    └────────────┬───────┘
                                 │
                          ┌──────▼──────────┐
                          │ OVERDUE STATUS  │
                          │ Auto-flagged    │
                          │ -5 trust points │
                          └─────────────────┘
```

---

## Search & Discovery Flow

```
┌────────────────────────────────┐
│ SEARCH SCREEN                   │
└────────┬───────────────────────┘
         │
    ┌────▼──────────────────┐
    │ User location (GPS)   │
    │ OR manual entry       │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────────┐
    │ Filter options:           │
    │ - Radius (5-100 km)       │
    │ - Category (Tools, etc.)  │
    │ - Condition               │
    │ - Availability            │
    └────┬──────────────────────┘
         │
    ┌────▼──────────────────┐
    │ Geospatial query      │
    │ MongoDB $near         │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │ Results list          │
    │ - Sorted by distance  │
    │ - Show item cards     │
    │ - Display owner info  │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │ Tap on item           │
    │ → Item detail view    │
    │ → Request to borrow   │
    └───────────────────────┘
```

---

## Critical Paths for Demo

### Path 1: Quick Borrow (2 min)
1. User A: OTP Login → Dashboard
2. User B: OTP Login → Search → Find User A's item
3. User B: Request borrow
4. User A: Approve request
5. Show updated dashboards with active borrow

### Path 2: Complete Transaction (5 min)
1. **Setup:** Two users, two items
2. **Search:** Cross-borrow each other's items
3. **Approve:** Both approve
4. **Return:** Mark as returned
5. **Review:** Leave ratings
6. **Show:** Trust score increased for both

### Path 3: Geographic Search (3 min)
1. User: Enable location
2. Set radius (10 km)
3. Filter by category
4. Show nearby items on map
5. Click item → details → request

---

## UI/UX Key Moments

1. **Onboarding:** Simple phone + OTP
2. **Dashboard:** Clear stats at glance
3. **Search:** Visual items with ratings
4. **Request:** Single-click borrow
5. **Approval:** Clear yes/no decision
6. **Timeline:** Visual countdown to return
7. **Completion:** Success screen + trust boost
8. **Profile:** Show cumulative impact

---

## Mobile-First Considerations

- Touch-friendly buttons (48x48px min)
- Minimal text, icons + labels
- Location permission prompt
- Swipe navigation
- Bottom action buttons
- Large, readable fonts
