import React, { useState, useRef } from 'react'

const KaryalayForm2Modal = ({ onClose }) => {
  const printRef = useRef()
  const inputRefs = useRef([])

  const [formData, setFormData] = useState({
    fileNumber: '',
    serialNumber: '',
    subject: '',
    registeredOwnerName: '',
    fatherName: '',
    motherName: '',
    address: '',
    vehicleNumber: '',
    vehicleModel: '',
    chassisNumber: '',
    engineNumber: '',
    registrationDate: '',
    vehicleColor: '',
    registrationTaxDetails: '',
    insuranceValidity: '',
    fitnessValidity: '',
    previousOwnership: '',
    vehicleCategory: '',
    presenterName: '',
    presenterMobileNumber: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleKeyDown = (e, currentIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const nextIndex = currentIndex + 1
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus()
      }
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
          <title>कार्यालय सचिव - परिवहन प्राधिकार संभाग, रायपुर</title>
          <link href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Laila:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              padding: 20px;
              font-weight: 600;
              color: #000000;
            }
            .form-container { width: 100%; max-width: 800px; margin: 0 auto; }
            input {
              border: none !important;
              background: transparent;
              outline: none;
              width: 100%;
              font-family: Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif;
              font-size: 14px;
              padding: 0;
              line-height: 1.6;
              font-weight: bold;
              color: #000000;
            }
            @media print {
              body { padding: 5mm; margin: 0; }
              @page {
                margin: 0;
                size: A4;
              }
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
            @import url('https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Laila:wght@400;500;600;700&display=swap');
          `}</style>
          <div
            ref={printRef}
            className="bg-white shadow-lg mx-auto"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '5mm',
              fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              fontWeight: '600',
              color: '#000000'
            }}
          >
            <div className="form-container">
              {/* Header */}
              <div style={{textAlign: 'center', marginBottom: '15px'}}>
                <h1 style={{fontSize: '20px', fontWeight: 'bold', color: '#000000'}}>कार्यालय सचिव, क्षेत्रीय परिवहन प्राधिकार संभाग, रायपुर (छ.ग.)</h1>
              </div>

              {/* File Numbers */}
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                <div style={{display: 'flex', alignItems: 'baseline'}}>
                  <span>नस्ती क्रमांक</span>
                  <div style={{borderBottom: '1.5px dotted #000', width: '150px', marginLeft: '8px'}}>
                    <input
                      ref={(el) => inputRefs.current[0] = el}
                      type="text"
                      name="fileNumber"
                      value={formData.fileNumber}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, 0)}
                      style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                    />
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'baseline'}}>
                  <span>पृष्ठ क्रमांक</span>
                  <div style={{borderBottom: '1.5px dotted #000', width: '150px', marginLeft: '8px'}}>
                    <input
                      ref={(el) => inputRefs.current[1] = el}
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, 1)}
                      style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div style={{marginBottom: '15px', padding: '10px', border: '2px solid #000'}}>
                <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '8px'}}>
                  <span>विषय :- मालयान क्रमांक</span>
                  <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                    <input
                      ref={(el) => inputRefs.current[2] = el}
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, 2)}
                      style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                    />
                  </div>
                  <span style={{marginLeft: '8px'}}>को केन्द्रीय मोटरयान अधिनियम 1988 के</span>
                </div>
                <p style={{fontWeight: '600'}}>नियम 86 की धारा 88 एवं सिस्टम 1989 के नियम 86 के अंतर्गत राष्ट्रीय अनुज्ञापत्र के प्राधिकार पत्र स्वीकृत किये जाने बाबत आवेदन पत्र !</p>
              </div>

              {/* Field 1 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>1.</span>
                <div style={{flex: 1}}>
                  <div style={{marginBottom: '5px'}}>
                    <span>केन्द्रीय मोटरयान अधिनियम 1988 की धारा 88 एवं नियम 1989 के नियम 86 के अंतर्गत मालयान</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '5px'}}>
                    <span>क्रमांक</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[3] = el}
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 3)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>के पंजीकृत स्वामी</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '5px'}}>
                    <span>श्री</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[4] = el}
                        type="text"
                        name="registeredOwnerName"
                        value={formData.registeredOwnerName}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 4)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '5px'}}>
                    <span>पिता श्री</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[5] = el}
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 5)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>निवासी</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[6] = el}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 6)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                  </div>
                  <div style={{marginTop: '5px'}}>
                    <span>अपनी वाहन को राष्ट्रीय अनुज्ञापत्र के प्राधिकार पत्र स्वीकृत किये जाने हेतु निधारित फार्म का विहित शुल्क</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginTop: '5px'}}>
                    <span>रू.</span>
                    <div style={{width: '150px', borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>मालवान क्रमांक/स्वीद क्रमांक</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>दिनांक</span>
                    <div style={{width: '150px', borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{marginTop: '5px'}}>
                    <span>को जमा कर आवेदन पत्र प्रस्तुत</span>
                  </div>
                  <div style={{marginTop: '5px'}}>
                    <span>किया है जिसका चालान रिकनसाईल दिनांक</span>
                    <div style={{borderBottom: '1.5px dotted #000', display: 'inline-block', minWidth: '200px', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>को किया गया है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 2 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>2.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>वाहन का कलर सत्यापन दिनांक</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>को</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{marginTop: '5px'}}>
                    <span>द्वारा किया गया है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 3 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>3.</span>
                <div style={{flex: 1}}>
                  <div style={{marginBottom: '5px'}}>
                    <span>इस पंजीकृत वाहन पर पंजीयन तिथि से किसी भी प्रकार का कर बकाया नहीं है एवं त्रैमासिक धर दिनांक</span>
                  </div>
                  <div>
                    <span>तक जमा है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 4 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>4.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>बीमा की वैद्यता</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[7] = el}
                        type="text"
                        name="insuranceValidity"
                        value={formData.insuranceValidity}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 7)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 5 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>5.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>फिटनेश की वैद्यता</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[8] = el}
                        type="text"
                        name="fitnessValidity"
                        value={formData.fitnessValidity}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 8)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 6 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>6.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '5px'}}>
                    <span>वाहन का मॉडल</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[9] = el}
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 9)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>तथा पंजीयन तिथि</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[10] = el}
                        type="text"
                        name="registrationDate"
                        value={formData.registrationDate}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 10)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>है ।</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '5px'}}>
                    <span>वाहन का चेसीस क्र.</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[11] = el}
                        type="text"
                        name="chassisNumber"
                        value={formData.chassisNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 11)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>तथा इंजन क्र.</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[12] = el}
                        type="text"
                        name="engineNumber"
                        value={formData.engineNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 12)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                  </div>
                  <div style={{marginTop: '5px'}}>
                    <span>अत: वाहन राष्ट्रीय अनुज्ञापत्र का प्राधिकार पत्र आगामी पांच वर्षों के लिये इस शर्त के साथ स्वीकृत किये</span>
                  </div>
                  <div style={{marginTop: '5px'}}>
                    <span>जा सकता है कि दिनांक</span>
                    <div style={{borderBottom: '1.5px dotted #000', display: 'inline-block', minWidth: '200px', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>को समाप्त हो जायेगा ।</span>
                  </div>
                </div>
              </div>

              {/* Field 7 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>7.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>वाहन का सकलयान भार</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>एवं लदान रहित भार</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 8 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'baseline'}}>
                <span style={{width: '30px', flexShrink: 0}}>8.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>वहन इसी / उप कार्यालय द्वारा पंजीबद्ध है ।</span>
                  </div>
                </div>
              </div>

              {/* Field 9 */}
              <div style={{marginBottom: '12px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>9.</span>
                <div style={{flex: 1}}>
                  <div style={{marginBottom: '5px'}}>
                    <span>वाहन स्वामी के स्वामित्व के पूर्व मालयान परमिट की जानकारी</span>
                    <div style={{borderBottom: '1.5px dotted #000', display: 'inline-block', minWidth: '300px', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>एवं वाहन की संख्या</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                  </div>
                </div>
              </div>

              {/* Field 10 */}
              <div style={{marginBottom: '15px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{width: '30px', flexShrink: 0}}>10.</span>
                <div style={{flex: 1}}>
                  <div style={{marginBottom: '5px'}}>
                    <span>प्रस्तुतकर्ता :-</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginBottom: '5px'}}>
                    <span>आवेदक का नाम श्री</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[13] = el}
                        type="text"
                        name="presenterName"
                        value={formData.presenterName}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 13)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>मोबाईल नं.</span>
                    <div style={{width: '200px', borderBottom: '1.5px dotted #000', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[14] = el}
                        type="text"
                        name="presenterMobileNumber"
                        value={formData.presenterMobileNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 14)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '14px', padding: '0', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span>वाहन स्वामी के प्रतिनिधि का नाम</span>
                    <div style={{flex: 1, borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>मोबाईल नं.</span>
                    <div style={{width: '200px', borderBottom: '1.5px dotted #000', marginLeft: '8px'}}></div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{textAlign: 'center', marginTop: '30px', paddingTop: '15px', borderTop: '2px solid #000'}}>
                <p style={{fontWeight: 'bold'}}>प्रकरण अवलोकनार्थ एवं आदेशार्थ प्रस्तुत है ।</p>
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

export default KaryalayForm2Modal
