const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

/**
 * Generate HTML template for bill
 * @param {Object} permit - Permit object containing all permit details
 * @returns {string} HTML string for the bill
 */
function generateBillHTML(permit) {
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
          border: 2px solid #e5e5e5;
          padding: 40px;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          padding-bottom: 30px;
          border-bottom: 2px solid #1a1a1a;
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
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }
        .invoice-date {
          font-size: 11px;
          color: #666;
          margin-top: 10px;
        }
        .bill-to-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-left: 4px solid #1a1a1a;
        }
        .bill-to-label {
          font-size: 10px;
          color: #666;
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
        .bill-to-phone {
          font-size: 13px;
          color: #666;
          font-weight: 500;
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
          background: #1a1a1a;
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
          opacity: 0.8;
        }
        .amount-value {
          font-size: 36px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: -1px;
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
            <div class="invoice-number">${permit.billNumber}</div>
            <div class="invoice-date">Date: ${currentDate}</div>
          </div>
        </div>

        <!-- Bill To Section -->
        <div class="bill-to-section">
          <div class="bill-to-label">Bill To</div>
          <div class="bill-to-name">${permit.permitHolder}</div>
          ${permit.mobileNumber ? `<div class="bill-to-phone">Mobile: ${permit.mobileNumber}</div>` : ''}
        </div>

        <!-- Permit Details Section -->
        <div class="details-section">
          <div class="section-title">National Permit Details</div>
          <table class="details-table">
            <tr>
              <td>Permit Number</td>
              <td>${permit.permitNumber}</td>
            </tr>
            <tr>
              <td>Vehicle Number</td>
              <td>${permit.vehicleNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>Valid From</td>
              <td>${permit.validFrom}</td>
            </tr>
            <tr>
              <td>Valid To</td>
              <td>${permit.validTo}</td>
            </tr>
          </table>
        </div>

        <!-- Amount Section -->
        <div class="amount-section">
          <div>
            <div class="amount-label">Total Amount</div>
          </div>
          <div>
            <div class="amount-value">₹${permit.fees.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">Thank you for your business!</div>
          <div>This is a computer-generated invoice and does not require a signature.</div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate PDF from permit data using Puppeteer
 * @param {Object} permit - Permit object containing all permit details
 * @returns {Promise<string>} Path to generated PDF file (relative path for storage)
 */
async function generatePDF(permit) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    const html = generateBillHTML(permit)

    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF filename
    const filename = `${permit.billNumber}.pdf`
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
    console.error('Error generating PDF:', error)
    throw error
  }
}

/**
 * Generate bill number in format: BILL-YYYY-NNNN
 * @param {Object} Model - Mongoose model to query for counting
 * @returns {Promise<string>} Generated bill number
 */
async function generateBillNumber(Model) {
  const date = new Date()
  const year = date.getFullYear()

  // Count total permits created this year
  const startOfYear = new Date(year, 0, 1)
  const count = await Model.countDocuments({
    createdAt: { $gte: startOfYear }
  })

  // Format: BILL-2024-0001 (simple and clean)
  const billNumber = `BILL-${year}-${String(count + 1).padStart(4, '0')}`
  return billNumber
}

module.exports = {
  generateBillHTML,
  generatePDF,
  generateBillNumber
}
