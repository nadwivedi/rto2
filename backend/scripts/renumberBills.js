const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the CustomBill model, User model, and PDF generator
const CustomBill = require('../models/CustomBill');
const User = require('../models/User');
const { generateCustomBillPDF } = require('../utils/customBillGenerator');

// ====================================
// CONFIGURATION
// ====================================

// 1. SOURCE_USER_ID: Which user's bills to read from bill.json
const SOURCE_USER_ID = '6948f4a39b313c0f264a11bb';

// 2. INSERT_AS_USER_ID: Which userId to use when inserting into database
//    - Set to null to use the same as SOURCE_USER_ID
//    - Set to a different ID for local testing (e.g., your localhost user)
// const INSERT_AS_USER_ID = null;
const INSERT_AS_USER_ID = '6948f4a39b313c0f264a11bb';  // Uncomment for localhost testing

// ====================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rto';
const BILL_JSON_PATH = path.join(__dirname, '../data/bill.json');
const BACKEND_DIR = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(__dirname, '../uploads/bills');

async function renumberBillsFromJson() {
  try {
    // Determine the actual user ID to insert as
    const targetInsertUserId = INSERT_AS_USER_ID || SOURCE_USER_ID;

    console.log('='.repeat(70));
    console.log('BILL RENUMBERING SCRIPT (FROM JSON)');
    console.log('='.repeat(70));
    console.log(`Source User ID (from JSON):  ${SOURCE_USER_ID}`);
    console.log(`Insert As User ID (to DB):   ${targetInsertUserId}`);
    if (INSERT_AS_USER_ID && INSERT_AS_USER_ID !== SOURCE_USER_ID) {
      console.log('🔄 Mode: LOCALHOST TESTING (bills will be inserted with different userId)');
    }
    console.log('='.repeat(70));

    // Step 1: Read bill.json file
    console.log('\n📄 Step 1: Reading bill.json file...');
    if (!fs.existsSync(BILL_JSON_PATH)) {
      console.error(`❌ Error: bill.json file not found at ${BILL_JSON_PATH}`);
      process.exit(1);
    }

    const billJsonData = fs.readFileSync(BILL_JSON_PATH, 'utf8');
    const allBills = JSON.parse(billJsonData);
    const userBills = allBills.filter(bill => bill.userId === SOURCE_USER_ID);

    console.log(`   Total bills in JSON: ${allBills.length}`);
    console.log(`   Bills for source user: ${userBills.length}`);

    if (userBills.length === 0) {
      console.log(`❌ No bills found for source user ${SOURCE_USER_ID} in JSON file.`);
      process.exit(0);
    }

    // Sort by createdAt to maintain chronological order
    userBills.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const currentBillNumbers = userBills.map(b => b.billNumber).sort((a, b) => a - b);
    console.log(`   Current bill numbers: ${currentBillNumbers.join(', ')}`);

    // Step 2: Connect to MongoDB
    console.log('\n🔌 Step 2: Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/rto2');
    console.log('   ✓ Connected to MongoDB successfully');

    // Step 2.5: Fetch user information for PDF generation
    console.log('\n👤 Step 2.5: Fetching user information...');
    const userInfo = await User.findById(targetInsertUserId).select('name email mobile1 mobile2 address billName billDescription');

    if (!userInfo) {
      console.error(`❌ Error: User not found with ID ${targetInsertUserId}`);
      console.log('   Make sure the user exists in the database before running this script.');
      process.exit(1);
    }

    console.log(`   ✓ User found: ${userInfo.name}`);
    console.log(`   Email: ${userInfo.email || 'N/A'}`);
    console.log(`   Mobile: ${userInfo.mobile1 || 'N/A'}`);

    // Step 3: Delete old PDFs
    console.log('\n🗑️  Step 3: Deleting old PDF files...');
    let deletedPdfs = 0;
    let notFoundPdfs = 0;

    for (const bill of userBills) {
      if (bill.billPdfPath) {
        const fullPath = path.join(BACKEND_DIR, bill.billPdfPath);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`   ✓ Deleted: ${path.basename(bill.billPdfPath)}`);
            deletedPdfs++;
          } else {
            console.log(`   ⚠ Not found: ${path.basename(bill.billPdfPath)}`);
            notFoundPdfs++;
          }
        } catch (error) {
          console.error(`   ✗ Error deleting ${path.basename(bill.billPdfPath)}: ${error.message}`);
        }
      }
    }

    console.log(`   Summary: ${deletedPdfs} deleted, ${notFoundPdfs} not found`);

    // Step 4: Delete all bills from database for target insert user
    console.log('\n🗄️  Step 4: Deleting bills from database...');
    console.log(`   Deleting bills for userId: ${targetInsertUserId}`);
    const deleteResult = await CustomBill.deleteMany({ userId: targetInsertUserId });
    console.log(`   ✓ Deleted ${deleteResult.deletedCount} bills from database`);

    // Step 5: Create renumbered bills (without PDFs initially)
    console.log('\n🔢 Step 5: Preparing renumbered bills...');
    const renumberedBills = [];

    for (let i = 0; i < userBills.length; i++) {
      const bill = userBills[i];
      const newBillNumber = i + 1;

      // Prepare the new bill data (use targetInsertUserId instead of original userId)
      const newBill = {
        userId: targetInsertUserId,
        billNumber: newBillNumber,
        billDate: bill.billDate,
        customerName: bill.customerName,
        items: bill.items,
        totalAmount: bill.totalAmount,
        notes: bill.notes,
        createdAt: bill.createdAt,
        updatedAt: new Date()
      };

      renumberedBills.push(newBill);
      console.log(`   Prepared Bill ${newBillNumber}: ${bill.customerName}`);
    }

    // Step 6: Insert renumbered bills into database
    console.log('\n💾 Step 6: Inserting renumbered bills into database...');
    console.log(`   Inserting ${renumberedBills.length} bills with userId: ${targetInsertUserId}`);
    const insertResult = await CustomBill.insertMany(renumberedBills, { ordered: true });
    console.log(`   ✓ Successfully inserted ${insertResult.length} bills`);

    // Step 7: Generate PDFs for all bills
    console.log('\n📄 Step 7: Generating PDF files for all bills...');
    let successfulPdfs = 0;
    let failedPdfs = 0;

    for (const bill of insertResult) {
      try {
        console.log(`   Generating PDF for Bill ${bill.billNumber}: ${bill.customerName}...`);

        // Generate PDF using the same function as the controller
        const pdfPath = await generateCustomBillPDF(bill, userInfo);

        // Update the bill with the PDF path
        bill.billPdfPath = pdfPath;
        await bill.save();

        console.log(`   ✓ Bill ${bill.billNumber}: PDF created - ${path.basename(pdfPath)}`);
        successfulPdfs++;
      } catch (error) {
        console.error(`   ✗ Bill ${bill.billNumber}: PDF generation failed - ${error.message}`);
        failedPdfs++;
      }
    }

    console.log(`\n   PDF Generation Summary: ${successfulPdfs} successful, ${failedPdfs} failed`);

    // Verify the results
    const newBills = await CustomBill.find({ userId: targetInsertUserId }).sort({ billNumber: 1 });
    const newBillNumbers = newBills.map(b => b.billNumber);
    console.log(`\n   Final bill numbers: ${newBillNumbers.join(', ')}`);

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ BILL RENUMBERING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`📊 Summary:`);
    console.log(`   • Total bills processed:        ${userBills.length}`);
    console.log(`   • Bills renumbered from:        1 to ${userBills.length}`);
    console.log(`   • Old PDFs deleted:             ${deletedPdfs}`);
    console.log(`   • Old PDFs not found:           ${notFoundPdfs}`);
    console.log(`   • Bills inserted to database:   ${insertResult.length}`);
    console.log(`   • New PDFs generated:           ${successfulPdfs}`);
    console.log(`   • PDF generation failed:        ${failedPdfs}`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error during bill renumbering:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
renumberBillsFromJson()
  .then(() => {
    console.log('\n✓ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
