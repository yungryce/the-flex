# Review Workflow Quick Reference

## Dashboard States

### Pending Review (Yellow Badge)
```
┌────────────────────────────────────────────┐
│ Sarah Johnson    [Guest Review] [pending]  │
│ Downtown Loft A (PROP-000)                 │
│ "Amazing property! Very clean..."          │
│ ⭐ 9.5  Dec 15, 2024                       │
│                                            │
│ [  Approve  ] [  Deny  ]                  │◄── Two buttons
└────────────────────────────────────────────┘
```

### Approved Review (Blue Badge)
```
┌────────────────────────────────────────────┐
│ Sarah Johnson    [Guest Review] [approved] │
│ Downtown Loft A (PROP-000)                 │
│ "Amazing property! Very clean..."          │
│ ⭐ 9.5  Dec 15, 2024                       │
│                                            │
│ ☐ Display Publicly                        │◄── Checkbox appears
└────────────────────────────────────────────┘
```

### Published Review (Green Badge)
```
┌────────────────────────────────────────────┐
│ Emma Rodriguez   [Guest Review] [published]│
│ Downtown Loft A (PROP-000)                 │
│ "Nice place overall, but had some..."      │
│ ⭐ 7.5  Dec 13, 2024                       │
│                                            │
│ ☑ Display Publicly                        │◄── Can toggle directly
└────────────────────────────────────────────┘
```

### Denied Review (Red Badge)
```
┌────────────────────────────────────────────┐
│ Christopher Davis [Guest Review] [denied]  │
│ Riverside Studio B (PROP-001)              │
│ "Unfortunately had several issues..."      │
│ ⭐ 4.5  Dec 6, 2024                        │
│                                            │
│ [ Undo Denial ]                           │◄── Can revert to pending
└────────────────────────────────────────────┘
```

### Host Reply (Purple Badge)
```
┌────────────────────────────────────────────┐
│ Michael Chen     [Host Reply] [published]  │
│ Downtown Loft A (PROP-000)                 │
│ "Thank you! Hope to host you again..."     │
│ ⭐ 10.0  Dec 16, 2024                      │
│                                            │
│ ☑ Display Publicly                        │◄── Must approve separately
└────────────────────────────────────────────┘
```

## Property Page Display

### Guest Review + Host Reply (Threaded)
```
┌────────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ · Sarah Johnson · December 2024      │
│ Amazing property! The location was perfect     │
│ and the apartment was spotlessly clean. Host   │
│ was very responsive... [Show more]             │
│                                                │
│   ┃  Host Response · December 2024           │◄── Indented, left border
│   ┃  Thank you Sarah! We're thrilled you      │
│   ┃  enjoyed your stay. Hope to host you      │
│   ┃  again soon!                              │
└────────────────────────────────────────────────┘
```

### Guest Review Without Reply
```
┌────────────────────────────────────────────────┐
│ ⭐⭐⭐⭐☆ · Emma Rodriguez · December 2024     │
│ Nice place overall, but had some minor issues  │
│ with the heating. Location is convenient for   │
│ downtown. [Show more]                          │
└────────────────────────────────────────────────┘
```

## Workflow Diagrams

### New Review Flow
```
[Hostaway]
    ↓
[pending] ──┬─→ [Approve] → [approved] → ☑ Display → [Property Page]
            │
            └─→ [Deny] → [denied] → ❌ Hidden
                            ↓
                      [Undo Denial]
                            ↓
                       [pending]
```

### Published Review Flow (Shortcut)
```
[Hostaway]
    ↓
[published] → ☑ Display → [Property Page]
    ↑              ↓
    └──────────────┘ (Can toggle anytime)
```

### Host Reply Linking
```
Guest Review (ID: 1001, reservationId: 5001)
    ↕ replyToReviewId = 1001
Host Reply (ID: 1002, reservationId: 5001)

Display Rules:
- Guest review must be public ✅
- Host reply must be public ✅
- Both must be approved/published ✅
→ Shows threaded on property page
```

## Filter Combinations

### Dashboard: View Only Pending Reviews
```
Type: [All]
Status: [pending]
Property: [All Properties]

Shows: All reviews awaiting manager decision
Action: Approve or Deny each one
```

### Dashboard: View PROP-000 Guest Reviews
```
Type: [Guest to Host]
Status: [All]
Property: [PROP-000]

Shows: All guest reviews for Downtown Loft A
Action: Manage approval and public display
```

### Dashboard: View Denied Reviews
```
Type: [All]
Status: [denied]  ⚠️ Note: Will need to add this filter option
Property: [All Properties]

Shows: Reviews that were rejected
Action: Review decisions, undo if needed
```

## Status Badge Legend

| Badge | Meaning | Next Action |
|-------|---------|-------------|
| 🟡 pending | Needs manager review | Approve or Deny |
| 🔵 approved | Approved by manager | Toggle public display |
| 🟢 published | Published from Hostaway | Toggle public display |
| 🔴 denied | Rejected by manager | Undo if mistake |

## Quick Actions Cheat Sheet

| Current State | Available Actions |
|--------------|-------------------|
| pending | Approve • Deny |
| approved | Display Publicly ☐ |
| published | Display Publicly ☐ |
| denied | Undo Denial |
| approved + ☐ unchecked | Toggle to make public |
| published + ☑ checked | Toggle to hide |

## Property Page Display Logic

```javascript
// Guest Review Display Criteria
review.type === 'guest-to-host'
  && review.listingId === propertyId
  && (review.status === 'published' || review.status === 'approved')
  && review.isApprovedForPublic === true

// Host Reply Display Criteria (threaded under guest review)
reply.type === 'host-to-guest'
  && reply.replyToReviewId === guestReview.id
  && (reply.status === 'published' || reply.status === 'approved')
  && reply.isApprovedForPublic === true
```

## Common Scenarios

### Scenario 1: New Guest Review Arrives
1. Dashboard shows with yellow "pending" badge
2. Manager clicks "Approve"
3. Badge turns blue "approved"
4. "Display Publicly" checkbox appears
5. Manager checks checkbox
6. Review appears on property page

### Scenario 2: Host Wants to Reply
1. Host submits reply in Hostaway
2. Reply syncs as "published"
3. Dashboard shows with purple "Host Reply" badge
4. Manager checks "Display Publicly"
5. Reply appears threaded under guest review on property page

### Scenario 3: Bad Review Management
1. Bad review arrives as "pending"
2. Manager clicks "Deny"
3. Badge turns red "denied"
4. Review hidden from all public views
5. Dashboard still shows it for record-keeping

### Scenario 4: Change of Mind
1. Review was denied
2. Manager clicks "Undo Denial"
3. Status returns to "pending"
4. Manager can now approve it properly
