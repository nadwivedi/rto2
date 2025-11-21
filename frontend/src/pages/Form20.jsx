import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const Form20 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const printRef = useRef()

  const [formData, setFormData] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
          <title>FORM 20 - MOTOR VEHICLE REGISTRATION</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 10.5px; line-height: 1.4; padding: 12px 18px; text-transform: uppercase; }
            .title { text-align: center; margin-bottom: 10px; }
            .title h1 { font-size: 14px; font-weight: bold; }
            .title h2 { font-size: 12px; font-weight: bold; margin-top: 3px; }
            .title p { font-size: 10px; }
            .to { margin-bottom: 8px; }
            .field { display: flex; margin-bottom: 3px; }
            .field-num { width: 22px; flex-shrink: 0; }
            .field-content { flex: 1; }
            .field-row { display: flex; align-items: flex-end; gap: 5px; flex-wrap: wrap; }
            .field-sub { margin-left: 14px; margin-top: 2px; }
            input {
              border: none;
              border-bottom: 1px dotted #000;
              background: transparent;
              outline: none;
              padding: 0 3px;
              font-size: 10.5px;
              text-transform: uppercase;
            }
            .note { font-size: 9px; margin-top: 2px; }
            .section-title { text-align: center; font-weight: bold; font-size: 10px; margin: 8px 0 4px; border-top: 1px solid #000; padding-top: 4px; }
            .sig-row { display: flex; justify-content: space-around; margin-top: 6px; }
            .sig-box { text-align: center; }
            .sig-line { border-bottom: 1px dotted #000; width: 80px; height: 20px; margin: 4px auto 0; }
            .flex-between { display: flex; justify-content: space-between; margin-top: 6px; }
            .border-note { border-left: 2px solid #000; padding-left: 4px; margin: 4px 0; font-size: 8px; }
            @media print {
              body { padding: 5px 10px; }
              @page { margin: 5mm; size: A4; }
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

  const inputStyle = "border-b border-dotted border-black bg-transparent outline-none px-1 uppercase"

  return (
    <div className="min-h-screen pt-16 lg:pt-20 px-4 pb-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <button onClick={() => navigate('/forms')} className="flex items-center text-gray-600 hover:text-gray-800">
            <span className="mr-2">←</span> Back to Forms
          </button>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handlePrint(true)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
              📄 PRINT EMPTY
            </button>
            <button onClick={() => handlePrint(false)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              🖨️ PRINT FILLED
            </button>
            <button onClick={() => handlePrint(false)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              📥 DOWNLOAD PDF
            </button>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="flex justify-center gap-4 mb-4">
          <button onClick={() => setCurrentPage(1)} className={`px-6 py-2 rounded-lg font-medium ${currentPage === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            PAGE 1
          </button>
          <button onClick={() => setCurrentPage(2)} className={`px-6 py-2 rounded-lg font-medium ${currentPage === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            PAGE 2
          </button>
        </div>

        {/* Form Content */}
        <div ref={printRef} className="bg-white shadow-lg p-8 text-sm leading-relaxed uppercase">

          {currentPage === 1 && (
            <>
              <div className="title text-center mb-6">
                <h1 className="text-lg font-bold">FORM -20</h1>
                <p className="text-sm">(SEE RULE 47)</p>
                <h2 className="text-base font-bold mt-2">FORM OF APPLICATION FOR REGISTRATION OF A MOTOR VEHICLE</h2>
              </div>

              <p className="to mb-4">TO,<br/>&nbsp;&nbsp;&nbsp;&nbsp;THE REGISTERING AUTHORITY RAIPUR</p>

              <div className="space-y-3">
                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">1.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>FULL NAME OF PERSON TO BE REGISTERED AS</span>
                      <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className={inputStyle} style={{width: '180px'}} />
                    </div>
                    <div>REGISTERED OWNER</div>
                    <div className="field-row flex items-end gap-2">
                      <span>SON / WIFE / DAUGHTER OF</span>
                      <input type="text" name="relation" value={formData.relation || ''} onChange={handleChange} className={inputStyle} style={{width: '200px'}} />
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">2.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>AGE OF THE PERSON TO BE REGISTERED AS</span>
                      <input type="text" name="age" value={formData.age || ''} onChange={handleChange} className={inputStyle} style={{width: '120px'}} />
                    </div>
                    <div>REGISTERED OWNER (PROOF OF AGE TO BE ATTACHED)</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">3.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>PERMANENT ADDRESS OF THE PERSON TO BE</span>
                      <input type="text" name="permanentAddress1" value={formData.permanentAddress1 || ''} onChange={handleChange} className={inputStyle} style={{width: '180px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2">
                      <span>REGISTERED AS REGISTERED OWNER</span>
                      <input type="text" name="permanentAddress2" value={formData.permanentAddress2 || ''} onChange={handleChange} className={inputStyle} style={{width: '200px'}} />
                    </div>
                    <div>(EVIDENCE TO BE PRODUCED)</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">4.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>TEMPORARY ADDRESS OF THE PERSON TO BE</span>
                      <input type="text" name="tempAddress1" value={formData.tempAddress1 || ''} onChange={handleChange} className={inputStyle} style={{width: '180px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2">
                      <span>REGISTERED AS REGISTERED OWNER</span>
                      <input type="text" name="tempAddress2" value={formData.tempAddress2 || ''} onChange={handleChange} className={inputStyle} style={{width: '200px'}} />
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">5.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>NAME & ADDRESS OF THE DEALER OR MANUFACTURE</span>
                      <input type="text" name="dealerName" value={formData.dealerName || ''} onChange={handleChange} className={inputStyle} style={{width: '150px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2">
                      <span>FROM WHOMS THE VEHICLE WAS PURCHASED</span>
                      <input type="text" name="dealerAddress1" value={formData.dealerAddress1 || ''} onChange={handleChange} className={inputStyle} style={{width: '160px'}} />
                    </div>
                    <div>(SALE CERTIFICATE AND CERTIFICATE OF ROAD</div>
                    <div>WORTHINESS ISSUED BY THE MANUFACTURE TO BE ENCLOSED.</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">6.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>IF EX-ARMY VEHICLE OR IMPORTED VEHICLE</span>
                      <input type="text" name="exArmy1" value={formData.exArmy1 || ''} onChange={handleChange} className={inputStyle} style={{width: '160px'}} />
                    </div>
                    <div>ENCLOSED PROOF. IF LOCALLY MANUFACTURER TRAILER</div>
                    <div>SEMI TRAILER ENCLOSED THE APPROVAL OF DESIGN</div>
                    <div>BY THE STATE TRANSPORT AUTHORITY AND NOTE</div>
                    <div>THE PROCEEDINGS NUMBER AND DATE OF APPROVAL</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">7.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>CLASS OF VEHICLE</span>
                      <input type="text" name="vehicleClass" value={formData.vehicleClass || ''} onChange={handleChange} className={inputStyle} style={{width: '250px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2">
                      <span>(IF MOTOR VEHICLE, WHETHER WITH OR WITHOUT GEAR)</span>
                      <input type="text" name="withGear" value={formData.withGear || ''} onChange={handleChange} className={inputStyle} style={{width: '120px'}} />
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">8.</span>
                  <div className="field-content flex-1">
                    <div>THE MOTOR VEHICLE IS</div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>A) A NEW VEHICLE:</span>
                      <input type="text" name="newVehicle" value={formData.newVehicle || ''} onChange={handleChange} className={inputStyle} style={{width: '220px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>B) EX-ARMY VEHICLE:</span>
                      <input type="text" name="exArmyVehicle" value={formData.exArmyVehicle || ''} onChange={handleChange} className={inputStyle} style={{width: '210px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>C) IMPORTED VEHICLE:</span>
                      <input type="text" name="importedVehicle" value={formData.importedVehicle || ''} onChange={handleChange} className={inputStyle} style={{width: '205px'}} />
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">9.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>TYPE OF BODY</span>
                    <input type="text" name="bodyType" value={formData.bodyType || ''} onChange={handleChange} className={inputStyle} style={{width: '280px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">10.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>TYPE OF VEHICLE</span>
                    <input type="text" name="vehicleType" value={formData.vehicleType || ''} onChange={handleChange} className={inputStyle} style={{width: '260px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">11.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>MAKER'S NAME</span>
                    <input type="text" name="makerName" value={formData.makerName || ''} onChange={handleChange} className={inputStyle} style={{width: '270px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">12.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>MONTH AND YEAR OF MANUFACTURE</span>
                    <input type="text" name="manufactureDate" value={formData.manufactureDate || ''} onChange={handleChange} className={inputStyle} style={{width: '180px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">13.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>NUMBER OF CYLINDERS</span>
                    <input type="text" name="cylinders" value={formData.cylinders || ''} onChange={handleChange} className={inputStyle} style={{width: '230px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">14.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>HORSE POWER</span>
                    <input type="text" name="horsePower" value={formData.horsePower || ''} onChange={handleChange} className={inputStyle} style={{width: '280px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">15.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>CUBIC CAPACITY</span>
                    <input type="text" name="cubicCapacity" value={formData.cubicCapacity || ''} onChange={handleChange} className={inputStyle} style={{width: '260px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">16.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>MAKER'S CLASSIFICATION OR IF NOT KNOWN</span>
                      <input type="text" name="makerClass" value={formData.makerClass || ''} onChange={handleChange} className={inputStyle} style={{width: '160px'}} />
                    </div>
                    <div>WHEEL BASE</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">17.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>CHASSIS NUMBER</span>
                      <input type="text" name="chassisNumber" value={formData.chassisNumber || ''} onChange={handleChange} className={inputStyle} style={{width: '240px'}} />
                    </div>
                    <div>(AFFIX PENCIL PRINT)</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">18.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>ENGINE NUMBER</span>
                    <input type="text" name="engineNumber" value={formData.engineNumber || ''} onChange={handleChange} className={inputStyle} style={{width: '260px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">19.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>SEATING CAPACITY</span>
                      <input type="text" name="seatingCapacity" value={formData.seatingCapacity || ''} onChange={handleChange} className={inputStyle} style={{width: '240px'}} />
                    </div>
                    <div>(INCLUDING DRIVER)</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">20.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>FUEL USED IN THE ENGINE</span>
                    <input type="text" name="fuelUsed" value={formData.fuelUsed || ''} onChange={handleChange} className={inputStyle} style={{width: '210px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">21.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>UNLODED WEIGHT</span>
                    <input type="text" name="unladenWeight" value={formData.unladenWeight || ''} onChange={handleChange} className={inputStyle} style={{width: '250px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">22.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>PARTICULAR OF PREVIOUS REGISTRATION AND</span>
                      <input type="text" name="prevReg" value={formData.prevReg || ''} onChange={handleChange} className={inputStyle} style={{width: '160px'}} />
                    </div>
                    <div>REGISTERED NUMBER (IF ANY)</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">23.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>COLOUR OR COLOURS OF BODY WINGS AND FRONT END</span>
                      <input type="text" name="colour" value={formData.colour || ''} onChange={handleChange} className={inputStyle} style={{width: '130px'}} />
                    </div>
                    <div className="note text-xs">I HEREBY DECLARE THAT THE VEHICLE HAS NOT BEEN REGISTERED IN ANY STATE IN INDIA.</div>
                    <div className="note text-xs">ADDITIONAL PARTICULARS TO BE COMPLETED ONLY IN THE CASE OF TRANSPORT VEHICLE OTHER THAN MOTOR CAR</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">24.</span>
                  <div className="field-content flex-1">
                    <div>NUMBER DESCRIPTION AND SIZE OF TYRES</div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>A) FRONT AXLE</span>
                      <input type="text" name="frontAxle" value={formData.frontAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '240px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>B) REAR AXLE</span>
                      <input type="text" name="rearAxle" value={formData.rearAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '245px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>C) ANY OTHER AXLE</span>
                      <input type="text" name="otherAxle" value={formData.otherAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '220px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>D) TANDOM AXLE</span>
                      <input type="text" name="tandomAxle" value={formData.tandomAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '230px'}} />
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">25.</span>
                  <div className="field-content flex-1">
                    <div>GROSS WEIGHT OF VEHICLE</div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>A) AS CERTIFIED BY THE MANUFACTURE</span>
                      <input type="text" name="grossCertified" value={formData.grossCertified || ''} onChange={handleChange} className={inputStyle} style={{width: '100px'}} />
                      <span>KGMS</span>
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>B) TO BE REGISTERED</span>
                      <input type="text" name="grossRegistered" value={formData.grossRegistered || ''} onChange={handleChange} className={inputStyle} style={{width: '150px'}} />
                      <span>KGMS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 no-print">
                <button onClick={() => setCurrentPage(2)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  NEXT PAGE →
                </button>
              </div>
            </>
          )}

          {currentPage === 2 && (
            <>
              <div className="space-y-3">
                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">26.</span>
                  <div className="field-content flex-1">
                    <div>MAXIMUM AXLE WEIGHT</div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>A) FRONT AXLE</span>
                      <input type="text" name="maxFrontAxle" value={formData.maxFrontAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '220px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>B) REAR AXLE</span>
                      <input type="text" name="maxRearAxle" value={formData.maxRearAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '150px'}} />
                      <span>KGMS</span>
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>C) ANY OTHER AXLE</span>
                      <input type="text" name="maxOtherAxle" value={formData.maxOtherAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '130px'}} />
                      <span>KGMS</span>
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>D) TENDOM AXLE</span>
                      <input type="text" name="maxTandomAxle" value={formData.maxTandomAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '140px'}} />
                      <span>KGMS</span>
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">27.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>A) OVERALL LENGTH</span>
                      <input type="text" name="overallLength" value={formData.overallLength || ''} onChange={handleChange} className={inputStyle} style={{width: '220px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>B) OVERALL WIDTH</span>
                      <input type="text" name="overallWidth" value={formData.overallWidth || ''} onChange={handleChange} className={inputStyle} style={{width: '225px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>C) OVERALL HEIGHT</span>
                      <input type="text" name="overallHeight" value={formData.overallHeight || ''} onChange={handleChange} className={inputStyle} style={{width: '220px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2 field-sub">
                      <span>D) OVERALL HAND</span>
                      <input type="text" name="overallHand" value={formData.overallHand || ''} onChange={handleChange} className={inputStyle} style={{width: '225px'}} />
                    </div>
                  </div>
                </div>

                <div className="border-note text-xs border-l-2 border-gray-500 pl-2 my-2">
                  THE ABOVE PARTICULARS ARE TO BE FILLED IN FOR A RIGID FRAME MOTOR VEHICLE OF TWO OR MORE AXLES OR AN ARTICULATED VEHICLE OF THREE OR MORE AXLES, OR TO THE EXTENT APPLICABLE FOR TRAILER, WHERE A SECOND SEMI-TRAILER OR ADDITIONAL SEMI-TRAILER ARE TO BE REGISTERED WITH AN ARTICULATED MOTOR VEHICLE, THE FOLLOWING PARTICULARS ARE TO BE FURNISHED OF EACH SEMI-TRAILER.
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">28.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>TYPE OF BODY</span>
                    <input type="text" name="semiBodyType" value={formData.semiBodyType || ''} onChange={handleChange} className={inputStyle} style={{width: '280px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">29.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>UNLODING WEIGHT</span>
                    <input type="text" name="semiUnladenWeight" value={formData.semiUnladenWeight || ''} onChange={handleChange} className={inputStyle} style={{width: '260px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">30.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>NUMBER DESCRIPTION AND SIZE OF TYRES ON</span>
                      <input type="text" name="semiTyres1" value={formData.semiTyres1 || ''} onChange={handleChange} className={inputStyle} style={{width: '150px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2">
                      <span>EACH AXLE</span>
                      <input type="text" name="semiTyres2" value={formData.semiTyres2 || ''} onChange={handleChange} className={inputStyle} style={{width: '280px'}} />
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">31.</span>
                  <div className="field-row flex items-end gap-2 flex-1">
                    <span>MAXIMUM AXLE WEIGHT IN RESPECT OF EACH AXLE</span>
                    <input type="text" name="semiMaxAxle" value={formData.semiMaxAxle || ''} onChange={handleChange} className={inputStyle} style={{width: '140px'}} />
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">32.</span>
                  <div className="field-content flex-1">
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>THE VEHICLE IS COVERED BY A VALID CERTIFICATE</span>
                      <span className="ml-2">INSURANCE CERTIFICATE OR COVER NOTE</span>
                    </div>
                    <div className="field-row flex items-end gap-2 flex-wrap">
                      <span>OF INSURANCE UNDER-CHAPTER XI OF THE ACT.</span>
                      <span className="ml-2">NO.</span>
                      <input type="text" name="insuranceNo" value={formData.insuranceNo || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                      <span>DATE</span>
                      <input type="text" name="insuranceDate" value={formData.insuranceDate || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                    </div>
                    <div className="field-row flex items-end gap-2">
                      <span>(NAME OF COMPANY</span>
                      <input type="text" name="insuranceCompany" value={formData.insuranceCompany || ''} onChange={handleChange} className={inputStyle} style={{width: '180px'}} />
                      <span>)</span>
                    </div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">33.</span>
                  <div className="field-content flex-1">
                    <div>THE VEHICLE IS EXEMPTED FROM INSURANCE -</div>
                    <div>THE RELEVANT ORDER IS ENCLOSED.</div>
                  </div>
                </div>

                <div className="field flex">
                  <span className="field-num w-8 flex-shrink-0">34.</span>
                  <div className="field-row flex items-end gap-2 flex-1 flex-wrap">
                    <span>I HAVE PAID THE PRESCRIBED FEE OF RUPEES</span>
                    <span className="ml-4">VALID FROM</span>
                    <input type="text" name="validFrom" value={formData.validFrom || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                    <span>TO</span>
                    <input type="text" name="validTo" value={formData.validTo || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                  </div>
                </div>

                <div className="flex-between flex justify-between mt-3">
                  <div className="field-row flex items-end gap-2">
                    <span>DATE</span>
                    <input type="text" name="formDate" value={formData.formDate || ''} onChange={handleChange} className={inputStyle} style={{width: '120px'}} />
                  </div>
                  <div className="text-center text-sm">
                    <div>SIGNATURE OF THE PERSON TO BE REGISTERED</div>
                    <div>AS REGISTERED OWNERS,</div>
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  <div>NOTE:- THE MOTOR VEHICLE ABOVE PRESCRIBED IS:</div>
                  <div className="field-row flex items-end gap-2 mt-1 flex-wrap">
                    <span>I) SUBJECT TO HIRE PURCHASE AGREEMENT / LEASE AGREE WITH</span>
                    <input type="text" name="hirePurchase" value={formData.hirePurchase || ''} onChange={handleChange} className={inputStyle} style={{width: '150px'}} />
                  </div>
                  <div className="field-row flex items-end gap-2 flex-wrap">
                    <span>II) SUBJECT TO HYPOTHECATION IN FAVOUR OF</span>
                    <input type="text" name="hypothecation" value={formData.hypothecation || ''} onChange={handleChange} className={inputStyle} style={{width: '200px'}} />
                  </div>
                  <div className="text-xs mt-1">
                    III) NOTE HELD UNDER HIRE PURCHASE AGREEMENT OR LEASE AGREEMENT OR SUBJECT TO HYPOTHECATION.<br/>
                    STRIKE OUT WHATEVER IS INAPPLICABLE, IF THE VEHICLE IS SUBJECT TO ANY SUCH AGREEMENT THE SIGNATURE OF THE PERSON WITH WHOM THE AGREEMENT HAS BEEN ENTERED IN TO BE OBTAINED.
                  </div>
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  <div className="text-center">
                    <div>SIGNATURE OF THE PERSON WITH WHOM AN AGREEMENT OF HIRE</div>
                    <div>PURCHASE, LEASE OR HYPOTHECATION HAS BEEN ENTERED IN TO.</div>
                    <div>SPECIMEN SIGNATURE OF THE PERSON TO BE REGISTERED AS REGISTERED OWNER.</div>
                  </div>
                  <div className="text-center">
                    <div>SIGNATURE OF THE OWNER</div>
                  </div>
                </div>

                <div className="sig-row flex justify-around mt-3">
                  <div className="sig-box text-center">
                    <div>(1) (वेचने वाला)</div>
                    <div className="sig-line border-b border-dotted border-black w-24 h-5 mt-1 mx-auto"></div>
                  </div>
                  <div className="sig-box text-center">
                    <div>(2) (वेचने वाला)</div>
                    <div className="sig-line border-b border-dotted border-black w-24 h-5 mt-1 mx-auto"></div>
                  </div>
                  <div className="sig-box text-center">
                    <div>(3) (वेचने वाला)</div>
                    <div className="sig-line border-b border-dotted border-black w-24 h-5 mt-1 mx-auto"></div>
                  </div>
                </div>

                <div className="section-title text-center font-bold mt-4 border-t pt-2">
                  <h3>CERTIFICATE</h3>
                  <h4>INSPECTED THE VEHICLE</h4>
                </div>

                <div className="mt-2 text-sm">
                  <p>CERTIFIED THAT THE PARTICULARS CONTAINED IN THE APPLICATION ARE TRUE AND THAT THE VEHICLE COMPLIES WITH THE REQUIREMENTS OF THE MOTOR VEHICLE ACT. 1988 AND RULES MADE THERE UNDER.</p>
                </div>

                <div className="flex-between flex justify-between mt-3">
                  <div className="field-row flex items-end gap-2">
                    <span>DATE</span>
                    <input type="text" name="certDate" value={formData.certDate || ''} onChange={handleChange} className={inputStyle} style={{width: '120px'}} />
                  </div>
                  <div className="text-center text-sm">
                    <div>SIGNATURE OF THE INSPECTING AUTHORITY</div>
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-2 flex-wrap">
                  <div className="field-row flex items-end gap-2">
                    <span>NAME</span>
                    <input type="text" name="inspectorName" value={formData.inspectorName || ''} onChange={handleChange} className={inputStyle} style={{width: '120px'}} />
                  </div>
                  <div className="field-row flex items-end gap-2">
                    <span>DESIGNATION</span>
                    <input type="text" name="inspectorDesignation" value={formData.inspectorDesignation || ''} onChange={handleChange} className={inputStyle} style={{width: '120px'}} />
                  </div>
                </div>

                <div className="section-title text-center font-bold mt-4 border-t pt-2">
                  <h3>FOR OFFICE ENDORSEMENT</h3>
                </div>

                <div className="mt-2 text-sm space-y-1">
                  <div className="field-row flex items-end gap-2 flex-wrap">
                    <span>REF. NUMBER</span>
                    <input type="text" name="refNumber" value={formData.refNumber || ''} onChange={handleChange} className={inputStyle} style={{width: '100px'}} />
                    <span>OFFICE OF THE -</span>
                    <input type="text" name="officeName" value={formData.officeName || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                    <span>DATED</span>
                    <input type="text" name="endorseDate" value={formData.endorseDate || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                  </div>
                  <div className="field-row flex items-end gap-2 flex-wrap">
                    <span>THE</span>
                    <input type="text" name="theVehicle" value={formData.theVehicle || ''} onChange={handleChange} className={inputStyle} style={{width: '100px'}} />
                    <span>BEARING CHASSES NUMBER</span>
                    <input type="text" name="endorseChassisNo" value={formData.endorseChassisNo || ''} onChange={handleChange} className={inputStyle} style={{width: '100px'}} />
                    <span>AND</span>
                  </div>
                  <div className="field-row flex items-end gap-2 flex-wrap">
                    <span>NUMBER</span>
                    <input type="text" name="engineNo2" value={formData.engineNo2 || ''} onChange={handleChange} className={inputStyle} style={{width: '100px'}} />
                    <span>HAS BEEN ASSIGNED THE REGISTRATION NUMBER</span>
                    <input type="text" name="regNumber" value={formData.regNumber || ''} onChange={handleChange} className={inputStyle} style={{width: '80px'}} />
                  </div>
                  <div className="field-row flex items-end gap-2 flex-wrap">
                    <span>AND REGISTERED IN THE NAME OF</span>
                    <input type="text" name="regName" value={formData.regName || ''} onChange={handleChange} className={inputStyle} style={{width: '220px'}} />
                  </div>
                  <div className="field-row flex items-end gap-2 flex-wrap">
                    <span>AND VEHICLE IS SUBJECT TO AN AGREEMENT OF HIRE PURCHASE/ LEASE/ HYPOTHECATION</span>
                    <input type="text" name="agreement" value={formData.agreement || ''} onChange={handleChange} className={inputStyle} style={{width: '100px'}} />
                  </div>
                  <div>TO,</div>
                  <div className="flex-between flex justify-between mt-2">
                    <div>
                      <div>(NAME AND ADDRESS OF THE FINANCIER)</div>
                      <div>BY REGISTERED POST TO DEALER UNDER PROPER ACKNOWLEDGEMENT.</div>
                    </div>
                    <div className="text-center">
                      <div>REGISTERING AUTHORITY</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4 no-print">
                <button onClick={() => setCurrentPage(1)} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium">
                  ← PREVIOUS PAGE
                </button>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handlePrint(true)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
                    📄 PRINT EMPTY
                  </button>
                  <button onClick={() => handlePrint(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    🖨️ PRINT FILLED
                  </button>
                  <button onClick={() => handlePrint(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                    📥 DOWNLOAD PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Form20
