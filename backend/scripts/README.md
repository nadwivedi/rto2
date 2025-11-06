# RTO Database Dummy Data Generation Scripts

This folder contains scripts to generate dummy data for testing and development purposes.

## Available Scripts

### Master Script (Run All at Once)
**File:** `generateAllDummy.js`
- Runs all three dummy data generation scripts sequentially
- Generates total of 90 records (30 each)
- Provides comprehensive summary
- **Recommended for first-time setup**

### 1. Fitness Dummy Data
**File:** `generateFitnessDummy.js`
- Generates 30 fitness certificate records
- Includes: vehicleNumber, validFrom, validTo, fees, payment status
- Auto-calculates status (active, expiring_soon, expired)

### 2. Tax Dummy Data
**File:** `generateTaxDummy.js`
- Generates 30 tax records
- Includes: receiptNo, vehicleNumber, ownerName, amounts, tax period
- Auto-calculates status based on tax expiry

### 3. Insurance Dummy Data
**File:** `generateInsuranceDummy.js`
- Generates 30 insurance records
- Includes: policyNumber, vehicleNumber, validity period, fees
- Auto-calculates status based on insurance expiry

## How to Run

### Run Individual Scripts

```bash
# Generate Fitness dummy data
cd backend
node scripts/generateFitnessDummy.js

# Generate Tax dummy data
node scripts/generateTaxDummy.js

# Generate Insurance dummy data
node scripts/generateInsuranceDummy.js
```

### Run All Scripts at Once (Recommended)

```bash
# From backend directory
node scripts/generateAllDummy.js
```

This master script will run all three scripts sequentially and provide a complete summary.

### Or Run Them Manually in Sequence

```bash
# From backend directory
node scripts/generateFitnessDummy.js && node scripts/generateTaxDummy.js && node scripts/generateInsuranceDummy.js
```

## Important Notes

⚠️ **Warning:** Each script will **DELETE ALL EXISTING RECORDS** in its respective collection before inserting new dummy data.

If you want to keep existing data, comment out this line in each script:
```javascript
await Model.deleteMany({})
```

## Environment Variables

Make sure your `.env` file is configured with:
```
MONGODB_URI=mongodb://localhost:27017/rto-management
```

Or the script will use the default connection string above.

## Generated Data Features

- **Realistic Vehicle Numbers:** Random state codes, district numbers, and series
- **Random Dates:** Distributed across 2023-2026
- **Payment Variations:** Mix of fully paid, partially paid, and unpaid records
- **Status Variations:** Mix of active, expiring soon, and expired records
- **Unique Identifiers:** Receipt numbers, policy numbers, etc.

## Output

Each script will display:
- ✅ Number of records inserted
- 📊 Summary statistics (status breakdown, payment breakdown)
- 🔌 Connection status

## Troubleshooting

### Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env` file

### Duplicate Key Error
- Run the script again (it clears existing data first)
- Or manually clear the collection in MongoDB

### Model Not Found
- Ensure you're running from the `backend` directory
- Check that model files exist in `backend/models/`
