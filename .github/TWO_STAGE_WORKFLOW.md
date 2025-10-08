# Two-Stage Review Approval Workflow

## Overview
Implemented a sophisticated two-stage approval workflow that separates review moderation from public display decisions, with threaded host replies.

## Key Changes

### 1. New Review Statuses
Extended the status field to support workflow stages:

```typescript
status: 'published' | 'pending' | 'approved' | 'denied'
```

- **pending**: Newly submitted reviews awaiting manager decision
- **approved**: Manager has approved the review (can then be marked for public display)
- **denied**: Manager has rejected the review (hidden from all displays)
- **published**: Reviews from Hostaway marked as published (can be directly marked for public display)

### 2. Threaded Host Replies
Host-to-guest reviews are now linked to their corresponding guest reviews:

```typescript
interface NormalizedReview {
  // ... existing fields
  reservationId?: number; // For linking reviews from same booking
  replyToReviewId?: number; // Host replies reference guest review ID
}
```

## Dashboard Workflow

### For Pending Reviews
**UI:** Two buttons - "Approve" (green) and "Deny" (red)

**Behavior:**
- Click "Approve" → Status changes to `approved`, "Display Publicly" checkbox appears
- Click "Deny" → Status changes to `denied`, review hidden, "Undo Denial" button shown

**Rules:**
- ❌ NO "Display Publicly" checkbox until approved
- ✅ Only approved/published reviews can be marked for public display

### For Approved/Published Reviews
**UI:** "Display Publicly" checkbox

**Behavior:**
- Check the box → `isApprovedForPublic = true`, review appears on property page
- Uncheck → `isApprovedForPublic = false`, review hidden from property page

**Rules:**
- ✅ Published reviews (from Hostaway) skip pending stage
- ✅ Can toggle public display anytime for approved/published reviews

### For Denied Reviews
**UI:** "Undo Denial" button

**Behavior:**
- Click "Undo Denial" → Status changes back to `pending`
- Review re-enters approval workflow

## Property Page Display

### Guest Reviews
**Displayed when:**
- `status === 'published'` OR `status === 'approved'`
- AND `isApprovedForPublic === true`
- AND `type === 'guest-to-host'`
- AND `listingId` matches property

### Host Replies (Threaded Display)
**Displayed when:**
- Corresponding guest review is displayed
- Host reply has `replyToReviewId` matching guest review ID
- Host reply has `status === 'published'` OR `status === 'approved'`
- Host reply has `isApprovedForPublic === true`

**Visual Style:**
```
┌─ Guest Review ────────────────────────┐
│ ⭐⭐⭐⭐⭐ Sarah Johnson · December 2024│
│ Amazing property! Very clean...       │
│ [Show more]                           │
│                                       │
│   ┌─ Host Response ─────────────┐    │
│   │ Thank you Sarah! We're...   │    │
│   └─────────────────────────────┘    │
└───────────────────────────────────────┘
```

- Indented 32px (ml-8)
- Left border accent (rgb(220, 220, 220))
- "Host Response" label in Flex Living green (rgb(22, 79, 76))
- Smaller text (text-sm)

## Data Persistence

### localStorage Keys
1. **`reviewApprovals`**: Public display toggles
   ```json
   {
     "1001": true,
     "1003": false,
     ...
   }
   ```

2. **`reviewStatuses`**: Review workflow states
   ```json
   {
     "1001": "published",
     "1006": "approved",
     "1010": "denied",
     ...
   }
   ```

### Sync Logic
Both dashboard and property page:
1. Fetch reviews from API
2. Load `reviewApprovals` and `reviewStatuses` from localStorage
3. Merge localStorage data with API data
4. Apply filters for display

## Example Workflows

### Workflow 1: Pending Guest Review
1. **Initial State**: Status = `pending`, no public display option
2. **Manager Action**: Click "Approve" button
3. **New State**: Status = `approved`, "Display Publicly" checkbox appears
4. **Manager Action**: Check "Display Publicly"
5. **Result**: Review appears on property page

