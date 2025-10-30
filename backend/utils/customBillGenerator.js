const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

/**
 * Convert number to words (Indian numbering system)
 */
function numberToWords(num) {
  if (!num || num === 0) return 'Zero'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

  function convertLessThanThousand(n) {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '')
  }

  let word = ''
  let crore = Math.floor(num / 10000000)
  let lakh = Math.floor((num % 10000000) / 100000)
  let thousand = Math.floor((num % 100000) / 1000)
  let hundred = num % 1000

  if (crore > 0) word += convertLessThanThousand(crore) + ' Crore '
  if (lakh > 0) word += convertLessThanThousand(lakh) + ' Lakh '
  if (thousand > 0) word += convertLessThanThousand(thousand) + ' Thousand '
  if (hundred > 0) word += convertLessThanThousand(hundred)

  return word.trim()
}

/**
 * Generate HTML template for custom bill
 */
function generateCustomBillHTML(customBill) {
  const currentDate = customBill.billDate || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Helper function to convert newlines to <br> tags for HTML
  const formatDescription = (text) => {
    if (!text) return ''
    return text.replace(/\n/g, '<br>')
  }

  // Build items HTML
  let itemsHTML = ''

  if (customBill.items && customBill.items.length > 0) {
    customBill.items.forEach((item, index) => {
      itemsHTML += `
        <tr class="item-row">
          <td class="sl-no-col">${index + 1}</td>
          <td class="description-col">${formatDescription(item.description || '')}</td>
          <td class="qty-col">${item.quantity || 1}</td>
          <td class="rate-col">${item.rate ? item.rate.toLocaleString('en-IN') : '-'}</td>
          <td style="text-align: right; padding-right: 8px;">${item.amount ? item.amount.toLocaleString('en-IN') : '-'}</td>
        </tr>
      `
    })
  }

  // Add empty rows to make at least 3 rows
  const itemCount = customBill.items ? customBill.items.length : 0
  for (let i = itemCount; i < 3; i++) {
    itemsHTML += `
      <tr class="item-row">
        <td class="sl-no-col"></td>
        <td class="description-col"></td>
        <td class="qty-col"></td>
        <td class="rate-col"></td>
        <td style="text-align: right; padding-right: 8px;"></td>
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
          font-family: Arial, sans-serif;
          padding: 50px;
          background: white;
          color: #000;
        }
        .bill-container {
          max-width: 850px;
          margin: 0 auto;
          border: 3px solid #000;
          padding: 40px;
          background: white;
        }
        .bill-header {
          text-align: center;
          margin-bottom: 35px;
        }
        .bill-badge {
          display: inline-block;
          background: #2c3e50;
          color: white;
          padding: 8px 24px;
          border-radius: 18px;
          font-size: 13px;
          font-weight: bold;
          letter-spacing: 1.5px;
          margin-bottom: 15px;
        }
        .company-name {
          font-size: 48px;
          font-weight: bold;
          color: #000;
          font-style: italic;
          margin-bottom: 8px;
          letter-spacing: 2px;
          white-space: nowrap;
        }
        .company-subtitle {
          font-size: 16px;
          color: #000;
          font-style: italic;
          margin-bottom: 12px;
        }
        .company-address {
          font-size: 13px;
          color: #000;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        .bill-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          font-size: 14px;
          padding: 10px 0;
        }
        .bill-number {
          font-weight: bold;
        }
        .bill-number-value {
          color: #c0392b;
          font-size: 24px;
          font-weight: bold;
        }
        .customer-section {
          margin-bottom: 25px;
          padding-bottom: 12px;
          border-bottom: 2px solid #000;
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .customer-label {
          font-size: 14px;
          font-weight: bold;
          white-space: nowrap;
        }
        .customer-name {
          font-size: 14px;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          min-height: 24px;
          flex: 1;
        }
        .items-table {
          width: 100%;
          border: 3px solid #000;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .items-table th {
          background: #ecf0f1;
          border: 2px solid #000;
          padding: 14px 10px;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }
        .items-table td {
          border: 2px solid #000;
          padding: 12px 10px;
          font-size: 14px;
          vertical-align: top;
        }
        .sl-no-col {
          width: 8%;
          text-align: center;
        }
        .description-col {
          width: 52%;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .qty-col {
          width: 10%;
          text-align: center;
        }
        .rate-col {
          width: 15%;
          text-align: right;
        }
        .amount-col {
          width: 15%;
        }
        .item-row {
          height: auto;
          min-height: 70px;
        }
        .total-row {
          font-weight: bold;
          background: #f8f9fa;
        }
        .total-label {
          text-align: right;
          font-weight: bold;
          padding-right: 12px;
        }
        .amount-words {
          margin-bottom: 40px;
          font-size: 14px;
          line-height: 2;
        }
        .amount-words-label {
          font-weight: bold;
          display: inline;
        }
        .amount-words-value {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 450px;
          padding-bottom: 5px;
          padding-left: 8px;
        }
        .signature-section {
          text-align: right;
          margin-top: 60px;
          font-size: 14px;
        }
        .signature-line {
          margin-top: 65px;
          padding-top: 8px;
        }
        .signature-label {
          font-weight: bold;
          font-size: 15px;
        }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <!-- Header -->
        <div class="bill-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="flex: 1;"></div>
            <div style="flex: 1; text-align: center;">
              <div class="bill-badge">BILL / CASH MEMO</div>
            </div>
            <div style="flex: 1; text-align: right; font-size: 10px; font-weight: bold; line-height: 1.6;">
              Mob.: 99934-48850<br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;98271-46175
            </div>
          </div>
          <div style="text-align: center;">
            <div class="company-name">ASHOK KUMAR</div>
            <div class="company-subtitle">(Transport Consultant)</div>
            <div class="company-address">
              GF-17, Ground Floor, Shyam Plaza, Opp. Bus Stand, Pandri, RAIPUR<br>
              Email : ashok123kumarbhatt@gmail.com
            </div>
          </div>
        </div>

        <!-- Bill Info -->
        <div class="bill-info">
          <div>
            <span class="bill-number">No.</span>
            <span class="bill-number-value">${customBill.billNumber || 'PENDING'}</span>
          </div>
          <div>
            <span style="font-weight: bold;">Date</span>
            <span style="margin-left: 10px; border-bottom: 1px solid #000; padding: 0 30px;">${currentDate}</span>
          </div>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
          <span class="customer-label">M/s.</span>
          <span class="customer-name">${customBill.customerName || ''}</span>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th class="sl-no-col">SI<br>No.</th>
              <th class="description-col">DESCRIPTION</th>
              <th class="qty-col">Qty.</th>
              <th class="rate-col">Rate</th>
              <th class="amount-col">AMOUNT<br>Rs.</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="total-row">
              <td colspan="4" class="total-label">TOTAL</td>
              <td style="text-align: right; padding-right: 8px;">₹${customBill.totalAmount ? customBill.totalAmount.toLocaleString('en-IN') : '0'}</td>
            </tr>
          </tbody>
        </table>

        <!-- Amount in Words -->
        <div class="amount-words">
          <span class="amount-words-label">Rs</span>
          <span class="amount-words-value">${numberToWords(customBill.totalAmount)} Rupees Only</span>
        </div>

        <!-- Signature -->
        <div class="signature-section">
          <div class="signature-line">
            <span class="signature-label">For, ASHOK KUMAR</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate PDF from custom bill data
 */
async function generateCustomBillPDF(customBill) {
  try {
    const html = generateCustomBillHTML(customBill)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const uploadsDir = path.join(__dirname, '..', 'uploads', 'bills')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const filename = `${customBill.billNumber || 'CUSTOM-BILL-' + Date.now()}.pdf`
    const filepath = path.join(uploadsDir, filename)

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

    return `/uploads/bills/${filename}`
  } catch (error) {
    console.error('Error generating custom bill PDF:', error)
    throw error
  }
}

/**
 * Generate unique custom bill number
 * Format: Simple sequential numbers (01, 02, 03, etc.)
 */
async function generateCustomBillNumber(CustomBill) {
  try {
    // Count all custom bills to get the next number
    const count = await CustomBill.countDocuments()

    // Generate simple sequential bill number starting from 01
    const billNumber = String(count + 1).padStart(2, '0')

    return billNumber
  } catch (error) {
    console.error('Error generating custom bill number:', error)
    throw error
  }
}

module.exports = {
  generateCustomBillHTML,
  generateCustomBillPDF,
  generateCustomBillNumber
}
