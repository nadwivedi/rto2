import React, { useState, useRef } from 'react'

const SapathPatraModal = ({ onClose }) => {
  const printRef = useRef()
  const inputRefs = useRef([])

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    resident: '',
    district: '',
    vehicleNumber: '',
    chassisNumber: '',
    mobileNumber: '',
    model: '',
    make: '',
    buyerName: '',
    buyerFather: '',
    buyerAddress: '',
    buyerDistrict: '',
    sellerName: '',
    sellerFather: '',
    sellerAddress: '',
    sellerDistrict: '',
    verificationName: '',
    verificationFather: '',
    verificationDate: '',
    buyerSignature: '',
    sellerSignature: '',
    buyerMobile: '',
    sellerMobile: ''
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
          <title>शपथ-पत्र (Sapath Patra)</title>
          <link href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Laila:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif;
              font-size: 15px;
              line-height: 1.75;
              padding: 20px;
              font-weight: 700;
              color: #000000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .form-container { width: 100%; max-width: 800px; margin: 0 auto; }
            input {
              border: none !important;
              background: transparent;
              outline: none;
              width: 100%;
              font-family: Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif;
              font-size: 15px;
              padding: 0;
              line-height: 1.75;
              font-weight: bold;
              color: #000000;
            }
            .no-print { display: none !important; }
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
            .no-print { display: table-cell !important; }
            @media print {
              .no-print { display: none !important; }
            }
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
              fontSize: '15px',
              lineHeight: '1.75',
              fontWeight: '700',
              color: '#000000'
            }}
          >
            <div className="form-container">
              {/* Title */}
              <div style={{textAlign: 'center'}}>
                <h1 style={{fontSize: '36px', fontWeight: '900', letterSpacing: '4px', color: '#000000'}}>शपथ-पत्र</h1>
                <p style={{fontSize: '15px', marginTop: '0px', fontWeight: '700', color: '#000000'}}>समक्ष नोटरी जिला सिविल कार्यालय</p>
                <p style={{fontSize: '14px', marginTop: '0px', fontWeight: '700', color: '#000000', marginBottom: '2px'}}>(आर.टी.ओ. कार्यालय में पेश करने हेतु)</p>
              </div>

              {/* Opening Section */}
              <div style={{marginBottom: '3px', display: 'flex', alignItems: 'baseline'}}>
                <span>मैं</span>
                <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                  <input
                    ref={(el) => inputRefs.current[0] = el}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 0)}
                    style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                  />
                </div>
                <span style={{marginLeft: '10px'}}>पिता/पति</span>
                <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                  <input
                    ref={(el) => inputRefs.current[1] = el}
                    type="text"
                    name="buyerFather"
                    value={formData.buyerFather}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 1)}
                    style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                  />
                </div>
              </div>

              {/* age , niwasi , tehsil */}

              <div style={{marginBottom: '3px', display: 'flex', alignItems: 'baseline'}}>
                <span>उम्र</span>
                <div style={{width: '100px', borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                  <input
                    ref={(el) => inputRefs.current[2] = el}
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                    style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                  />
                </div>
                <span style={{marginLeft: '8px'}}>वर्ष, निवासी</span>
                <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                  <input
                    ref={(el) => inputRefs.current[3] = el}
                    type="text"
                    name="resident"
                    value={formData.resident}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 3)}
                    style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                  />
                </div>
                <span style={{marginLeft: '8px'}}>तहसील</span>
                <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                  <input
                    ref={(el) => inputRefs.current[4] = el}
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 4)}
                    style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                  />
                </div>
              </div>

              {/* jila */}

              <div style={{marginBottom: '3px', display: 'flex', alignItems: 'baseline'}}>
                <span>जिला</span>
                <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                  <input
                    ref={(el) => inputRefs.current[5] = el}
                    type="text"
                    name="buyerDistrict"
                    value={formData.buyerDistrict}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, 5)}
                    style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                  />
                </div>
                <span style={{marginLeft: '8px'}}>का रहने वाला हूं, जो कि निम्नलिखित कथन पूर्वक कहता हूं –</span>
              </div>

              {/* Declaration Points */}
              <div style={{marginBottom: '2px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>1.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline', flexWrap: 'wrap'}}>
                    <span>यह है कि मैं वाहन क्रमांक</span>
                    <div style={{flex: '1 1 200px', borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                      <input
                        ref={(el) => inputRefs.current[6] = el}
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 6)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>का पंजीकृत स्वामी हूं, जिसका</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'baseline', marginTop: '4px'}}>
                    <span>चेसिस नंबर</span>
                    <div style={{flex: '1 1 200px', borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                      <input
                        ref={(el) => inputRefs.current[7] = el}
                        type="text"
                        name="chassisNumber"
                        value={formData.chassisNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 7)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>इंजन नंबर</span>
                    <div style={{flex: '1 1 200px', borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                      <input
                        ref={(el) => inputRefs.current[8] = el}
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 8)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                  </div>

                  {/* model no  */}
                  <div style={{display: 'flex', alignItems: 'baseline', marginTop: '3px'}}>
                    <span>मॉडल नं.</span>
                    <div style={{flex: '1 1 200px', borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                      <input
                        ref={(el) => inputRefs.current[9] = el}
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 9)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>है। जिसका मार्क कर</span>
                    <div style={{flex: '1 1 150px', borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.75'}}>
                      <input
                        ref={(el) => inputRefs.current[10] = el}
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 10)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>तक जमा है।</span>
                  </div>
                </div>
              </div>

              <div style={{marginBottom: '2px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>2.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline', flexWrap: 'wrap'}}>
                    <span>यह है कि मैं वाहन क्रमांक</span>
                    <div style={{borderBottom: '2px dotted #000', minHeight: '20px', display: 'inline-block', minWidth: '150px', marginLeft: '8px'}}>
                      <input
                        ref={(el) => inputRefs.current[11] = el}
                        type="text"
                        name="vehicleNumber2"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 11)}
                        style={{border:'none', background: 'transparent', outline: 'none', width: '150px', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0 2px', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                      />
                    </div>
                    <span style={{marginLeft: '8px'}}>जो कि</span>
                    <div style={{flex: '1 1 300px', borderBottom: '2px dotted #000', minHeight: '20px', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{marginTop: '4px', display: 'flex', alignItems: 'baseline'}}>
                    <span>पिता/पति श्री</span>
                    <div style={{flex: 1, borderBottom: '2px dotted #000', minHeight: '20px', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{marginTop: '4px', display: 'flex', alignItems: 'baseline'}}>
                    <span>निवासी</span>
                    <div style={{flex: '1 1 350px', borderBottom: '2px dotted #000', minHeight: '20px', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>तहसील</span>
                    <div style={{flex: '1 1 200px', borderBottom: '2px dotted #000', minHeight: '20px', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{marginTop: '4px'}}>
                    <span>जिला</span>
                    <div style={{borderBottom: '2px dotted #000', minHeight: '20px', display: 'inline-block', minWidth: '200px', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>को बिक्री कर दिया हूं। जिसका रकम प्राप्त हो गया है।</span>
                  </div>
                </div>
              </div>

              <div style={{marginBottom: '2px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>3.</span>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'baseline', flexWrap: 'wrap'}}>
                    <span>यह है कि वाहन क्रमांक</span>
                    <div style={{borderBottom: '2px dotted #000', minHeight: '20px', display: 'inline-block', minWidth: '150px', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>को श्री</span>
                    <div style={{flex: '1 1 200px', borderBottom: '2px dotted #000', minHeight: '20px', marginLeft: '8px'}}></div>
                  </div>
                  <div style={{marginTop: '4px'}}>
                    <span>पिता</span>
                    <div style={{borderBottom: '2px dotted #000', minHeight: '20px', display: 'inline-block', minWidth: '200px', marginLeft: '8px'}}></div>
                    <span style={{marginLeft: '8px'}}>के नाम से स्वामित्व अन्तरण किया जाता है तो उसमें मुझे एवं वारिसों को कोई आपत्ति नहीं है।</span>
                  </div>
                </div>
              </div>

              <div style={{marginBottom: '1px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>4.</span>
                <span>यह है कि बिक्री पत्र फार्म नं. 29 एवं 30 में रजिस्टर्ड ओनर द्वारा मेरे समक्ष हस्ताक्षर किया है।</span>
              </div>

              <div style={{marginBottom: '1px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>5.</span>
                <span>यह है कि मैंने बिकेता रजिस्टर्ड ओनर को वाहन का बिक्रय मूल्य पूरी तौर से भुगतान कर दिया है।</span>
              </div>

              <div style={{marginBottom: '1px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>6.</span>
                <span>यह है कि उक्त वाहन के बिक्रय में किसी भी भी प्रकार का विवाद नहीं है।</span>
              </div>

              <div style={{marginBottom: '1px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>7.</span>
                <span>यह है कि उक्त वाहन के बिक्री राशि संबंधी, स्वामित्व अन्तरण संबंधी या अन्य किसी बाबत कोई विवाद होता है तो उसकी पूरी जवाबदारी व्यक्तिगत रूप से बिकेता एवं हम दोनों की होगी।</span>
              </div>

              <div style={{marginBottom: '2px', display: 'flex', alignItems: 'flex-start'}}>
                <span style={{marginRight: '8px'}}>8.</span>
                <div style={{flex: 1}}>
                  <span>यह है कि उक्त वर्णित वाहन का कब्जा बिकेता द्वारा क्रेता को चाबी एवं दस्तावेज की मूल प्रति आज दिनांक को दे दिया गया है। उक्त वाहन के संबंध में आज से पूर्व हुई किसी भी प्रकार के मामलों की जिम्मेदारी बिकेता की होगी तथा आज दिनांक के बाद की समस्त जवाबदारी क्रेता की होगी।</span>
                </div>
              </div>

              {/* Buyer and Seller Section */}
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2px'}}>
                  <div style={{width: '100px', height: '90px', border: '2px solid #000', padding: '8px', textAlign: 'center', display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <strong style={{fontWeight: '900', color: '#000000', fontSize: '12px'}}>Buyer Photo</strong>
                  </div>
                  <div style={{textAlign: 'center', flex: 1, padding: '0 10px'}}>
                    <div style={{marginBottom: '8px'}}>
                      <strong style={{fontSize: '16px', fontWeight: '900', color: '#000000'}}>P</strong> <span style={{fontWeight: '700', color: '#000000'}}>शपथकर्ता (क्रेता)</span>
                    </div>
                    <div style={{borderBottom: '2px dotted #000', minHeight: '30px', marginBottom: '8px'}}></div>
                  </div>
                  <div style={{textAlign: 'center', flex: 1, padding: '0 10px'}}>
                    <div style={{marginBottom: '8px'}}>
                      <strong style={{fontSize: '16px', fontWeight: '900', color: '#000000'}}>S</strong> <span style={{fontWeight: '700', color: '#000000'}}>शपथकर्ता (बिक्रेता)</span>
                    </div>
                    <div style={{borderBottom: '2px dotted #000', minHeight: '30px'}}></div>
                  </div>
                  <div style={{width: '100px', height: '90px', border: '2px solid #000', padding: '8px', textAlign: 'center', display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <strong style={{fontWeight: '900', color: '#000000', fontSize: '12px'}}>Seller Photo</strong>
                  </div>
                </div>
                <div style={{textAlign: 'center', width: '100%', marginTop: '1px', marginBottom: '1px'}}>
                  <h2 style={{fontSize: '22px', fontWeight: '900', color: '#000000', letterSpacing: '2px', margin: '0'}}>सत्यापन</h2>
                </div>
              </div>

              {/* Verification Section */}
              <div style={{marginTop: '1px'}}>
                <div style={{marginBottom: '1px', display: 'flex', alignItems: 'baseline'}}>
                  <span>मैं</span>
                  <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.8'}}>
                    <input
                      ref={(el) => inputRefs.current[12] = el}
                      type="text"
                      name="verificationName"
                      value={formData.verificationName}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, 12)}
                      style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                    />
                  </div>
                  <span style={{marginLeft: '8px',marginBottom:'0px'}}>पिता/पति</span>
                  <div style={{flex: 1, borderBottom: '2px dotted #000', marginLeft: '8px', lineHeight: '1.8'}}>
                    <input
                      ref={(el) => inputRefs.current[13] = el}
                      type="text"
                      name="verificationFather"
                      value={formData.verificationFather}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, 13)}
                      style={{border:'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: "Mangal, Kokila, Aparajita, 'Laila', 'Hind', sans-serif", fontSize: '15px', padding: '0', lineHeight: '1.75', textTransform: 'uppercase', fontWeight: 'bold', color: '#000000'}}
                    />
                  </div>
                </div>
                <p style={{marginBottom: '1px', fontWeight: '700', color: '#000000'}}>पता <span style={{marginLeft: '8px', borderBottom: '2px dotted #000', display: 'inline-block', minWidth: '350px'}}></span> यह सत्यापित करता हूं कि उपरोक्त कंडिका 1 से 7 तक</p>
                <p style={{marginBottom: '1px', fontWeight: '700', color: '#000000'}}>की गई सभी जानकारी क्रेता एवं बिक्रेता को स्वीकार्य है। हम दोनों ने अपने होशो–हवाश में पढ़कर व समझकर</p>
                <p style={{marginBottom: '0px', fontWeight: '700', color: '#000000'}}>आज दिनांक <span style={{marginLeft: '8px', borderBottom: '2px dotted #000', display: 'inline-block', minWidth: '200px'}}></span> को हस्ताक्षर किया।</p>
              </div>

              {/* Final Signatures */}
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '-10px'}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{borderBottom: '2px dotted #000', minHeight: '35px', width: '200px', marginBottom: '0px'}}></div>
                  <p style={{fontWeight: '700', color: '#000000', marginBottom: '0px', marginTop: '0px'}}>शपथकर्ता (क्रेता)</p>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: '0px'}}>
                    <span style={{fontWeight: '700', color: '#000000'}}>मो.नं.</span>
                    <div style={{borderBottom: '2px dotted #000', lineHeight: '1.8', flex: 1, marginLeft: '8px'}}></div>
                  </div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{borderBottom: '2px dotted #000', minHeight: '35px', width: '200px', marginBottom: '0px'}}></div>
                  <p style={{fontWeight: '700', color: '#000000', marginBottom: '0px', marginTop: '0px'}}>शपथकर्ता (बिक्रेता)</p>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: '0px'}}>
                    <span style={{fontWeight: '700', color: '#000000'}}>मो.नं.</span>
                    <div style={{borderBottom: '2px dotted #000', lineHeight: '1.8', flex: 1, marginLeft: '8px'}}></div>
                  </div>
                </div>
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

export default SapathPatraModal
