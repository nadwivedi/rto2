# Bill Renumbering Script

This script renumbers bills for a specific user ID from the `bill.json` file, ensuring sequential bill numbers starting from 1, and automatically generates PDF files.

## What it does:

1. ✅ Reads bills from `data/bill.json` file for the target user
2. ✅ Connects to MongoDB and fetches user information
3. ✅ **Deletes all old PDF files** for those bills
4. ✅ Deletes all bills from the database for that user
5. ✅ Renumbers the bills sequentially (1, 2, 3, ... n)
6. ✅ Inserts renumbered bills into the database
7. ✅ **Automatically generates new PDF files** for all bills
8. ✅ Updates database with PDF paths

## Usage:

### Step 1: Configure User IDs

Open `renumberBills.js` and configure the user IDs:

```javascript
// ====================================
// CONFIGURATION
// ====================================

// 1. SOURCE_USER_ID: Which user's bills to read from bill.json
const SOURCE_USER_ID = '6948f4a39b313c0f264a11bb';

// 2. INSERT_AS_USER_ID: Which userId to use when inserting into database
//    - Set to null to use the same as SOURCE_USER_ID
//    - Set to a different ID for local testing (e.g., your localhost user)
const INSERT_AS_USER_ID = null;
// const INSERT_AS_USER_ID = '69194e960cb5afd352fb96cb';  // Uncomment for localhost testing

// ====================================
```

**Two Modes:**

1. **Normal Mode** (INSERT_AS_USER_ID = null):
   - Reads bills from SOURCE_USER_ID in bill.json
   - Inserts bills with the SAME userId into database
   - Use this for production/normal operation

2. **Localhost Testing Mode** (INSERT_AS_USER_ID = 'your-test-id'):
   - Reads bills from SOURCE_USER_ID in bill.json
   - Inserts bills with DIFFERENT userId into database
   - Use this to import production bills into your local test account

### Step 2: Run the Script

From the `backend` directory, you can run it using either method:

**Method 1: Using npm script (recommended)**
```bash
npm run renumber-bills
```

**Method 2: Using node directly**
```bash
node scripts/renumberBills.js
```

## Example Output:

### Normal Mode:
```
======================================================================
BILL RENUMBERING SCRIPT (FROM JSON)
======================================================================
Source User ID (from JSON):  6948f4a39b313c0f264a11bb
Insert As User ID (to DB):   6948f4a39b313c0f264a11bb
======================================================================

📄 Step 1: Reading bill.json file...
   Total bills in JSON: 53
   Bills for source user: 53
   Current bill numbers: 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, ...
```

### Localhost Testing Mode:
```
======================================================================
BILL RENUMBERING SCRIPT (FROM JSON)
======================================================================
Source User ID (from JSON):  6948f4a39b313c0f264a11bb
Insert As User ID (to DB):   69194e960cb5afd352fb96cb
🔄 Mode: LOCALHOST TESTING (bills will be inserted with different userId)
======================================================================

📄 Step 1: Reading bill.json file...
   Total bills in JSON: 53
   Bills for source user: 53
   Current bill numbers: 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, ...

🔌 Step 2: Connecting to MongoDB...
   ✓ Connected to MongoDB successfully

👤 Step 2.5: Fetching user information...
   ✓ User found: ASHOK KUMAR
   Email: example@email.com
   Mobile: 9876543210

🗑️  Step 3: Deleting old PDF files...
   ✓ Deleted: BILL-02-1767448305240.pdf
   ✓ Deleted: BILL-03-1767448434535.pdf
   ...
   Summary: 53 deleted, 0 not found

🗄️  Step 4: Deleting bills from database...
   Deleting bills for userId: 6948f4a39b313c0f264a11bb
   ✓ Deleted 53 bills from database

🔢 Step 5: Preparing renumbered bills...
   Prepared Bill 1: AKASH SAHU BALCO 9907409763
   Prepared Bill 2: VICKY UPADHYAY 9907178300
   ...

💾 Step 6: Inserting renumbered bills into database...
   Inserting 53 bills with userId: 6948f4a39b313c0f264a11bb
   ✓ Successfully inserted 53 bills

📄 Step 7: Generating PDF files for all bills...
   Generating PDF for Bill 1: AKASH SAHU BALCO 9907409763...
   ✓ Bill 1: PDF created - BILL-01-1736768442123.pdf
   Generating PDF for Bill 2: VICKY UPADHYAY 9907178300...
   ✓ Bill 2: PDF created - BILL-02-1736768442124.pdf
   ...

   PDF Generation Summary: 53 successful, 0 failed

   Final bill numbers: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...

======================================================================
✅ BILL RENUMBERING COMPLETED SUCCESSFULLY!
======================================================================
📊 Summary:
   • Total bills processed:        53
   • Bills renumbered from:        1 to 53
   • Old PDFs deleted:             53
   • Old PDFs not found:           0
   • Bills inserted to database:   53
   • New PDFs generated:           53
   • PDF generation failed:        0
======================================================================

🔌 Disconnected from MongoDB
✓ Script completed successfully
```

## After Running the Script:

**PDFs are automatically generated!**
1. The bills are in the database with numbers 1 to 53
2. The PDF files are created in `uploads/bills/` directory
3. All PDF paths are updated in the database
4. You can immediately download and view the bills

## Important Notes:

⚠️ **BACKUP BEFORE RUNNING!**

- This script **DELETES** all old PDF files
- This script **DELETES** all bills from the database for the target user
- Make sure you have backups of:
  - Your MongoDB database
  - Your `data/bill.json` file
  - Your `uploads/bills` directory (if needed)

## For Local Testing:

### How to Import Production Bills to Your Localhost Account:

1. **Get your localhost user ID:**
   - Login to your local app
   - Check your user ID in the database or browser console
   - Example: `69194e960cb5afd352fb96cb`

2. **Configure the script:**
   ```javascript
   const SOURCE_USER_ID = '6948f4a39b313c0f264a11bb';  // Production user
   const INSERT_AS_USER_ID = '69194e960cb5afd352fb96cb';  // Your localhost user
   ```

3. **Run the script:**
   ```bash
   node scripts/renumberBills.js
   ```

4. **Result:**
   - Reads production bills from JSON
   - Inserts them into YOUR localhost account
   - You can now test with real data!

### Tips:
- Run the script multiple times if needed
- Each run generates new PDF filenames with timestamps
- Production data remains safe (only reading from JSON)

## Requirements:

- Node.js installed
- MongoDB connection configured in `.env` file
- `data/bill.json` file exists with bill data
- All required npm packages installed (`npm install`)

## Troubleshooting:

**Q: Script says "bills deleted from database" but I had no bills?**
A: That's OK, it means you're starting fresh from the JSON file.

**Q: Old PDFs show "not found"?**
A: That's OK, it means they were already deleted or never existed.

**Q: Database connection fails?**
A: Check your `.env` file for the correct `MONGODB_URI`.

**Q: bill.json not found?**
A: Make sure the file exists at `backend/data/bill.json`.

---

## File Structure:

```
backend/
├── data/
│   └── bill.json              ← Source data
├── scripts/
│   └── renumberBills.js       ← This script
├── uploads/
│   └── bills/                 ← Old PDFs deleted, new ones to be generated
└── models/
    └── CustomBill.js          ← Bill model
```
