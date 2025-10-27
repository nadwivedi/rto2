const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

/**
 * Generate HTML template for Part A renewal bill
 * @param {Object} permit - Permit object containing permit details
 * @param {Object} renewal - Renewal object containing renewal details
 * @returns {string} HTML string for the Part A bill
 */
function generatePartABillHTML(permit, renewal) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 50px;
          background: white;
          color: #1a1a1a;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #4F46E5;
          padding: 40px;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          padding-bottom: 30px;
          border-bottom: 3px solid #4F46E5;
          margin-bottom: 30px;
        }
        .header-left h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 5px;
          letter-spacing: -0.5px;
        }
        .header-left .subtitle {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          margin-bottom: 15px;
        }
        .header-left .contact {
          font-size: 11px;
          color: #666;
          line-height: 1.8;
        }
        .header-right {
          text-align: right;
        }
        .invoice-label {
          font-size: 11px;
          color: #4F46E5;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .invoice-type {
          font-size: 16px;
          color: #4F46E5;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .invoice-number {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
        }
        .invoice-date {
          font-size: 11px;
          color: #666;
          margin-top: 10px;
        }
        .bill-to-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #EEF2FF;
          border-left: 4px solid #4F46E5;
        }
        .bill-to-label {
          font-size: 10px;
          color: #4F46E5;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .bill-to-name {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px;
        }
        .bill-to-details {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          line-height: 1.6;
        }
        .renewal-highlight {
          margin-bottom: 30px;
          padding: 25px;
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          color: white;
          border-radius: 8px;
        }
        .renewal-highlight h2 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .renewal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .renewal-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .renewal-item label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
          display: block;
          margin-bottom: 5px;
        }
        .renewal-item value {
          font-size: 14px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }
        .details-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e5e5;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
        }
        .details-table tr {
          border-bottom: 1px solid #e5e5e5;
        }
        .details-table tr:last-child {
          border-bottom: none;
        }
        .details-table td {
          padding: 12px 0;
          font-size: 13px;
        }
        .details-table td:first-child {
          color: #666;
          font-weight: 500;
          width: 40%;
        }
        .details-table td:last-child {
          color: #1a1a1a;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          text-align: right;
        }
        .amount-section {
          margin-top: 40px;
          padding: 25px;
          background: #4F46E5;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .amount-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          opacity: 0.9;
        }
        .amount-value {
          font-size: 36px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: -1px;
        }
        .notes-section {
          margin-top: 30px;
          padding: 20px;
          background: #F3F4F6;
          border-left: 4px solid #6B7280;
          border-radius: 4px;
        }
        .notes-title {
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .notes-content {
          font-size: 12px;
          color: #4B5563;
          line-height: 1.6;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          text-align: center;
          font-size: 11px;
          color: #999;
          line-height: 1.8;
        }
        .footer .thank-you {
          font-weight: 600;
          color: #666;
          margin-bottom: 5px;
        }
        .validity-badge {
          display: inline-block;
          padding: 8px 16px;
          background: #FCD34D;
          color: #78350F;
          font-size: 12px;
          font-weight: 700;
          border-radius: 4px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <h1>Ashok Kumar</h1>
            <div class="subtitle">Transport Consultant</div>
            <div class="contact">
              <div>ashok123kumarbhatt@gmail.com</div>
              <div>GF-17, Ground Floor, Shyam Plaza, opp. Bus Stand</div>
              <div>Pandri, Raipur</div>
              <div>Phone: 99934-48850 / 9827146175</div>
            </div>
          </div>
          <div class="header-right">
            <div class="invoice-label">Invoice</div>
            <div class="invoice-type">PART A RENEWAL</div>
            <div class="invoice-number">${renewal.billNumber}</div>
            <div class="invoice-date">Date: ${currentDate}</div>
          </div>
        </div>

        <!-- Bill To Section -->
        <div class="bill-to-section">
          <div class="bill-to-label">Bill To</div>
          <div class="bill-to-name">${permit.permitHolder}</div>
          <div class="bill-to-details">
            ${permit.fatherName ? `<div>Father: ${permit.fatherName}</div>` : ''}
            ${permit.mobileNumber ? `<div>Mobile: ${permit.mobileNumber}</div>` : ''}
            ${permit.address ? `<div>Address: ${permit.address}</div>` : ''}
          </div>
        </div>

        <!-- Part A Renewal Highlight -->
        <div class="renewal-highlight">
          <h2>National Permit - Part A Renewal</h2>
          <div class="renewal-grid">
            <div class="renewal-item">
              <label>Permit Number</label>
              <value>${renewal.permitNumber}</value>
            </div>
            <div class="renewal-item">
              <label>Validity Period</label>
              <value>5 YEARS</value>
            </div>
            <div class="renewal-item">
              <label>Valid From</label>
              <value>${renewal.validFrom}</value>
            </div>
            <div class="renewal-item">
              <label>Valid To</label>
              <value>${renewal.validTo}</value>
            </div>
          </div>
          <div class="validity-badge">✓ Valid for All India Transport</div>
        </div>

        <!-- Vehicle Details Section -->
        <div class="details-section">
          <div class="section-title">Vehicle Information</div>
          <table class="details-table">
            <tr>
              <td>Vehicle Number</td>
              <td>${permit.vehicleNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>Vehicle Type</td>
              <td>${permit.vehicleType || 'N/A'}</td>
            </tr>
            <tr>
              <td>Vehicle Model</td>
              <td>${permit.vehicleModel || 'N/A'}</td>
            </tr>
            <tr>
              <td>Chassis Number</td>
              <td>${permit.chassisNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>Engine Number</td>
              <td>${permit.engineNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>Gross Weight</td>
              <td>${permit.grossWeight ? permit.grossWeight + ' kg' : 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Amount Section -->
        <div class="amount-section">
          <div>
            <div class="amount-label">Part A Renewal Fee (5 Years)</div>
          </div>
          <div>
            <div class="amount-value">₹${renewal.fees.toLocaleString('en-IN')}</div>
          </div>
        </div>

        ${renewal.notes ? `
        <!-- Notes Section -->
        <div class="notes-section">
          <div class="notes-title">Notes</div>
          <div class="notes-content">${renewal.notes}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">Thank you for your business!</div>
          <div>This is a computer-generated invoice for Part A (National Permit) renewal.</div>
          <div>Valid for commercial goods transportation across all Indian highways.</div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate Part A Renewal PDF using Puppeteer
 * @param {Object} permit - Permit object
 * @param {Object} renewal - Renewal record
 * @returns {Promise<string>} Path to generated PDF file (relative path)
 */
async function generatePartARenewalPDF(permit, renewal) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    const html = generatePartABillHTML(permit, renewal)

    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF filename
    const filename = `${renewal.billNumber}.pdf`
    const filepath = path.join(__dirname, '../uploads/bills', filename)

    // Ensure directory exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Generate PDF
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    // Return relative path for storage
    return `/uploads/bills/${filename}`
  } catch (error) {
    console.error('Error generating Part A renewal PDF:', error)
    throw error
  }
}

/**
 * Generate Part A Renewal Bill Number
 * @param {Object} NationalPermit - NationalPermit model
 * @returns {Promise<string>} Generated bill number
 */
async function generatePartARenewalBillNumber(NationalPermit) {
  const currentYear = new Date().getFullYear()

  // Count all Part A renewal bills from this year
  let count = 0
  const allPermits = await NationalPermit.find()

  allPermits.forEach(permit => {
    if (permit.partARenewalHistory && permit.partARenewalHistory.length > 0) {
      permit.partARenewalHistory.forEach(renewal => {
        const renewalYear = new Date(renewal.renewalDate).getFullYear()
        if (renewalYear === currentYear && !renewal.isOriginal) {
          count++
        }
      })
    }
  })

  const newNumber = count + 1
  return `PART-A-RENEWAL-${currentYear}-${String(newNumber).padStart(4, '0')}`
}

module.exports = {
  generatePartABillHTML,
  generatePartARenewalPDF,
  generatePartARenewalBillNumber
}
