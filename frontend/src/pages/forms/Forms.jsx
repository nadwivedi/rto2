import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Form46Modal from './components/Form46Modal'
import Form20Modal from './components/Form20Modal'

const Forms = () => {
  const [isForm46Open, setIsForm46Open] = useState(false)
  const [isForm20Open, setIsForm20Open] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const forms = [
    {
      id: 'form-20',
      name: 'Form 20',
      description: 'Form of Application for Registration of a Motor Vehicle',
      icon: '📋',
      isModal: true,
      category: 'Registration'
    },
    {
      id: 'form-46',
      name: 'Form 46',
      description: 'Application for grant of authorisation tourist Permit or National Permit',
      icon: '🚗',
      isModal: true,
      category: 'Permit'
    }
  ]

  const handleFormClick = (form) => {
    if (form.isModal) {
      if (form.id === 'form-46') {
        setIsForm46Open(true)
      } else if (form.id === 'form-20') {
        setIsForm20Open(true)
      }
    }
  }

  const handleDirectPrint = (formId, e) => {
    e.stopPropagation() // Prevent card click

    // Create a temporary element with the form content
    const printWindow = window.open('', '_blank')

    if (formId === 'form-20') {
      printWindow.document.write(`
        <html>
          <head>
            <title>FORM 20 - Motor Vehicle Registration</title>
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
              @media print {
                body { padding: 10mm; margin: 0; }
                @page {
                  margin: 0;
                  size: A4;
                }
              }
            </style>
          </head>
          <body>
            <div class="form-container">
              <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="font-size: 18px; font-weight: bold; letter-spacing: 4px;">FORM - 20</h1>
                <p style="font-size: 11px; margin-top: 3px;">(See Rule 47)</p>
                <h2 style="font-size: 13px; font-weight: bold; margin-top: 5px;">Form of Application for Registration of a Motor Vehicle</h2>
              </div>
              <div style="margin-bottom: 12px;">
                <p>To,</p>
                <p style="margin-left: 24px;">The Registering Authority Raipur</p>
              </div>
              ${generateForm20Fields()}
            </div>
          </body>
        </html>
      `)
    } else if (formId === 'form-46') {
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
              table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin: 15px 0; }
              th, td { border: 2px solid #000; padding: 8px; text-align: center; }
              @media print {
                body { padding: 10mm; margin: 0; }
                @page {
                  margin: 0;
                  size: A4;
                }
              }
            </style>
          </head>
          <body>
            <div class="form-container">
              <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="font-size: 18px; font-weight: bold; letter-spacing: 4px;">FORM 46</h1>
                <p style="font-size: 11px; margin-top: 3px;">See Rule (83) (1) and 87 (1)</p>
                <h2 style="font-size: 13px; font-weight: bold; margin-top: 5px;">Form of application for grant of authorisation</h2>
                <h2 style="font-size: 13px; font-weight: bold;">tourist Permit or National Permit</h2>
              </div>
              ${generateForm46Fields()}
            </div>
          </body>
        </html>
      `)
    }

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const generateForm20Fields = () => {
    return `
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">1.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Full name of person to be registered as registered owner</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">son / wife / daughter of</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">2.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Age of the person to be registered as Registered owner (Proof of age to be attached)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">3.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Permanent address of the person to be registered as registered owner (Evidence to be produced)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">4.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Temporary address of the person to be registered as registered owner</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">5.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Name & address of the Dealer or Manufacturer from whoms the vehicle was Purchased</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">6.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">If ex-army vehicle or imported vehicle enclosed proof</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">7.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Class of vehicle (if motor cycle, Whether with or without gear)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">8.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">The motor vehicle is</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">a) A new vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">b) Ex - Army vehicle :</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">c) Imported vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">9.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Type of body</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">10.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Type of vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">11.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Maker's Name</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">12.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Month and year of manufacturer</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">13.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Number of cylinders</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">14.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Horse Power</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">15.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Cubic capacity</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">16.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Maker's classification or if not known wheel base</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">17.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Chassis Number (Affix pencil print)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">18.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Engine Number</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">19.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Seating Capacity (including driver)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">20.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Fuel used in the engine</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">21.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Unloaded weight</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">22.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Particular of previous registration and registered number (if any)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">23.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Colour or colours of body wings and front end</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <p style="font-size: 10px; font-style: italic; margin-left: 30px; margin-bottom: 8px;">I hereby declare that the vehicle has not been registered in any state in india</p>
      <p style="font-size: 10px; font-style: italic; margin-left: 30px; margin-bottom: 8px;">Additional particulars to be completed only in the case of transport vehicle other than motor car</p>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">24.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Number description and size of tyres</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(a) Front axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(b) Rear axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(c) Any other axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(d) Tandem axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">25.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Gross weight of vehicle</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">a) As certified by the Manufacture</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
        <span style="margin-left: 8px;">Kgms</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">b) To be registered</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
        <span style="margin-left: 8px;">Kgms</span>
      </div>
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: end;">
          <div style="display: flex; align-items: baseline;">
            <span>Date</span>
            <div style="border-bottom: 2px solid #000; margin-left: 16px; width: 150px; min-height: 16px;"></div>
          </div>
          <div style="text-align: center;">
            <div>Signature of the person to be registered</div>
            <div>as registered owner</div>
          </div>
        </div>
      </div>
    `
  }

  const generateForm46Fields = () => {
    return `
      <div style="margin-bottom: 15px;">
        <p>To,</p>
        <div style="display: flex; margin-top: 4px;">
          <span style="width: 48px; flex-shrink: 0;"></span>
          <div style="flex: 1;">
            <p style="margin-bottom: 4px;">The Regional / State Transport Authority</p>
            <div style="border-bottom: 2px solid #000; min-height: 16px; width: 252px;"></div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 15px; line-height: 1.6;">
        <p>I/We the undersigned hereby by apply for grant of authorisation valid throughout the territory</p>
        <div style="display: flex; align-items: baseline; margin-top: 4px;">
          <span>of India/ in the state of</span>
          <div style="flex: 1; border-bottom: 2px solid #000; margin-left: 8px; min-height: 16px;"></div>
        </div>
      </div>
      <p style="text-align: center; font-weight: bold; margin-bottom: 12px;">(Specify the name of the State)</p>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">1.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Name of the applicants in full</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">2.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Son/ Wife/ Daughter of</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">3.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Address</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">4.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>Registration mark & year of manufacture</div>
          <div>& date of registration of the motor vehicle</div>
        </div>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">5.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Engine number of the motor vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">6.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Chassis number of the motor vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">7.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>Permit number of the authority who has</div>
          <div>issued the permit and date of issue and</div>
          <div>date of expiry of the permit</div>
        </div>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">8.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Unladen weight of the motor vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">9.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>Gross vehicle weight of the motor</div>
          <div>vehicle</div>
        </div>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">10.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>Pay load of the motor vehicle seating</div>
          <div>capacity in the case of tourist vehicle</div>
        </div>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">11.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>Period for which the authorisation </div>
          <div>is sought from</div>
        </div>
        <div style="flex: 1; display: flex; align-items: baseline; gap: 10px;">
          <span>From</span>
          <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
          <span>To</span>
          <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
        </div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">12.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>I/We enclosed the certificate of</div>
          <div>registration & permit of the vehicle</div>
        </div>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">13.</span>
        <div style="width: 280px; flex-shrink: 0; margin-right: 10px;">
          <div>I/We enclosed Bank draft as</div>
          <div>manufactured hereunder toward payment</div>
          <div>of the authorisation.</div>
        </div>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 16px;"></div>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; margin: 15px 0;">
        <thead>
          <tr>
            <th style="border: 2px solid #000; padding: 8px; text-align: center; width: 60px; font-size: 11px; font-weight: bold;">S.No.<br/>1</th>
            <th style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">Name of the State<br/>2</th>
            <th style="border: 2px solid #000; padding: 8px; text-align: center; width: 120px; font-size: 11px; font-weight: bold;">Amount Paid<br/>3</th>
            <th style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">Particulars of Bank<br/>Draft & Date</th>
            <th style="border: 2px solid #000; padding: 8px; text-align: center; width: 120px; font-size: 11px; font-weight: bold;">Date of<br/>Payment<br/>5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 11px;">1</td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
          </tr>
          <tr>
            <td style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 11px;">2</td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
          </tr>
          <tr>
            <td style="border: 2px solid #000; padding: 8px; text-align: center; font-size: 11px;">3</td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
            <td style="border: 2px solid #000; padding: 8px; font-size: 11px;"></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: end;">
          <div style="display: flex; align-items: baseline;">
            <span>Date</span>
            <div style="border-bottom: 2px solid #000; margin-left: 16px; width: 150px; min-height: 16px;"></div>
          </div>
          <div style="text-align: center;">
            <div style="border-bottom: 2px solid #000; margin-bottom: 4px; width: 200px; height: 40px;"></div>
            <p style="font-size: 11px; font-weight: bold;">Signature of thumb impression</p>
            <p style="font-size: 11px; font-weight: bold;">of the applicant</p>
          </div>
        </div>
        <p style="font-size: 10px; font-style: italic; margin-top: 16px;">Strike out whichever is inapplicable</p>
      </div>
    `
  }

  // Filter forms based on search query
  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-16 lg:pt-20 px-4 pb-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8 mt-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search forms by name, description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600 px-1">
            {searchQuery ? (
              <span>Found {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''}</span>
            ) : (
              <span>Showing all {forms.length} forms</span>
            )}
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              form.isModal ? (
                <div
                  key={form.id}
                  onClick={() => handleFormClick(form)}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {form.icon}
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {form.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {form.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {form.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-indigo-600 text-sm font-semibold group-hover:underline">
                      Click to Edit →
                    </span>
                    <button
                      onClick={(e) => handleDirectPrint(form.id, e)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                      title="Print Empty Form"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={form.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:scale-105 hover:-translate-y-1"
                >
                  <Link to={form.path}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                        {form.icon}
                      </div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                        {form.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {form.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {form.description}
                    </p>
                  </Link>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link to={form.path}>
                      <span className="text-indigo-600 text-sm font-semibold group-hover:underline">
                        Click to Edit →
                      </span>
                    </Link>
                    <button
                      onClick={(e) => handleDirectPrint(form.id, e)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                      title="Print Empty Form"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No forms found</h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        )}
      </div>

      {/* Form 20 Modal */}
      {isForm20Open && (
        <Form20Modal onClose={() => setIsForm20Open(false)} />
      )}

      {/* Form 46 Modal */}
      {isForm46Open && (
        <Form46Modal onClose={() => setIsForm46Open(false)} />
      )}
    </div>
  )
}

export default Forms