### Workflow 2: Published Guest Review with Host Reply
1. **Guest Review**: Status = `published` (from Hostaway)
2. **Host Reply**: Status = `published`, linked via `replyToReviewId`
3. **Manager Action**: Check "Display Publicly" on guest review
4. **Manager Action**: Check "Display Publicly" on host reply
5. **Result**: Guest review appears with threaded host reply below it

### Workflow 3: Denial and Undo
1. **Initial State**: Status = `pending`
2. **Manager Action**: Click "Deny"
3. **New State**: Status = `denied`, hidden from all views
4. **Manager Reconsiders**: Click "Undo Denial"
5. **New State**: Status = `pending`, approval workflow restarts

## Testing Instructions

### Test 1: Pending Review Approval
1. Go to `/dashboard`
2. Find a pending review (yellow badge)
3. Verify NO "Display Publicly" checkbox exists
4. Click "Approve" button
5. ✅ Status badge turns blue "approved"
6. ✅ "Display Publicly" checkbox appears
7. Check the checkbox
8. Navigate to property page
9. ✅ Review appears

### Test 2: Host Reply Threading
1. Go to `/dashboard`
2. Filter by property (e.g., PROP-000)
3. Find a guest review and its host reply (same reservationId)
4. Approve both for public display
5. Navigate to `/properties/PROP-000`
6. ✅ Guest review appears
7. ✅ Host reply appears indented below with "Host Response" label
8. ✅ Host reply has green accent and left border

### Test 3: Denial Workflow
1. Go to `/dashboard`
2. Find a pending review
3. Click "Deny" button
4. ✅ Status badge turns red "denied"
5. ✅ "Undo Denial" button appears
6. Navigate to property page
7. ✅ Review does NOT appear
8. Go back to dashboard
9. Click "Undo Denial"
10. ✅ Status returns to yellow "pending"
11. ✅ Approve/Deny buttons reappear

### Test 4: Published Review Direct Approval
1. Go to `/dashboard`
2. Find a published review (green badge)
3. ✅ "Display Publicly" checkbox is immediately available
4. Check the checkbox
5. Navigate to property page
6. ✅ Review appears (no need for separate approval step)

## UI States Summary

| Status | Badge Color | Available Actions | Can Display Publicly? |
|--------|------------|-------------------|---------------------|
| pending | 🟡 Yellow | Approve, Deny | ❌ No |
| approved | 🔵 Blue | Display Publicly toggle | ✅ If toggled |
| published | 🟢 Green | Display Publicly toggle | ✅ If toggled |
| denied | 🔴 Red | Undo Denial | ❌ No |

## Code Locations

**Types:**
- `/types/review.ts` - Extended `NormalizedReview` interface

**Normalizer:**
- `/lib/hostaway/normalizer.ts` - Added `reservationId` and `replyToReviewId` linking

**Dashboard:**
- `/app/dashboard/page.tsx` - Two-stage workflow UI, status management

**Property Page:**
- `/app/properties/[id]/page.tsx` - Threaded display, host reply rendering

## Production Considerations

In production, replace localStorage with:

1. **Database Tables:**
   ```sql
   CREATE TABLE review_moderation (
     review_id INT PRIMARY KEY,
     status VARCHAR(20),
     is_approved_for_public BOOLEAN,
     approved_by INT,
     approved_at TIMESTAMP,
     moderation_notes TEXT
   );
   ```

2. **API Endpoints:**
   - `PATCH /api/reviews/:id/status` - Update review status
   - `PATCH /api/reviews/:id/public-approval` - Toggle public display

3. **Audit Trail:**
   - Track who approved/denied each review
   - Record timestamp of status changes
   - Store moderation notes/reasons

## Benefits

✅ **Clear Separation**: Moderation vs. public display decisions  
✅ **Flexibility**: Approve review but delay public display  
✅ **Threaded Context**: Host replies shown in conversation format  
✅ **Reversible**: Can undo denials without data loss  
✅ **User-Friendly**: Clear UI states for each workflow stage  
✅ **Professional**: Matches industry-standard review platforms
