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
            input {
              border: none !important;
              background: transparent;
              outline: none;
              width: 100%;
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              padding: 0 2px;
            }
            .no-print { display: none !important; }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto pt-1 pb-2">
      <div className="w-full max-w-[1280px] flex gap-2 px-2">
        {/* Form Section */}
        <div className="flex-1 bg-gray-100 rounded-lg p-2">
          <style>{`
            .no-print { display: table-cell !important; }
            @media print {
              .no-print { display: none !important; }
            }
          `}</style>
          <div
            ref={printRef}
            className="bg-white shadow-lg mx-auto"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '20mm',
              fontFamily: "'Times New Roman', serif",
              fontSize: '12px',
              lineHeight: '1.4'
            }}
          >
            <div className="form-container">
              {/* Title */}
              <div style={{textAlign: 'center', marginBottom: '15px'}}>
                <h1 style={{fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px'}}>FORM 46</h1>
                <p style={{fontSize: '11px', marginTop: '3px'}}>See Rule (83) (1) and 87 (1)</p>
                <h2 style={{fontSize: '13px', fontWeight: 'bold', marginTop: '5px'}}>Form of application for grant of authorisation</h2>
                <h2 style={{fontSize: '13px', fontWeight: 'bold'}}>tourist Permit or National Permit</h2>
              </div>

              {/* To Section */}
              <div style={{marginBottom: '15px'}}>
                <p>To,</p>
                <p style={{marginLeft: '48px', marginTop: '4px'}}>The Regional / State Transport Authority</p>
              </div>

              {/* Intro */}
              <div style={{marginBottom: '15px', lineHeight: '1.6'}}>
                <p>I/We the undersigned hereby by apply for grant of authorisation valid throughout the territory</p>
                <div style={{display: 'flex', alignItems: 'baseline', marginTop: '4px'}}>
                  <span>of India/ in the state of</span>
                  <div style={{flex: 1, borderBottom: '2px solid #000', marginLeft: '8px', minHeight: '16px'}}>
                    <input type="text" name="stateName" value={formData.stateName} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                  </div>
                </div>
              </div>

              {/* Section Title */}
              <p style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '12px'}}>(Specify the name of the State)</p>

              {/* Field 1 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>1.</span>
                <span style={{width: '280px', flexShrink: 0, marginRight: '10px'}}>Name of the applicants in full</span>
                <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                  <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                </div>
              </div>

              {/* Field 2 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>2.</span>
                <span style={{width: '280px', flexShrink: 0, marginRight: '10px'}}>Son/ Wife/ Daughter of</span>
                <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                  <input type="text" name="relation" value={formData.relation} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                </div>
              </div>

              {/* Field 3 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>3.</span>
                <span style={{width: '280px', flexShrink: 0, marginRight: '10px'}}>Address</span>
                <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                </div>
              </div>

              {/* Field 4 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>4.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <div style={{width: '250px', flexShrink: 0, marginRight: '10px'}}>
                      <div>Registration mark & year of manufacture</div>
                      <div>& date of registration of the motor vehicle</div>
                    </div>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="regMark" value={formData.regMark} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 5 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>5.</span>
                <span style={{width: '280px', flexShrink: 0, marginRight: '10px'}}>Engine number of the motor vehicle</span>
                <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                  <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                </div>
              </div>

              {/* Field 6 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>6.</span>
                <span style={{width: '280px', flexShrink: 0, marginRight: '10px'}}>Chassis number of the motor vehicle</span>
                <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                  <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                </div>
              </div>

              {/* Field 7 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>7.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <div style={{width: '250px', flexShrink: 0, marginRight: '10px'}}>
                      <div>Permit number of the authority who has</div>
                      <div>issued the permit and date of issue and</div>
                      <div>date of expiry of the permit</div>
                    </div>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="permitNumber" value={formData.permitNumber} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 8 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>8.</span>
                <span style={{width: '280px', flexShrink: 0, marginRight: '10px'}}>Unladen weight of the motor vehicle</span>
                <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                  <input type="text" name="unladenWeight" value={formData.unladenWeight} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                </div>
              </div>

              {/* Field 9 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>9.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <div style={{width: '250px', flexShrink: 0, marginRight: '10px'}}>
                      <div>Gross vehicle weight of the motor</div>
                      <div>vehicle</div>
                    </div>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="grossWeight" value={formData.grossWeight} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 10 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>10.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <div style={{width: '250px', flexShrink: 0, marginRight: '10px'}}>
                      <div>Pay load of the motor vehicle seating</div>
                      <div>capacity in the case of tourist vehicle</div>
                    </div>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="payLoad" value={formData.payLoad} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 11 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>11.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <div style={{width: '170px', flexShrink: 0, marginRight: '10px'}}>
                      <div>Period for which the authorisation </div>
                      <div>is sought from</div>
                    </div>
                    <span style={{marginRight: '5px', paddingTop: '0px'}}>From</span>
                    <div style={{width: '90px', borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="periodFrom" value={formData.periodFrom} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                    <span style={{marginLeft: '10px', marginRight: '5px'}}>To</span>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="periodTo" value={formData.periodTo} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 12 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>12.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <div style={{width: '250px', flexShrink: 0, marginRight: '10px'}}>
                      <div>I/We enclosed the certificate of</div>
                      <div>registration & permit of the vehicle</div>
                    </div>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="certificateEnclosed" value={formData.certificateEnclosed} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 13 */}
              <div style={{display: 'flex', marginBottom: '8px', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0, paddingTop: '6px'}}>13.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '8px'}}>
                    <div style={{width: '250px', flexShrink: 0, marginRight: '10px'}}>
                      <div>I/We enclosed Bank draft as</div>
                      <div>manufactured hereunder toward payment</div>
                      <div>of the authorisation.</div>
                    </div>
                    <div style={{flex: 1, borderBottom: '2px solid #000', minHeight: '16px'}}>
                      <input type="text" name="bankDraft" value={formData.bankDraft} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Table */}
              <table style={{width: '100%', borderCollapse: 'collapse', border: '2px solid #000', margin: '15px 0'}}>
                <thead>
                  <tr>
                    <th style={{border: '2px solid #000', padding: '8px', textAlign: 'center', width: '60px', fontSize: '11px', fontWeight: 'bold'}}>S.No.<br/>1</th>
                    <th style={{border: '2px solid #000', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold'}}>Name of the State<br/>2</th>
                    <th style={{border: '2px solid #000', padding: '8px', textAlign: 'center', width: '120px', fontSize: '11px', fontWeight: 'bold'}}>Amount Paid<br/>3</th>
                    <th style={{border: '2px solid #000', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold'}}>Particulars of Bank<br/>Draft & Date</th>
                    <th style={{border: '2px solid #000', padding: '8px', textAlign: 'center', width: '120px', fontSize: '11px', fontWeight: 'bold'}}>Date of<br/>Payment<br/>5</th>
                    <th className="no-print" style={{border: '2px solid #000', padding: '8px', textAlign: 'center', width: '60px', fontSize: '11px', fontWeight: 'bold'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.statePayments.map((payment, index) => (
                    <tr key={index}>
                      <td style={{border: '2px solid #000', padding: '8px', textAlign: 'center', fontSize: '11px'}}>{payment.sno}</td>
                      <td style={{border: '2px solid #000', padding: '8px', fontSize: '11px'}}>
                        <input
                          type="text"
                          value={payment.stateName}
                          onChange={(e) => handlePaymentChange(index, 'stateName', e.target.value)}
                          style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '11px'}}
                        />
                      </td>
                      <td style={{border: '2px solid #000', padding: '8px', fontSize: '11px'}}>
                        <input
                          type="text"
                          value={payment.amountPaid}
                          onChange={(e) => handlePaymentChange(index, 'amountPaid', e.target.value)}
                          style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '11px'}}
                        />
                      </td>
                      <td style={{border: '2px solid #000', padding: '8px', fontSize: '11px'}}>
                        <input
                          type="text"
                          value={payment.bankDraft}
                          onChange={(e) => handlePaymentChange(index, 'bankDraft', e.target.value)}
                          style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '11px'}}
                        />
                      </td>
                      <td style={{border: '2px solid #000', padding: '8px', fontSize: '11px'}}>
                        <input
                          type="text"
                          value={payment.dateOfPayment}
                          onChange={(e) => handlePaymentChange(index, 'dateOfPayment', e.target.value)}
                          style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '11px'}}
                        />
                      </td>
                      <td className="no-print" style={{border: '2px solid #000', padding: '8px', textAlign: 'center', fontSize: '11px'}}>
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
              <div style={{marginTop: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>Date</span>
                    <div style={{borderBottom: '2px solid #000', marginLeft: '16px', width: '150px', minHeight: '16px'}}>
                      <input type="text" name="date" value={formData.date} onChange={handleChange} style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "'Times New Roman', serif", fontSize: '12px', padding: '0 2px'}} />
                    </div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{borderBottom: '2px solid #000', marginBottom: '4px', width: '200px', height: '40px'}}></div>
                    <p style={{fontSize: '11px', fontWeight: 'bold'}}>Signature of thumb impression</p>
                    <p style={{fontSize: '11px', fontWeight: 'bold'}}>of the applicant</p>
                  </div>
                </div>
                <p style={{fontSize: '10px', fontStyle: 'italic', marginTop: '16px'}}>Strike out whichever is inapplicable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons Section on Right */}
        <div className="w-44 flex-shrink-0">
          <div className="sticky top-1 bg-white rounded-lg shadow-xl p-3 space-y-2">
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 text-3xl font-bold h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all border-2 border-gray-300 hover:border-gray-400"
              title="Close"
            >
              ✕
            </button>
            <div className="border-t border-gray-200 my-2"></div>
            <button
              onClick={() => handlePrint(true)}
              className="w-full px-3 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              title="Print Empty Form"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">📄</span>
                <div className="leading-tight text-center">
                  <div>PRINT</div>
                  <div>EMPTY</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handlePrint(false)}
              className="w-full px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              title="Print Filled Form"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">🖨️</span>
                <div className="leading-tight text-center">
                  <div>PRINT</div>
                  <div>FILLED</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form46Modal
