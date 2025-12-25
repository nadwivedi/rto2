# Debugging Guide: Learning Licence Eligible for DL Filter

## How the Filter Works

The filter shows learning licences that meet ALL these conditions:
1. **Learning Licence Issue Date exists**
2. **Learning Licence Expiry Date exists**
3. **LL is NOT expired** (Expiry Date >= Today)
4. **LL has completed 30+ days** (Issue Date was 30 or more days ago)

## Debugging Steps

### Step 1: Check Backend Logs

After deploying to VPS, check your backend logs when you load the page:

```
Today Start: [date]
Thirty Days Ago: [date]
LL Eligible for DL Count: [number]
```

This tells you how many records match the criteria in the database.

### Step 2: Check Frontend Console

Open browser DevTools (F12) → Console tab

When the page loads, you should see:
```
=== Statistics Response ===
Full Data: {llExpiringCount: X, llEligibleForDLCount: Y, ...}
LL Expiring Count: X
LL Eligible for DL Count: Y
========================
```

### Step 3: Test the Filter

1. Click on the "Eligible for DL" card (purple card, 2nd from left)
2. Check the console logs:

```
Filtering for LL Eligible for DL
Total applications before filter: X
Today: [date]
App: [name] Days since issue: Y Issue Date: [date]
✓ Eligible: [name]
Total applications after filter: Z
```

### Step 4: Verify Your Data

Check a sample record in your database. For example, if today is **2025-12-25**:

**Example 1: ELIGIBLE**
- LL Issue Date: 2025-11-20 (35 days ago) ✓
- LL Expiry Date: 2026-05-20 (still valid) ✓
- Result: **SHOWS in filter**

**Example 2: NOT ELIGIBLE (Too Recent)**
- LL Issue Date: 2025-12-10 (15 days ago) ✗
- LL Expiry Date: 2026-06-10 (still valid) ✓
- Result: **DOES NOT SHOW** (needs 30 days)

**Example 3: NOT ELIGIBLE (Expired)**
- LL Issue Date: 2025-01-01 (358 days ago) ✓
- LL Expiry Date: 2025-07-01 (expired) ✗
- Result: **DOES NOT SHOW** (LL expired)

**Example 4: NOT ELIGIBLE (No LL data)**
- LL Issue Date: null or empty
- LL Expiry Date: null or empty
- Result: **DOES NOT SHOW**

## Common Issues

### Issue 1: Count shows number but clicking filter shows no results

**Cause:** Frontend filter logic not matching backend count logic

**Solution:** Check console logs to see which apps are being filtered and why

### Issue 2: Count shows 0 but you have eligible records

**Cause:**
- Date fields are not saved properly in database
- Date fields are null/empty

**Solution:**
- Check MongoDB directly: `db.drivings.find({learningLicenseIssueDate: {$exists: true}})`
- Verify dates are stored as Date objects, not strings

### Issue 3: Timezone issues

**Cause:** Server timezone different from client timezone

**Solution:** Backend now uses `setHours(0, 0, 0, 0)` to normalize dates

## Quick Test Query (MongoDB)

Run this in MongoDB to see eligible records:

```javascript
const today = new Date()
today.setHours(0, 0, 0, 0)

const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))

db.drivings.find({
  learningLicenseIssueDate: { $exists: true, $ne: null, $lte: thirtyDaysAgo },
  learningLicenseExpiryDate: { $exists: true, $ne: null, $gte: today }
}).count()
```

## Deployment Checklist

- [ ] Backend code deployed with new statistics endpoint
- [ ] Frontend code deployed with new filter
- [ ] Backend restarted (important!)
- [ ] Frontend build refreshed (clear cache: Ctrl+Shift+R)
- [ ] Database has records with learning licence dates
- [ ] At least one record meets the 30-day criteria

## Need More Help?

Check the browser console and backend logs, then share the output to identify the exact issue.
