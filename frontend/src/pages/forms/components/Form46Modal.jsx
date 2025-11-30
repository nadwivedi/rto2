import React, { useState, useRef } from 'react'

const Form46Modal = ({ onClose }) => {
  const printRef = useRef()

  const [formData, setFormData] = useState({
    stateName: '',
    applicantName: '',
    relation: '',
    address: '',
    regMark: '',
    yearOfManufacture: '',
    dateOfRegistration: '',
    engineNumber: '',
    chassisNumber: '',
    permitNumber: '',
    permitIssueDate: '',
    permitExpiryDate: '',
    unladenWeight: '',
    grossWeight: '',
    payLoad: '',
    periodFrom: '',
    periodTo: '',
    certificateEnclosed: '',
    bankDraft: '',
    date: '',
    statePayments: [
      { sno: '1', stateName: '', amountPaid: '', bankDraft: '', dateOfPayment: '' }
    ]
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (index, field, value) => {
    const updatedPayments = [...formData.statePayments]
    updatedPayments[index][field] = value
    setFormData(prev => ({ ...prev, statePayments: updatedPayments }))
  }

  const addPaymentRow = () => {
    setFormData(prev => ({
      ...prev,
      statePayments: [
        ...prev.statePayments,
        {
          sno: (prev.statePayments.length + 1).toString(),
          stateName: '',
          amountPaid: '',
          bankDraft: '',
          dateOfPayment: ''
        }
      ]
    }))
  }

  const removePaymentRow = (index) => {
    if (formData.statePayments.length > 1) {
      const updatedPayments = formData.statePayments.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, statePayments: updatedPayments }))
    }
  }

  const handlePrint = (printEmpty = false) => {
    const printContent = printRef.current

    const inputs = printContent.querySelectorAll('input')
    const originalValues = []
    if (printEmpty) {
      inputs.forEach((input, i) => {
        originalValues[i] = input.value
        input.value = ''
      })
    }

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>FORM 46 - Tourist Permit or National Permit</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; font-size: 12px; line-height: 1.4; padding: 20px; }
            .form-container { width: 100%; max-width: 800px; margin: 0 auto; }
            .title { text-align: center; margin-bottom: 15px; }
            .title h1 { font-size: 18px; font-weight: bold; letter-spacing: 4px; }
            .title p { font-size: 11px; margin-top: 3px; }
            .title h2 { font-size: 13px; font-weight: bold; margin-top: 5px; }
            .to { margin-bottom: 15px; }
            .intro { margin-bottom: 15px; line-height: 1.6; }
            .section-title { font-weight: bold; margin: 10px 0 5px 0; }
            .row { display: flex; margin-bottom: 8px; align-items: baseline; }
            .num { width: 30px; flex-shrink: 0; }
            .label { flex-shrink: 0; margin-right: 10px; }
            .line { flex: 1; border-bottom: 1px solid #000; min-height: 16px; position: relative; }
            .inline-field { display: inline-flex; align-items: baseline; margin: 0 5px; }
            .inline-label { margin-right: 5px; }
            .inline-line { border-bottom: 1px solid #000; min-width: 80px; display: inline-block; }
            input {
              border: none !important;
              background: transparent;
              outline: none;
              width: 100%;
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              padding: 0 2px;
            }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table, th, td { border: 1px solid #000; }
            th, td { padding: 8px; text-align: left; font-size: 11px; }
            th { font-weight: bold; text-align: center; }
            .no-print { display: none !important; }
            .footer { margin-top: 20px; }
            .sig-section { display: flex; justify-content: space-between; margin-top: 15px; }
            .note { font-size: 10px; font-style: italic; margin-top: 5px; }
            @media print {
              body { padding: 10px; }
              @page { margin: 10mm; size: A4; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    if (printEmpty) {
      inputs.forEach((input, i) => {
        input.value = originalValues[i]
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Form 46 - Tourist/National Permit</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint(true)}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
              title="Print Empty Form"
            >
              📄 EMPTY
            </button>
            <button
              onClick={() => handlePrint(false)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              title="Print Filled Form"
            >
              🖨️ PRINT
            </button>
            <button
              onClick={onClose}
              className="ml-2 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef} className="bg-white" style={{fontFamily: "'Times New Roman', serif", fontSize: '14px', lineHeight: '1.5'}}>
            <div className="form-container">
              {/* Title */}
              <div className="title text-center mb-6">
                <h1 className="text-2xl font-bold" style={{letterSpacing: '4px'}}>FORM 46</h1>
                <p className="text-sm mt-1">See Rule (83) (1) and 87 (1)</p>
                <h2 className="text-base font-bold mt-2">Form of application for grant of authorisation</h2>
                <h2 className="text-base font-bold">tourist Permit or National Permit</h2>
              </div>

              {/* To Section */}
              <div className="to mb-4">
                <p>To,</p>
                <p className="ml-12 mt-1">The Regional / State Transport Authority</p>
              </div>

              {/* Intro */}
              <div className="intro mb-4">
                <p>I/We the undersigned hereby by apply for grant of authorisation valid throughout the territory</p>
                <div className="flex items-baseline mt-1">
                  <span>of India/ in the state of</span>
                  <div className="flex-1 ml-2 border-b border-black">
                    <input type="text" name="stateName" value={formData.stateName} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                  </div>
                </div>
              </div>

              {/* Section Title */}
              <p className="text-center font-bold mb-3">(Specify the name of the State)</p>

              {/* Field 1 */}
              <div className="row flex mb-2">
                <span className="num">1.</span>
                <span className="label" style={{width: '280px'}}>Name of the applicants in full</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 2 */}
              <div className="row flex mb-2">
                <span className="num">2.</span>
                <span className="label" style={{width: '280px'}}>Son/ Wife/ Daughter of</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="relation" value={formData.relation} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 3 */}
              <div className="row flex mb-2">
                <span className="num">3.</span>
                <span className="label" style={{width: '280px'}}>Address</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 4 */}
              <div className="row flex mb-2">
                <span className="num">4.</span>
                <span className="label" style={{width: '280px'}}>Registration mark & year of manufacture</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="regMark" value={formData.regMark} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>& date of registration of the motor vehicle</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="dateOfRegistration" value={formData.dateOfRegistration} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 5 */}
              <div className="row flex mb-2">
                <span className="num">5.</span>
                <span className="label" style={{width: '280px'}}>Engine number of the motor vehicle</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 6 */}
              <div className="row flex mb-2">
                <span className="num">6.</span>
                <span className="label" style={{width: '280px'}}>Chassis number of the motor vehicle</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 7 */}
              <div className="row flex mb-2">
                <span className="num">7.</span>
                <span className="label" style={{width: '280px'}}>Permit number of the authority who has</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="permitNumber" value={formData.permitNumber} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>issued the permit and date of issue and</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="permitIssueDate" value={formData.permitIssueDate} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>date of expiry of the permit</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="permitExpiryDate" value={formData.permitExpiryDate} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 8 */}
              <div className="row flex mb-2">
                <span className="num">8.</span>
                <span className="label" style={{width: '280px'}}>Unladen weight of the motor vehicle</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="unladenWeight" value={formData.unladenWeight} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>

              {/* Field 9 */}
              <div className="row flex mb-2">
                <span className="num">9.</span>
                <span className="label" style={{width: '280px'}}>Gross vehicle weight of the motor</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="grossWeight" value={formData.grossWeight} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>vehicle</span>
                <div className="line flex-1 border-b border-black"></div>
              </div>

              {/* Field 10 */}
              <div className="row flex mb-2">
                <span className="num">10.</span>
                <span className="label" style={{width: '280px'}}>Pay load of the motor vehicle seating</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="payLoad" value={formData.payLoad} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>capacity in the case of tourist vehicle</span>
                <div className="line flex-1 border-b border-black"></div>
              </div>

              {/* Field 11 */}
              <div className="row flex mb-2">
                <span className="num">11.</span>
                <span className="label" style={{width: '200px'}}>Period for which the authorisation is</span>
                <span className="inline-label">From</span>
                <div className="border-b border-black" style={{width: '100px', display: 'inline-block'}}>
                  <input type="text" name="periodFrom" value={formData.periodFrom} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
                <span className="inline-label ml-4">To</span>
                <div className="border-b border-black flex-1" style={{minWidth: '100px', display: 'inline-block'}}>
                  <input type="text" name="periodTo" value={formData.periodTo} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>sought from</span>
                <div className="line flex-1 border-b border-black"></div>
              </div>

              {/* Field 12 */}
              <div className="row flex mb-2">
                <span className="num">12.</span>
                <span className="label" style={{width: '280px'}}>I/We enclosed the certificate of</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="certificateEnclosed" value={formData.certificateEnclosed} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>registration & permit of the vehicle</span>
                <div className="line flex-1 border-b border-black"></div>
              </div>

              {/* Field 13 */}
              <div className="row flex mb-4">
                <span className="num">13.</span>
                <span className="label" style={{width: '280px'}}>I/We enclosed Bank draft as</span>
                <div className="line flex-1 border-b border-black">
                  <input type="text" name="bankDraft" value={formData.bankDraft} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                </div>
              </div>
              <div className="row flex ml-8 mb-2">
                <span className="label" style={{width: '272px'}}>manufactured hereunder toward payment</span>
                <div className="line flex-1 border-b border-black"></div>
              </div>
              <div className="row flex ml-8 mb-4">
                <span className="label" style={{width: '272px'}}>of the authorisation.</span>
                <div className="line flex-1 border-b border-black"></div>
              </div>

              {/* Payment Table */}
              <table className="w-full border-collapse border border-black mt-4 mb-4">
                <thead>
                  <tr>
                    <th className="border border-black p-2 text-center" style={{width: '60px'}}>S.No.<br/>1</th>
                    <th className="border border-black p-2 text-center">Name of the State<br/>2</th>
                    <th className="border border-black p-2 text-center" style={{width: '120px'}}>Amount Paid<br/>3</th>
                    <th className="border border-black p-2 text-center">Particulars of Bank<br/>Draft & Date</th>
                    <th className="border border-black p-2 text-center" style={{width: '120px'}}>Date of<br/>Payment<br/>5</th>
                    <th className="border border-black p-2 text-center no-print" style={{width: '60px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.statePayments.map((payment, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2 text-center">{payment.sno}</td>
                      <td className="border border-black p-2">
                        <input
                          type="text"
                          value={payment.stateName}
                          onChange={(e) => handlePaymentChange(index, 'stateName', e.target.value)}
                          className="w-full outline-none bg-transparent"
                          style={{border:'none'}}
                        />
                      </td>
                      <td className="border border-black p-2">
                        <input
                          type="text"
                          value={payment.amountPaid}
                          onChange={(e) => handlePaymentChange(index, 'amountPaid', e.target.value)}
                          className="w-full outline-none bg-transparent"
                          style={{border:'none'}}
                        />
                      </td>
                      <td className="border border-black p-2">
                        <input
                          type="text"
                          value={payment.bankDraft}
                          onChange={(e) => handlePaymentChange(index, 'bankDraft', e.target.value)}
                          className="w-full outline-none bg-transparent"
                          style={{border:'none'}}
                        />
                      </td>
                      <td className="border border-black p-2">
                        <input
                          type="text"
                          value={payment.dateOfPayment}
                          onChange={(e) => handlePaymentChange(index, 'dateOfPayment', e.target.value)}
                          className="w-full outline-none bg-transparent"
                          style={{border:'none'}}
                        />
                      </td>
                      <td className="border border-black p-2 text-center no-print">
                        <button
                          onClick={() => removePaymentRow(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          disabled={formData.statePayments.length === 1}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={addPaymentRow}
                className="mb-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 no-print"
              >
                + Add Row
              </button>

              {/* Footer */}
              <div className="footer mt-6">
                <div className="flex justify-between items-end">
                  <div className="flex items-baseline">
                    <span>Date</span>
                    <div className="border-b border-black ml-4" style={{width: '150px'}}>
                      <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full outline-none bg-transparent" style={{border:'none'}} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-black mb-1" style={{width: '200px', height: '40px'}}></div>
                    <p className="text-sm font-bold">Signature of thumb impression</p>
                    <p className="text-sm font-bold">of the applicant</p>
                  </div>
                </div>
                <p className="text-xs mt-4 italic">Strike out whichever is inapplicable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form46Modal
