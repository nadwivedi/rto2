const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the new NationalPermit model
const NationalPermit = require('../models/NationalPermit');

// Helper function to format dates (DD-MM-YYYY format)
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  // Handle various date formats
  const cleaned = dateStr.trim();
  // If already in DD-MM-YYYY format, return as is
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleaned)) {
    return cleaned;
  }
  return cleaned;
};

// Helper function to parse date from string (DD-MM-YYYY or DD/MM/YYYY format)
function parsePermitDate(dateString) {
  if (!dateString) return null

  // Handle both DD-MM-YYYY and DD/MM/YYYY formats
  const parts = dateString.split(/[-/]/)
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed in JS
  const year = parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month, day)
}

// Helper function to calculate Part A status (30-day threshold)
const getPartAStatus = (validTo) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)
  thirtyDaysFromNow.setHours(23, 59, 59, 999)

  const validToDate = parsePermitDate(validTo)

  if (!validToDate) {
    return 'active' // Default status if date parsing fails
  }

  if (validToDate < today) {
    return 'expired'
  } else if (validToDate <= thirtyDaysFromNow) {
    return 'expiring_soon'
  } else {
    return 'active'
  }
}

// Helper function to calculate Part B status (30-day threshold)
const getPartBStatus = (validTo) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)
  thirtyDaysFromNow.setHours(23, 59, 59, 999)

  const validToDate = parsePermitDate(validTo)

  if (!validToDate) {
    return 'active' // Default status if date parsing fails
  }

  if (validToDate < today) {
    return 'expired'
  } else if (validToDate <= thirtyDaysFromNow) {
    return 'expiring_soon'
  } else {
    return 'active'
  }
}

// Main migration function
async function migrateNationalPermits() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rto2', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');

    // Read JSON files
    const partAPath = path.join(__dirname, '../data/national_permits_part_a.json');
    const partBPath = path.join(__dirname, '../data/national_permits_part_b.json');

    console.log('\nReading Part A data...');
    const partAData = JSON.parse(fs.readFileSync(partAPath, 'utf-8'));
    console.log(`Found ${partAData.length} Part A records`);

    console.log('Reading Part B data...');
    const partBData = JSON.parse(fs.readFileSync(partBPath, 'utf-8'));
    console.log(`Found ${partBData.length} Part B records`);

    // Create a map of Part B records by permitNumber and vehicleNumber
    const partBMap = new Map();
    partBData.forEach(partB => {
      const key = `${partB.permitNumber}_${partB.vehicleNumber}`;
      if (!partBMap.has(key)) {
        partBMap.set(key, []);
      }
      partBMap.get(key).push(partB);
    });

    console.log('\nStarting migration...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each Part A record
    for (const partA of partAData) {
      try {
        const key = `${partA.permitNumber}_${partA.vehicleNumber}`;
        const matchingPartBs = partBMap.get(key) || [];

        // Get the most recent Part B record (active status preferred)
        let partB = null;
        if (matchingPartBs.length > 0) {
          // Try to find an active Part B first
          partB = matchingPartBs.find(pb => pb.status === 'active') || matchingPartBs[0];
        }

        if (!partB) {
          console.warn(`⚠️  No matching Part B found for Permit: ${partA.permitNumber}, Vehicle: ${partA.vehicleNumber}`);
        }

        // Format dates first
        const partAValidFrom = formatDate(partA.validFrom);
        const partAValidTo = formatDate(partA.validTo);
        const partBValidFrom = partB ? formatDate(partB.validFrom) : formatDate(partA.validFrom);
        const partBValidTo = partB ? formatDate(partB.validTo) : formatDate(partA.validFrom);

        // Calculate statuses based on dates
        const partAStatus = getPartAStatus(partAValidTo);
        const partBStatus = getPartBStatus(partBValidTo);

        // Create the unified permit document
        const permitData = {
          userId: partA.userId,
          vehicleNumber: partA.vehicleNumber.toUpperCase(),
          mobileNumber: partA.mobileNumber || '',

          // Part A fields (5-year permit)
          permitNumber: partA.permitNumber,
          permitHolder: partA.permitHolder,
          partAValidFrom: partAValidFrom,
          partAValidTo: partAValidTo,
          partAStatus: partAStatus,
          partADocument: partA.documents?.partAImage || '',

          // Part B fields (1-year authorization) - use Part B if available, otherwise create placeholder
          authNumber: partB ? partB.partBNumber : `AUTH-${partA.permitNumber}`,
          partBValidFrom: partBValidFrom,
          partBValidTo: partBValidTo,
          partBStatus: partBStatus,
          partBDocument: partB?.documents?.partBImage || '',

          // Payment fields
          totalFee: partA.totalFee || 0,
          paid: partA.paid || 0,
          balance: partA.balance || 0,

          // Renewal tracking
          isRenewed: false,

          // Notes
          notes: partA.notes || (partB ? '' : 'Migrated from old schema - Part B data not found')
        };

        // Create new permit (duplicates allowed)
        const newPermit = new NationalPermit(permitData);
        await newPermit.save();

        successCount++;
        console.log(`✅ Migrated: ${permitData.permitNumber} - ${permitData.vehicleNumber} - ${permitData.permitHolder} (Part A: ${partAStatus}, Part B: ${partBStatus})`);

      } catch (error) {
        errorCount++;
        const errorMsg = `Error migrating permit ${partA.permitNumber}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Part A records processed: ${partAData.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Part B records used: ${partBData.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the migration
console.log('='.repeat(60));
console.log('NATIONAL PERMIT MIGRATION SCRIPT');
console.log('='.repeat(60));
console.log('This script will migrate data from separate Part A and Part B');
console.log('JSON files into the new unified NationalPermit schema.');
console.log('='.repeat(60));
console.log('');

migrateNationalPermits();
