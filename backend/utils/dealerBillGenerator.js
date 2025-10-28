const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

/**
 * Generate HTML template for dealer bill
 * @param {Object} dealerBill - Dealer bill object containing all details
 * @returns {string} HTML string for the bill
 */
function generateDealerBillHTML(dealerBill) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Format permit details based on type
  let permitDetails = ''
  if (dealerBill.permit.permitType === 'National Permit') {
    permitDetails = `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Permit Type</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 700; color: #1a1a1a; font-size: 11px;">National Permit</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Part A Number</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-family: 'Courier New', monospace; color: #1a1a1a; font-size: 11px;">${dealerBill.permit.partANumber || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Part B Number</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-family: 'Courier New', monospace; color: #1a1a1a; font-size: 11px;">${dealerBill.permit.partBNumber || 'N/A'}</td>
      </tr>
    `
  } else {
    permitDetails = `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Permit Type</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 700; color: #1a1a1a; font-size: 11px;">${dealerBill.permit.permitType}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Permit Number</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-family: 'Courier New', monospace; color: #1a1a1a; font-size: 11px;">${dealerBill.permit.permitNumber || 'N/A'}</td>
      </tr>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 30px;
          background: white;
          color: #1a1a1a;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 3px solid #6366f1;
          padding: 25px;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          padding-bottom: 15px;
          border-bottom: 3px solid #6366f1;
          margin-bottom: 20px;
        }
        .header-left h1 {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 3px;
          letter-spacing: -0.5px;
        }
        .header-left .subtitle {
          font-size: 11px;
          color: #666;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .header-left .contact {
          font-size: 9px;
          color: #666;
          line-height: 1.4;
        }
        .header-right {
          text-align: right;
        }
        .dealer-badge {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
        }
        .invoice-label {
          font-size: 9px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .invoice-number {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.6px;
        }
        .invoice-date {
          font-size: 9px;
          color: #666;
          margin-top: 6px;
        }
        .section {
          margin-bottom: 18px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e5e5e5;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .section-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 700;
          margin-left: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .badge-permit {
          background: #dbeafe;
          color: #1e40af;
        }
        .badge-fitness {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-registration {
          background: #fed7aa;
          color: #9a3412;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          background: #fafafa;
          border: 1px solid #e5e5e5;
        }
        .details-table td {
          padding: 8px;
          border-bottom: 1px solid #e5e5e5;
          font-size: 11px;
        }
        .details-table td:first-child {
          width: 40%;
          font-weight: 600;
          color: #555;
        }
        .details-table td:last-child {
          font-weight: 700;
          color: #1a1a1a;
        }
        .amount-section {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 18px;
          border-radius: 10px;
          text-align: center;
          margin-top: 20px;
        }
        .amount-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 6px;
        }
        .amount-value {
          font-size: 28px;
          font-weight: 700;
          color: white;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.8px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 2px solid #e5e5e5;
          text-align: center;
        }
        .footer-text {
          font-size: 10px;
          color: #666;
          line-height: 1.5;
          font-weight: 500;
        }
        .footer-disclaimer {
          font-size: 8px;
          color: #999;
          margin-top: 6px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <h1>RTO Services</h1>
            <div class="subtitle">Regional Transport Office</div>
            <div class="contact">
              📧 rto@example.com<br>
              📞 +91 123 456 7890<br>
              📍 Raipur, Chhattisgarh, India
            </div>
          </div>
          <div class="header-right">
            <div class="dealer-badge">DEALER BILL</div>
            <div class="invoice-label">Bill Number</div>
            <div class="invoice-number">${dealerBill.billNumber || 'PENDING'}</div>
            <div class="invoice-date">Date: ${currentDate}</div>
          </div>
        </div>

        <!-- Permit Section -->
        <div class="section">
          <div class="section-title">
            Permit
            <span class="section-badge badge-permit">${dealerBill.permit.permitType}</span>
          </div>
          <table class="details-table">
            ${permitDetails}
          </table>
        </div>

        <!-- Fitness Section -->
        <div class="section">
          <div class="section-title">
            Fitness Certificate
            <span class="section-badge badge-fitness">Fitness</span>
          </div>
          <table class="details-table">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Certificate Number</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-family: 'Courier New', monospace; color: #1a1a1a; font-size: 11px;">${dealerBill.fitness.certificateNumber || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Registration Section -->
        <div class="section">
          <div class="section-title">
            Vehicle Registration
            <span class="section-badge badge-registration">Registration</span>
          </div>
          <table class="details-table">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; font-size: 11px;">Registration Number</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; font-family: 'Courier New', monospace; color: #1a1a1a; font-size: 11px;">${dealerBill.registration.registrationNumber || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Amount Section -->
        <div class="amount-section">
          <div class="amount-label">Total Amount</div>
          <div class="amount-value">₹${dealerBill.totalFees ? dealerBill.totalFees.toLocaleString('en-IN') : '0'}</div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">
            Thank you for choosing our services!<br>
            This is a combined bill for Permit, Fitness, and Registration services.
          </div>
          <div class="footer-disclaimer">
            This is a computer-generated bill and does not require a signature.
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate PDF from dealer bill data
 * @param {Object} dealerBill - Dealer bill object
 * @returns {Promise<string>} Path to generated PDF relative to backend root
 */
async function generateDealerBillPDF(dealerBill) {
  try {
    const html = generateDealerBillHTML(dealerBill)

    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Ensure the uploads/bills directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'bills')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate PDF filename
    const filename = `${dealerBill.billNumber || 'DEALER-BILL-' + Date.now()}.pdf`
    const filepath = path.join(uploadsDir, filename)

    // Generate PDF
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px'
      }
    })

    await browser.close()

    // Return relative path for database storage
    return `/uploads/bills/${filename}`
  } catch (error) {
    console.error('Error generating dealer bill PDF:', error)
    throw error
  }
}

/**
 * Generate unique dealer bill number
 * Format: DEALER-BILL-YYYY-NNNN
 * @param {Model} DealerBill - Mongoose model
 * @returns {Promise<string>} Generated bill number
 */
async function generateDealerBillNumber(DealerBill) {
  try {
    const currentYear = new Date().getFullYear()

    // Count existing dealer bills created this year
    const count = await DealerBill.countDocuments({
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`)
      }
    })

    // Generate bill number with zero-padded counter
    const billNumber = `DEALER-BILL-${currentYear}-${String(count + 1).padStart(4, '0')}`

    return billNumber
  } catch (error) {
    console.error('Error generating dealer bill number:', error)
    throw error
  }
}

module.exports = {
  generateDealerBillHTML,
  generateDealerBillPDF,
  generateDealerBillNumber
}
