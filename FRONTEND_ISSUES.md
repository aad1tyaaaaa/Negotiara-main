# Negotiara AI — Frontend Issues & Roadmap

---

## 🔴 Critical — Broken Right Now

### F1 — AuthGuard Infinite Redirect Loop
**File:** `frontend/src/components/AuthGuard.tsx`

`router` is in the `useEffect` dependency array. Every render re-creates `router`, triggering the effect again → infinite redirect loop on login/logout.

**Fix:** Remove `router` from dependency array. It is stable and doesn't need to be a dependency.

---

### F2 — Missing `/logo.png` Asset
**Files:**
- `frontend/src/app/dashboard/layout.tsx`
- `frontend/src/app/auth/signup/page.tsx`
- `frontend/src/app/auth/login/page.tsx`

`<img src="/logo.png" />` is referenced everywhere but the file doesn't exist in `public/`. Every page after login shows a broken image in the navbar.

**Fix:** Add a `logo.png` to `frontend/public/` or replace references with an SVG/text logo.

---

### F3 — New Negotiation Form Broken End-to-End
**File:** `frontend/src/app/negotiate/new/page.tsx`

Three separate bugs:

1. **Distance hardcoded:** `distance: 1050` — every negotiation regardless of route uses 1050 km, which directly affects AI pricing.
2. **Field name mismatch:** Sends `cargo_type` but the backend schema and Prisma model expect `cargoType`.
3. **Wrong response field:** Reads `response.negotiationId` but backend returns `response.negotiationId` only under `results` — need to check actual return shape.

**Fix:** Calculate distance from origin/destination (Haversine or API), align field names, fix response destructuring.

---

### F4 — Carrier "Initialize Agent" Modal Discards Data
**File:** `frontend/src/app/dashboard/carrier/page.tsx`

The modal collects `opCost` (operational cost) and `margin` (desired margin) — critical guardrails for the carrier AI agent — but `handleInitializeAgent()` only navigates to `/negotiate/${selectedRfqId}` without passing these values anywhere.

```tsx
// Current — data is lost
const handleInitializeAgent = () => {
    if (!selectedRfqId) return;
    router.push(`/negotiate/${selectedRfqId}`);  // opCost and margin go nowhere
    setShowModal(false);
};
```

**Fix:** Pass `opCost` and `margin` as query params or store in session/Zustand, then send to backend when starting the negotiation.

---

## 🟠 Incomplete — Exists But Doesn't Work Properly

### F5 — Shipper Dashboard Crashes on Null Shipment
**File:** `frontend/src/app/dashboard/shipper/page.tsx`

The `NegotiationRow` component accesses `neg.shipment.cargoType`, `neg.shipment.origin`, `neg.shipment.destination` without null checks. If any negotiation's shipment relation is not loaded, the entire list throws and renders blank with no error message shown to the user.

**Fix:** Add optional chaining (`neg.shipment?.origin ?? "Unknown"`) and a visible error/empty state UI.

---

### F6 — "View All" Link Loops Back to Same Page
**File:** `frontend/src/app/dashboard/shipper/page.tsx`

```tsx
<Link href="/dashboard/shipper">VIEW ALL</Link>
```

Links back to the same page. There is no dedicated negotiation history page.

**Fix:** Create `/dashboard/shipper/history` page and update the link.

---

### F7 — Carrier Dashboard Shows Garbled Shipper Names
**File:** `frontend/src/app/dashboard/carrier/page.tsx`

Carrier's RFQ list shows `SHIPPER_F2B3` (first 4 chars of UUID) instead of the actual shipper's name.

```tsx
company={`SHIPPER_${neg.shipperId.substring(0, 4).toUpperCase()}`}
```

**Fix:** Include `shipper { name }` in the backend response for carrier-facing negotiation queries and display `neg.shipper.name`.

---

### F8 — Admin Dashboard Is Entirely Mocked
**File:** `frontend/src/app/dashboard/admin/page.tsx`

Every metric is hardcoded static data:
- `Users Online: 1,204`
- `Active Agents: 482`
- System health chart uses `MOCK_SYSTEM_HEALTH` array
- All action buttons (Global Search, Access Logs, Run Security Audit) have no handlers

**Fix:** Wire up real API calls to backend `/api/metrics` and `/health` endpoints. Add onClick handlers or mark buttons as "Coming Soon".

---

### F9 — Agent Status Panel Is Hardcoded
**File:** `frontend/src/app/dashboard/shipper/page.tsx`

```tsx
<AgentStatus name="Negotiator Pro" status="Active" tasks={metrics?.activeCount ?? 0} />
<AgentStatus name="LSP Analyst" status="Idle" tasks={0} />
<AgentStatus name="Strategy Engine" status="Optimizing" tasks={1} />
```

Only `tasks` for "Negotiator Pro" is dynamic. The other two agents, their names, and statuses are hardcoded regardless of real system state.

**Fix:** Add an agent status endpoint to the backend and poll it from the dashboard.

---

## 🟡 Missing — Clearly Needed by the Product

### F10 — No Negotiation History Page
There is no route for viewing past negotiations. The "View All" link currently goes nowhere useful.

**What's needed:**
- Route: `/dashboard/shipper/history`
- List all past negotiations with status badge, route, agreed price, date
- Filter by status (COMPLETED, WALK_AWAY, IN_PROGRESS)
- Click to view full negotiation session replay

---

### F11 — "Award Contract" Is Just an Alert
**File:** `frontend/src/app/negotiate/[id]/page.tsx`

The "Award Contract & Digital Booking" button currently calls `alert(...)`. It should:
- Call `POST /api/negotiation/:id/award` to update status in DB
- Show a proper confirmation modal with agreed price, route, and parties
- Display a booking reference number
- Allow PDF/receipt download (future)

---

### F12 — No Carrier RFQ Browser
Carriers have no way to discover available shipments to bid on. The carrier dashboard shows negotiations they're already in, but there is no marketplace or RFQ board.

**What's needed:**
- Route: `/dashboard/carrier/rfq`
- List open shipments posted by shippers
- Filter by route, cargo type, weight, deadline
- "Place Bid / Initialize Agent" to enter a negotiation

---

### F13 — Distance Is Hardcoded at 1050 km
**File:** `frontend/src/app/negotiate/new/page.tsx`

Every negotiation uses `distance: 1050` regardless of actual origin/destination. Distance directly feeds into the AI engine's intrinsic value calculation (fuel cost × km), so every price estimate is wrong.

**Fix options:**
1. **Haversine formula** — calculate straight-line distance from lat/lng using a geocoding API
2. **Simple lookup table** — city-pair to approximate distance
3. **User input field** — let user manually enter distance until API is integrated

---

## Summary Count

| Severity | Count |
|----------|-------|
| 🔴 Critical (broken) | 4 |
| 🟠 Incomplete | 5 |
| 🟡 Missing features | 4 |
| **Total** | **13** |
