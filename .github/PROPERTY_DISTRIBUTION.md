# Property Distribution & Review Assignment

## Issue Found
User reported that Daniel Anderson's review wasn't appearing on the property page despite being a "guest-to-host, published" review with approval.

## Root Cause
Daniel Anderson's review is assigned to **PROP-001**, not **PROP-000**. The property assignment is based on the `reservationId` using this logic:

```typescript
// From lib/hostaway/normalizer.ts
function generateListingId(reservationId: number): string {
  const propertyIndex = Math.floor((reservationId % 100) / 10);
  return `PROP-${String(propertyIndex).padStart(3, '0')}`;
}
```

## Review Distribution by Property

### PROP-000 (4 guest-to-host published reviews)
- **Sarah Johnson** (ID: 1001, reservationId: 5001) - 9.5 rating ✅
- **Emma Rodriguez** (ID: 1003, reservationId: 5003) - 7.5 rating ✅
- **Lisa Thompson** (ID: 1005, reservationId: 5005) - 9.0 rating ✅
- **Robert Brown** (ID: 1008, reservationId: 5008) - 9.0 rating ✅
- James Wilson (ID: 1006, reservationId: 5006) - 6.0 rating ⚠️ **PENDING** (not displayed)

### PROP-001 (1 guest-to-host published review)
- **Daniel Anderson** (ID: 1012, reservationId: 5012) - 8.3 rating ✅
- Christopher Davis (ID: 1010, reservationId: 5010) - 4.5 rating ⚠️ **PENDING** (not displayed)

### Host-to-Guest Reviews (Never shown on property pages)
- Michael Chen (ID: 1002, PROP-000) - host-to-guest
- David Park (ID: 1004, PROP-000) - host-to-guest
- Amanda Martinez (ID: 1007, PROP-000) - host-to-guest
- Jennifer Lee (ID: 1009, PROP-000) - host-to-guest
- Patricia Taylor (ID: 1011, PROP-001) - host-to-guest

## Property Assignment Logic

**Formula:** `propertyIndex = floor((reservationId % 100) / 10)`

**Examples:**
- 5001 % 100 = 1, 1 / 10 = 0 → **PROP-000**
- 5003 % 100 = 3, 3 / 10 = 0 → **PROP-000**
- 5012 % 100 = 12, 12 / 10 = 1 → **PROP-001**

**Ranges:**
- reservationId ending in 00-09 → PROP-000
- reservationId ending in 10-19 → PROP-001
- reservationId ending in 20-29 → PROP-002
- etc.

## Solution Implemented

### 1. Added Property Filter to Dashboard
Users can now filter reviews by property to see which reviews belong to which property:

```tsx
<select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}>
  <option value="all">All Properties</option>
  <option value="PROP-000">PROP-000</option>
  <option value="PROP-001">PROP-001</option>
</select>
```

### 2. Enhanced Property Display in Dashboard
Now shows both property name and ID for clarity:

```tsx
<p className="text-sm text-gray-600 mb-2">
  <span className="font-medium">{review.listingName}</span>
  <span className="text-gray-400"> ({review.listingId})</span>
</p>
```

### 3. Updated Landing Page
Added links to both properties:

- **PROP-000**: 4 eligible reviews (Sarah, Emma, Lisa, Robert)
- **PROP-001**: 1 eligible review (Daniel)

## Testing Instructions

### To See Daniel Anderson's Review:

1. **Go to Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

2. **Filter by Property:**
   - Select "PROP-001" from the Property dropdown
   - You should see Daniel Anderson's review

3. **Approve Daniel's Review:**
   - Check the "Approved for Public" checkbox

4. **Navigate to PROP-001:**
   ```
   http://localhost:3000/properties/PROP-001
   ```

5. **Verify Display:**
   - Daniel's review should now appear!

### To See All PROP-000 Reviews:

1. **Go to Dashboard**
2. **Filter by Property:** Select "PROP-000"
3. **Filter by Type:** Select "Guest to Host"
4. **Filter by Status:** Select "Published"
5. **You should see:**
   - Sarah Johnson (9.5 rating)
   - Emma Rodriguez (7.5 rating)
   - Lisa Thompson (9.0 rating)
   - Robert Brown (9.0 rating)

## Key Takeaway

✅ **There is NO cap on review display**  
✅ **Daniel's review exists and works correctly**  
✅ **Daniel is just on a different property (PROP-001)**  
✅ **Use the property filter in the dashboard to see distribution**

## Production Considerations

In production, you would:

1. Have a **real property database** with actual property IDs
2. Use a **reservation-to-property mapping table**
3. Allow managers to **manually reassign reviews** if incorrectly mapped
4. Have a **property selector** when approving reviews

For this assessment, the mock data simulates multiple properties using the reservation ID modulo logic.
