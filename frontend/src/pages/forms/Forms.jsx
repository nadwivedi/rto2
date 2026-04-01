import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Form46Modal from './components/Form46Modal'
import Form20Modal from './components/Form20Modal'
import Form44Modal from './components/Form44Modal'
import Form45Modal from './components/Form45Modal'
import Form48Modal from './components/Form48Modal'
import SapathPatraModal from './components/SapathPatraModal'
import KaryalayFormModal from './components/KaryalayFormModal'
import KaryalayForm2Modal from './components/KaryalayForm2Modal'

const Forms = () => {
  const [isForm46Open, setIsForm46Open] = useState(false)
  const [isForm20Open, setIsForm20Open] = useState(false)
  const [isForm44Open, setIsForm44Open] = useState(false)
  const [isForm45Open, setIsForm45Open] = useState(false)
  const [isForm48Open, setIsForm48Open] = useState(false)
  const [isSapathPatraOpen, setIsSapathPatraOpen] = useState(false)
  const [isKaryalayFormOpen, setIsKaryalayFormOpen] = useState(false)
  const [isKaryalayForm2Open, setIsKaryalayForm2Open] = useState(false)
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
      id: 'form-44',
      name: 'Form 44',
      description: 'Application for Grant of Goods Carriage Permits (M.P.M.V.R.-44)',
      icon: '🚛',
      isModal: true,
      category: 'Permit'
    },
    {
      id: 'form-45',
      name: 'Form 45',
      description: 'Application in Respect of a Temporary Permit (M.P.M.V.R.-45)',
      icon: '🎫',
      isModal: true,
      category: 'Permit'
    },
    {
      id: 'form-46',
      name: 'Form 46',
      description: 'Application for grant of authorisation tourist Permit or National Permit',
      icon: '🚗',
      isModal: true,
      category: 'Permit'
    },
    {
      id: 'form-48',
      name: 'Form 48',
      description: 'Application for the Grant of National Permit',
      icon: '🚚',
      isModal: true,
      category: 'Permit'
    },
    {
      id: 'sapath-patra',
      name: 'Sapath Patra (शपथ-पत्र)',
      description: 'Affidavit Form for RTO - Notary District Civil Office',
      icon: '📜',
      isModal: true,
      category: 'Affidavit'
    },
    {
      id: 'karyalay-form',
      name: 'Karyalay Form (कार्यालय फॉर्म)',
      description: 'Office Secretary Form - Regional Transport Authority Division, Raipur (C.G.)',
      icon: '📋',
      isModal: true,
      category: 'Office'
    },
    {
      id: 'karyalay-form-2',
      name: 'Karyalay Form 2 (कार्यालय फॉर्म 2)',
      description: 'Office Secretary Form - National Permit Authorization Certificate',
      icon: '📝',
      isModal: true,
      category: 'Office'
    }
  ]

  const handleFormClick = (form) => {
    if (form.isModal) {
      if (form.id === 'form-46') {
        setIsForm46Open(true)
      } else if (form.id === 'form-20') {
        setIsForm20Open(true)
      } else if (form.id === 'form-44') {
        setIsForm44Open(true)
      } else if (form.id === 'form-45') {
        setIsForm45Open(true)
      } else if (form.id === 'form-48') {
        setIsForm48Open(true)
      } else if (form.id === 'sapath-patra') {
        setIsSapathPatraOpen(true)
      } else if (form.id === 'karyalay-form') {
        setIsKaryalayFormOpen(true)
      } else if (form.id === 'karyalay-form-2') {
        setIsKaryalayForm2Open(true)
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
    } else if (formId === 'form-44') {
      printWindow.document.write(`
        <html>
          <head>
            <title>FORM M.P.M.V.R.-44 (GCPA) - Goods Carriage Permits</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Times New Roman', Times, serif; font-size: 13px; line-height: 1.5; padding: 20px; font-weight: 600; color: #000; }
              .form-container { width: 100%; max-width: 800px; margin: 0 auto; }
              input {
                border: none !important;
                background: transparent;
                outline: none;
                width: 100%;
                font-family: 'Times New Roman', Times, serif;
                font-size: 13px;
                padding: 0 2px;
                font-weight: 600;
                color: #000;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
              }
              th, td {
                border: 1.5px solid #000;
                padding: 6px;
                text-align: center;
              }
              th {
                font-weight: bold;
                font-size: 12px;
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
                <h1 style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">FORM M.P.M.V.R.- 44 (GCPA)</h1>
                <p style="font-size: 11px; margin-top: 3px;">[See Rule 72 (1), (C)]</p>
                <h2 style="font-size: 13px; font-weight: bold; margin-top: 8px;">An application in respect of Grant of goods Carriage permits</h2>
              </div>
              ${generateForm44Fields()}
            </div>
          </body>
        </html>
      `)
    } else if (formId === 'form-45') {
      printWindow.document.write(`
        <html>
          <head>
            <title>FORM M.P.M.V.R.-45 (T.P.A.) - Temporary Permit Application</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Times New Roman', Times, serif; font-size: 13px; line-height: 1.5; padding: 20px; font-weight: 600; color: #000; }
              .form-container { width: 100%; max-width: 800px; margin: 0 auto; }
              input {
                border: none !important;
                background: transparent;
                outline: none;
                width: 100%;
                font-family: 'Times New Roman', Times, serif;
                font-size: 13px;
                padding: 0 2px;
                font-weight: 600;
                color: #000;
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
                <h1 style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">FORM M.P.M.V.R.-45 (T.P.A.)</h1>
                <p style="font-size: 11px; margin-top: 3px;">(See Rule 72 (1) (D)</p>
                <h2 style="font-size: 13px; font-weight: bold; margin-top: 8px;">APPLICATION IN RESPECT OF A TEMPORARY PERMIT</h2>
              </div>
              ${generateForm45Fields()}
            </div>
          </body>
        </html>
      `)
    } else if (formId === 'form-48') {
      printWindow.document.write(`
        <html>
          <head>
            <title>FORM 48 - Application for National Permit</title>
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
                <h1 style="font-size: 18px; font-weight: bold; letter-spacing: 4px;">FORM 48</h1>
                <p style="font-size: 11px; margin-top: 3px;">[Refer Rule 86]</p>
                <h2 style="font-size: 13px; font-weight: bold; margin-top: 5px;">APPLICATION FOR THE GRANT OF NATIONAL PERMIT</h2>
              </div>
              ${generateForm48Fields()}
            </div>
          </body>
        </html>
      `)
    } else if (formId === 'sapath-patra') {
      printWindow.document.write(`
        <html>
          <head>
            <title>शपथ-पत्र (Sapath Patra)</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif; font-size: 14px; line-height: 1.6; padding: 20px; }
              .form-container { width: 100%; max-width: 800px; margin: 0 auto; }
              input {
                border: none !important;
                background: transparent;
                outline: none;
                width: 100%;
                font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif;
                font-size: 14px;
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
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
          </head>
          <body>
            <div class="form-container">
              <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">शपथ–पत्र</h1>
                <p style="font-size: 14px; margin-top: 5px;">समक्ष नोटरी जिला सिविल कार्यालय</p>
                <p style="font-size: 13px; margin-top: 2px;">(आर.टी.ओ. कार्यालय में पेश करने हेतु)</p>
              </div>
              ${generateSapathPatraFields()}
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
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">son / wife / daughter of</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">2.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Age of the person to be registered as Registered owner (Proof of age to be attached)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">3.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Permanent address of the person to be registered as registered owner (Evidence to be produced)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">4.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Temporary address of the person to be registered as registered owner</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">5.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Name & address of the Dealer or Manufacturer from whoms the vehicle was Purchased</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">6.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">If ex-army vehicle or imported vehicle enclosed proof</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">7.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Class of vehicle (if motor cycle, Whether with or without gear)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">8.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">The motor vehicle is</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">a) A new vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">b) Ex - Army vehicle :</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">c) Imported vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">9.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Type of body</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">10.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Type of vehicle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">11.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Maker's Name</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">12.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Month and year of manufacturer</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">13.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Number of cylinders</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">14.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Horse Power</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">15.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Cubic capacity</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">16.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Maker's classification or if not known wheel base</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">17.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Chassis Number (Affix pencil print)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">18.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Engine Number</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">19.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Seating Capacity (including driver)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">20.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Fuel used in the engine</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">21.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Unloaded weight</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">22.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Particular of previous registration and registered number (if any)</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">23.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Colour or colours of body wings and front end</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <p style="font-size: 10px; font-style: italic; margin-left: 30px; margin-bottom: 8px;">I hereby declare that the vehicle has not been registered in any state in india</p>
      <p style="font-size: 10px; font-style: italic; margin-left: 30px; margin-bottom: 8px;">Additional particulars to be completed only in the case of transport vehicle other than motor car</p>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">24.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Number description and size of tyres</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(a) Front axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(b) Rear axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(c) Any other axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">(d) Tandem axle</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">25.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Gross weight of vehicle</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">a) As certified by the Manufacture</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
        <span style="margin-left: 8px;">Kgms</span>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">b) To be registered</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
        <span style="margin-left: 8px;">Kgms</span>
      </div>
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: end;">
          <div style="display: flex; align-items: baseline;">
            <span>Date</span>
            <div style="border-bottom: 2px solid #000; margin-left: 16px; width: 150px; min-height: 13px;"></div>
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
            <div style="border-bottom: 2px solid #000; min-height: 13px; width: 252px;"></div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 15px; line-height: 1.6;">
        <p>I/We the undersigned hereby by apply for grant of authorisation valid throughout the territory</p>
        <div style="display: flex; align-items: baseline; margin-top: 4px;">
          <span>of India/ in the state of</span>
          <div style="flex: 1; border-bottom: 2px solid #000; margin-left: 8px; min-height: 13px;"></div>
        </div>
      </div>
      <p style="text-align: center; font-weight: bold; margin-bottom: 12px;">(Specify the name of the State)</p>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">1.</span>
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Name of the applicants in full</span>
        <div style="flex: 1; border-bottom: 2px solid #000; min-height: 13px;"></div>
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

  const generateForm48Fields = () => {
    return `
      <div style="margin-bottom: 15px;">
        <p>To</p>
        <div style="display: flex; margin-top: 4px; margin-left: 48px;">
          <div style="flex: 1;">
            <p style="margin-bottom: 4px;">The Regional/State Transport Authority,</p>
            <div style="border-bottom: 2px dotted #000; min-height: 16px; width: 100%;"></div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 15px; line-height: 1.6;">
        <p>I/We the undersigned hereby apply for the grant of national permit valid</p>
        <div style="display: flex; align-items: baseline; margin-top: 4px;">
          <span>throughout the territory of India/in the State of</span>
          <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 16px;"></div>
        </div>
        <p style="font-size: 10px; font-style: italic; margin-top: 2px;">(here write the names of the States desired)</p>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">1.</span>
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">Name of the applicant(s) in full</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">2.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>Status of the applicant, whether individual, company</div>
          <div>or partnership firm, cooperative society, etc.</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">3.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>Name of father or husband (in case of individual and in</div>
          <div>case of company or firm the particulars of managing partner</div>
          <div>or managing director, as the case may be)</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">4.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>Full address (to be supported by attested copy of ration</div>
          <div>card, electricity bill, etc. in case of individual or any other</div>
          <div>valid documentary proof to the satisfaction of the State Trans-</div>
          <div>port Authority/Regional Transport Authority and in case of</div>
          <div>company or firm, the certified copy of the Memorandum of</div>
          <div>Association or copy of the deed of partnership, as the case</div>
          <div>may be)</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">5.</span>
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">(a) Whether the applicant himself intends to drive the vehicle ?</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>(b) (i) If so, whether the applicant holds heavy</div>
          <div style="margin-left: 48px;">passenger motor vehicle driving licence</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>(ii) The number, date and validity period of driving</div>
          <div style="margin-left: 48px;">licence</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline; margin-left: 30px;">
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">(iii) Name and address of the licensing authority</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">6.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>Registration certificate along with the date of first registration,</div>
          <div>insurance certificate number</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">7.</span>
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">Details of other permits if held in respect of a particular vehicle</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">8.</span>
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">Details of number of national permits held by the applicant</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">9.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>Type of vehicle, whether two-axle truck or articulated vehicle</div>
          <div>or multi-axle vehicle or tractor-trailer combination</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">10.</span>
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">Make of motor vehicle</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">11.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>Particulars of convictions/suspensions/cancellation, if any,</div>
          <div>during the past three years in respect of the vehicle/permit</div>
          <div>held by the applicant(s)</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">12.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>I/We forward herewith the certificate of registration of the</div>
          <div>vehicle or I/We will produce the certificate of registration</div>
          <div>of the vehicle before the permits are issued</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">13.</span>
        <div style="width: 360px; flex-shrink: 0; margin-right: 10px;">
          <div>I/We hereby declare that the above statements are true and that</div>
          <div>I/We am/are the resident(s) of this State having principal place</div>
          <div>of business in this State at</div>
        </div>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: baseline;">
        <span style="width: 30px; flex-shrink: 0;">14.</span>
        <span style="width: 360px; flex-shrink: 0; margin-right: 10px;">I/We have paid the fee of Rs.</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; min-height: 16px;"></div>
      </div>
      <div style="border-bottom: 2px dotted #000; margin: 15px 0;"></div>
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: end;">
          <div style="display: flex; align-items: baseline;">
            <span>Date</span>
            <div style="border-bottom: 2px dotted #000; margin-left: 16px; width: 150px; min-height: 16px;"></div>
          </div>
          <div style="text-align: center;">
            <div style="border-bottom: 2px dotted #000; margin-bottom: 4px; width: 250px; height: 40px;"></div>
            <p style="font-size: 11px; font-weight: normal;">Signature or thumb impression of the applicant</p>
          </div>
        </div>
      </div>
    `
  }

  const generateForm44Fields = () => {
    return `
      <div style="margin-bottom: 10px;">
        <p>To,</p>
        <p style="margin-left: 24px; margin-top: 4px;">The Regional Transport Authority</p>
        <div style="border-bottom: 1.5px solid #000; width: 280px; min-height: 16px; margin-left: 24px; margin-top: 4px;"></div>
      </div>
      <div style="margin-bottom: 8px; text-align: justify;">
        <p>In accordance with the provisions of Section 69,77,78,79 and 80 of the Motor Vehicles Act. 1998 of the undersigned hereby apply for a goods carriers permits under section 66 of the M.V. Act. as here under set out of</p>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">1.</span>
        <span style="width: 220px; flex-shrink: 0; margin-right: 10px;">Full name of the Applicant Company</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; justify-content: flex-end;">
        <span style="margin-right: 10px;">Age</span>
        <div style="width: 100px; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">2.</span>
        <span style="width: 220px; flex-shrink: 0; margin-right: 10px;">(Name) (Father's / Husband's Name)</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">3.</span>
        <span style="width: 180px; flex-shrink: 0; margin-right: 10px;">Full Address H.No. / Road /Lane</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="margin-left: 30px; margin-bottom: 8px;">
        <div style="border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 200px; flex-shrink: 0; margin-right: 10px;">Name of locality/ City/ Form/ Pin Code</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="margin-left: 30px; margin-bottom: 8px;">
        <div style="border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">4.</span>
        <span style="width: 260px; flex-shrink: 0; margin-right: 10px;">Route or Area for which the permit is desied</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 10px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">5.</span>
        <span style="width: 260px; flex-shrink: 0; margin-right: 10px;">The nature of goods proposut to be carried</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
          <span style="width: 30px; flex-shrink: 0;">6.</span>
          <p style="flex: 1;">Type and capacity of vehcile (including trailer alternative trailers of articulated vehicle)</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 8px 0;">
          <thead>
            <tr>
              <th style="border: 1.5px solid #000; padding: 6px; text-align: center; width: 18%;">Registration<br/>Marks</th>
              <th style="border: 1.5px solid #000; padding: 6px; text-align: center; width: 18%;">Make Type<br/>and No of<br/>vehicle</th>
              <th style="border: 1.5px solid #000; padding: 6px; text-align: center; width: 16%;">Load<br/>Capacity</th>
              <th style="border: 1.5px solid #000; padding: 6px; text-align: center; width: 16%;">Laden<br/>weight<br/>kg.</th>
              <th style="border: 1.5px solid #000; padding: 6px; text-align: center; width: 16%;">Overrail<br/>length</th>
              <th style="border: 1.5px solid #000; padding: 6px; text-align: center; width: 16%;">Width</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1.5px solid #000; padding: 6px; height: 40px;"></td>
              <td style="border: 1.5px solid #000; padding: 6px;"></td>
              <td style="border: 1.5px solid #000; padding: 6px;"></td>
              <td style="border: 1.5px solid #000; padding: 6px;"></td>
              <td style="border: 1.5px solid #000; padding: 6px;"></td>
              <td style="border: 1.5px solid #000; padding: 6px;"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="display: flex; align-items: flex-start;">
          <span style="width: 30px; flex-shrink: 0;">7.</span>
          <div style="flex: 1;">
            <p style="text-align: justify;">I have not yet obtained possession on the vehicle and I understand that the permit will not be issued until have done. I have produced the certificate of registration and further declare that I proposet out cases vehicle manufactured in the year</p>
            <div style="border-bottom: 1.5px solid #000; min-height: 16px; margin-top: 4px; width: 150px;"></div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="display: flex; align-items: flex-start;">
          <span style="width: 30px; flex-shrink: 0;">8.</span>
          <div style="flex: 1;">
            <p style="margin-bottom: 4px;">Particulars of any goods carriage permit valid in any State and hold by the applicant which has been the subject of any order of suspension or cancellation</p>
            <div style="border-bottom: 1.5px solid #000; min-height: 16px;"></div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <div style="display: flex; align-items: flex-start;">
          <span style="width: 30px; flex-shrink: 0;">9.</span>
          <p style="flex: 1; text-align: justify;">I forward herewith the certificate of registration of the vehicle or I will produce the certificate of registration of the vehicle before permit issued.</p>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">Date</span>
          <div style="border-bottom: 1.5px solid #000; width: 150px; min-height: 16px;"></div>
        </div>
        <div style="text-align: center;">
          <div style="border-bottom: 1.5px solid #000; width: 250px; height: 40px; margin-bottom: 4px;"></div>
          <p style="font-size: 11px;">Signature/thumb impression of the</p>
          <p style="font-size: 11px;">Applicant</p>
        </div>
      </div>
    `
  }

  const generateForm45Fields = () => {
    return `
      <div style="margin-bottom: 12px;">
        <p>To,</p>
        <div style="margin-left: 24px; margin-top: 4px;">
          <p style="margin-bottom: 4px;">The Regional /State Transport Authority</p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="border-bottom: 1.5px solid #000; width: 286px; min-height: 16px;"></div>
            <span>(C.G.)</span>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 12px; text-align: justify;">
        <p>In accordance with the provision of Section 69 and 87 of the Motor Vehicle Act. 1988 the undersigned hereby apply for a temporary permit under section 87 of the Act. as hereunder Setour.</p>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">1.</span>
        <span style="width: 80px; flex-shrink: 0; margin-right: 10px;">Full Name</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 260px; flex-shrink: 0; margin-right: 10px;">(Surname) Name Father's / Husband's Name</span>
        <div style="width: 320px; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">2.</span>
        <span style="width: 80px; flex-shrink: 0; margin-right: 10px;">Age</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">3.</span>
        <span style="width: 120px; flex-shrink: 0; margin-right: 10px;">Full Address H.No.</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 80px; flex-shrink: 0; margin-right: 10px;">Road Lane</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
        <span style="margin-left: 10px; width: 120px; flex-shrink: 0; margin-right: 10px;">Name of the Locilty</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 80px; flex-shrink: 0; margin-right: 10px;">City / Town</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">4.</span>
        <span style="width: 220px; flex-shrink: 0; margin-right: 10px;">Purpose for which permit is required</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">5.</span>
        <span style="width: 180px; flex-shrink: 0; margin-right: 10px;">Route or reputes or area</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">6.</span>
        <span style="width: 320px; flex-shrink: 0; margin-right: 10px;">Period duration of permit from (both day inclusive)</span>
        <div style="width: 280px; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 40px; flex-shrink: 0; margin-right: 10px;">To</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 100px; flex-shrink: 0; margin-right: 10px;">(Laden weight)</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">7.</span>
        <span style="width: 180px; flex-shrink: 0; margin-right: 10px;">Type and Seating capacity</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center; margin-left: 30px;">
        <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">of the vehicle for which the permit is required</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">8.</span>
        <span style="width: 200px; flex-shrink: 0; margin-right: 10px;">Registration mark of the vehicle</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="display: flex; align-items: flex-start;">
          <span style="width: 30px; flex-shrink: 0;">9.</span>
          <p style="flex: 1;">I hereby declare that the above Statement are true and agree that they shall be condition of any permit issued to me.</p>
        </div>
      </div>
      <div style="display: flex; margin-bottom: 8px; align-items: center;">
        <span style="width: 30px; flex-shrink: 0;">10.</span>
        <span style="width: 140px; flex-shrink: 0; margin-right: 10px;">I deposted fee Rs.</span>
        <div style="width: 200px; border-bottom: 1.5px solid #000; min-height: 16px; margin-right: 10px;"></div>
        <span style="width: 60px; flex-shrink: 0; margin-right: 10px;">R.No.</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; margin-bottom: 12px; align-items: center; margin-left: 30px;">
        <span style="width: 80px; flex-shrink: 0; margin-right: 10px;">Book No.</span>
        <div style="width: 200px; border-bottom: 1.5px solid #000; min-height: 16px; margin-right: 20px;"></div>
        <span style="width: 60px; flex-shrink: 0; margin-right: 10px;">dated</span>
        <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; margin-left: 30px;">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">Date</span>
          <div style="border-bottom: 1.5px solid #000; width: 150px; min-height: 16px;"></div>
        </div>
        <div style="text-align: center;">
          <div style="border-bottom: 1.5px solid #000; width: 250px; height: 40px; margin-bottom: 4px;"></div>
          <p style="font-size: 11px;">Signature thumb impression of the</p>
          <p style="font-size: 11px;">Applicant</p>
        </div>
      </div>
      <div style="border-top: 2px solid #000; margin: 20px 0;"></div>
      <div style="margin-top: 15px;">
        <p style="font-weight: bold; margin-bottom: 10px;">(To be filled in the office of the transport Authority)</p>
        <div style="display: flex; margin-bottom: 8px; align-items: center;">
          <span style="width: 30px; flex-shrink: 0;">1.</span>
          <span style="width: 120px; flex-shrink: 0; margin-right: 10px;">Date of receipt</span>
          <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: center;">
          <span style="width: 30px; flex-shrink: 0;">2.</span>
          <span style="width: 140px; flex-shrink: 0; margin-right: 10px;">Amount of Rupees</span>
          <div style="width: 100px; border-bottom: 1.5px solid #000; min-height: 16px; margin-right: 10px;"></div>
          <span style="margin-right: 10px;">received vide receipt number</span>
          <div style="width: 100px; border-bottom: 1.5px solid #000; min-height: 16px; margin-right: 10px;"></div>
          <span style="margin-right: 10px;">dated</span>
          <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
          <span style="margin-left: 10px;">202</span>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: center;">
          <span style="width: 30px; flex-shrink: 0;">3.</span>
          <span style="width: 240px; flex-shrink: 0; margin-right: 10px;">Granted/ Granted in modified from rejected on</span>
          <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
        </div>
        <div style="display: flex; margin-bottom: 8px; align-items: center;">
          <span style="width: 30px; flex-shrink: 0;">4.</span>
          <span style="width: 160px; flex-shrink: 0; margin-right: 10px;">Permit number issued</span>
          <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
        </div>
        <div style="display: flex; margin-bottom: 12px; align-items: center;">
          <span style="width: 30px; flex-shrink: 0;">5.</span>
          <span style="width: 280px; flex-shrink: 0; margin-right: 10px;">Registration mark of vehicle if intimated after issued</span>
          <div style="flex: 1; border-bottom: 1.5px solid #000; min-height: 16px;"></div>
        </div>
        <div style="text-align: right; margin-top: 10px;">
          <div style="border-bottom: 1.5px solid #000; width: 250px; height: 40px; margin-left: auto; margin-bottom: 4px;"></div>
          <p style="font-size: 12px;">Secretary</p>
          <p style="font-size: 12px; margin-top: 4px;">Transport Authority</p>
          <p style="font-size: 12px; margin-top: 4px;">(C.G.)</p>
        </div>
      </div>
    `
  }

  const generateSapathPatraFields = () => {
    return `
      <div style="margin-bottom: 12px; display: flex; align-items: baseline;">
        <span>मैं</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
        <span style="margin-left: 8px;">पिता/पति</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
      </div>
      <div style="margin-bottom: 12px; display: flex; align-items: baseline;">
        <span>उम्र</span>
        <div style="width: 100px; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
        <span style="margin-left: 8px;">वर्ष, निवासी</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
        <span style="margin-left: 8px;">तहसील</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
      </div>
      <div style="margin-bottom: 12px; display: flex; align-items: baseline;">
        <span>जिला</span>
        <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
        <span style="margin-left: 8px;">का रहने वाला हूं, जो कि निम्नलिखित कथन पूर्वक कहता हूं –</span>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">1.</span>
        <div style="flex: 1;">
          <div style="display: flex; align-items: baseline; flex-wrap: wrap;">
            <span>यह है कि मैं वाहन क्रमांक</span>
            <div style="flex: 1 1 200px; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
            <span style="margin-left: 8px;">का पंजीकृत स्वामी हूं, जिसका</span>
          </div>
          <div style="display: flex; align-items: baseline; margin-top: 4px;">
            <span>चेसिस नंबर</span>
            <div style="flex: 1 1 200px; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
            <span style="margin-left: 8px;">इंजन नंबर</span>
            <div style="flex: 1 1 200px; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
          </div>
          <div style="display: flex; align-items: baseline; margin-top: 4px;">
            <span>मॉडल नं.</span>
            <div style="flex: 1 1 200px; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
            <span style="margin-left: 8px;">है। जिसका मार्क कर</span>
            <div style="flex: 1 1 150px; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
            <span style="margin-left: 8px;">तक जमा है।</span>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">2.</span>
        <div style="flex: 1;">
          <span>यह है कि मैं वाहन क्रमांक</span>
          <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 200px; margin-left: 8px;"></div>
          <span style="margin-left: 8px;">जो कि</span>
          <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 350px; margin-left: 8px;"></div>
          <div style="margin-top: 4px;">
            <span>पिता/पति श्री</span>
            <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 500px; margin-left: 8px;"></div>
          </div>
          <div style="margin-top: 4px;">
            <span>निवासी</span>
            <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 550px; margin-left: 8px;"></div>
            <span style="margin-left: 8px;">तहसील</span>
            <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 200px; margin-left: 8px;"></div>
          </div>
          <div style="margin-top: 4px;">
            <span>जिला</span>
            <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 200px; margin-left: 8px;"></div>
            <span style="margin-left: 8px;">को बिक्री कर दिया हूं। जिसका रकम प्राप्त हो गया है।</span>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">3.</span>
        <div style="flex: 1;">
          <span>यह है कि वाहन क्रमांक</span>
          <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 200px; margin-left: 8px;"></div>
          <span style="margin-left: 8px;">को श्री</span>
          <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 200px; margin-left: 8px;"></div>
          <div style="margin-top: 4px;">
            <span>पिता</span>
            <div style="border-bottom: 2px dotted #000; min-height: 20px; display: inline-block; min-width: 550px; margin-left: 8px;"></div>
            <span style="margin-left: 8px;">के नाम से स्वामित्व अन्तरण किया जाता है तो उसमें</span>
          </div>
          <div style="margin-top: 4px;">मुझे एवं वारिसों को कोई आपत्ति नहीं है।</div>
        </div>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">4.</span>
        <span>यह है कि बिक्री पत्र फार्म नं. 29 एवं 30 में रजिस्टर्ड ओनर द्वारा मेरे समक्ष हस्ताक्षर किया है।</span>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">5.</span>
        <span>यह है कि मैंने बिकेता रजिस्टर्ड ओनर को वाहन का बिक्रय मूल्य पूरी तौर से भुगतान कर दिया है।</span>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">6.</span>
        <span>यह है कि उक्त वाहन के बिक्रय में किसी भी भी प्रकार का विवाद नहीं है।</span>
      </div>
      <div style="margin-bottom: 10px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">7.</span>
        <span>यह है कि उक्त वाहन के बिक्री राशि संबंधी, स्वामित्व अन्तरण संबंधी या अन्य किसी बाबत कोई विवाद होता है तो उसकी पूरी जवाबदारी व्यक्तिगत रूप से बिकेता एवं हम दोनों की होगी।</span>
      </div>
      <div style="margin-bottom: 15px; display: flex; align-items: flex-start;">
        <span style="margin-right: 8px;">8.</span>
        <div style="flex: 1;">
          <span>यह है कि उक्त वर्णित वाहन का कब्जा बिकेता द्वारा क्रेता को चाबी एवं दस्तावेज की मूल प्रति आज दिनांक को दे दिया गया है। उक्त वाहन के संबंध में आज से पूर्व हुई किसी भी प्रकार के मामलों की जिम्मेदारी बिकेता की होगी तथा आज दिनांक के बाद की समस्त जवाबदारी क्रेता की होगी।</span>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 30px;">
        <div style="width: 150px; border: 2px solid #000; padding: 60px 10px 10px; text-align: center; min-height: 120px;">
          <strong>Buyer</strong>
        </div>
        <div style="text-align: center; flex: 1; padding: 0 20px;">
          <div style="margin-bottom: 15px;">
            <strong style="font-size: 16px;">P</strong> <span>शपथकर्ता (क्रेता)</span>
          </div>
          <div style="border-bottom: 2px dotted #000; min-height: 40px; margin-bottom: 15px;"></div>
          <div style="margin-top: 30px;">
            <h2 style="font-size: 20px; font-weight: bold;">सत्यापन</h2>
          </div>
        </div>
        <div style="width: 150px; border: 2px solid #000; padding: 60px 10px 10px; text-align: center; min-height: 120px;">
          <strong>Seller</strong>
        </div>
        <div style="text-align: center; flex: 1; padding: 0 20px;">
          <div style="margin-bottom: 15px;">
            <strong style="font-size: 16px;">S</strong> <span>शपथकर्ता (बिक्रेता)</span>
          </div>
          <div style="border-bottom: 2px dotted #000; min-height: 40px;"></div>
        </div>
      </div>
      <div style="margin-top: 20px;">
        <div style="margin-bottom: 10px; display: flex; align-items: baseline;">
          <span>मैं</span>
          <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
          <span style="margin-left: 8px;">पिता/पति</span>
          <div style="flex: 1; border-bottom: 2px dotted #000; margin-left: 8px; min-height: 20px;"></div>
        </div>
        <p style="margin-bottom: 10px;">पता <span style="margin-left: 8px; border-bottom: 2px dotted #000; display: inline-block; min-width: 500px;">यह सत्यापित करता हूं कि उपरोक्त कंडिका 1 से 7 तक</span></p>
        <p style="margin-bottom: 10px;">की गई सभी जानकारी क्रेता एवं बिक्रेता को स्वीकार्य है। हम दोनों ने अपने होशो–हवाश में पढ़कर व समझकर</p>
        <p style="margin-bottom: 20px;">आज दिनांक <span style="margin-left: 8px; border-bottom: 2px dotted #000; display: inline-block; min-width: 200px;"></span> को हस्ताक्षर किया।</p>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div style="text-align: center;">
          <div style="border-bottom: 2px dotted #000; min-height: 50px; width: 200px; margin-bottom: 8px;"></div>
          <p>शपथकर्ता (क्रेता)</p>
          <div style="border-bottom: 2px dotted #000; min-height: 20px; width: 200px; margin-top: 15px;"></div>
          <p>मो.नं.</p>
        </div>
        <div style="text-align: center;">
          <div style="border-bottom: 2px dotted #000; min-height: 50px; width: 200px; margin-bottom: 8px;"></div>
          <p>शपथकर्ता (बिक्रेता)</p>
          <div style="border-bottom: 2px dotted #000; min-height: 20px; width: 200px; margin-top: 15px;"></div>
          <p>मो.नं.</p>
        </div>
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
    <div className="min-h-screen pt-4 lg:pt-6 px-4 pb-8 bg-gradient-to-br from-gray-50 to-gray-100">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map((form) => (
              form.isModal ? (
                <div
                  key={form.id}
                  onClick={() => handleFormClick(form)}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-200 cursor-pointer hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                      {form.icon}
                    </div>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {form.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {form.name}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3">
                    {form.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-indigo-600 text-xs font-semibold group-hover:underline">
                      Click to Edit →
                    </span>
                    <button
                      onClick={(e) => handleDirectPrint(form.id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-xs"
                      title="Print Empty Form"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={form.id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-200 hover:scale-105 hover:-translate-y-1"
                >
                  <Link to={form.path}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                        {form.icon}
                      </div>
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                        {form.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1.5 group-hover:text-indigo-600 transition-colors">
                      {form.name}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed mb-3">
                      {form.description}
                    </p>
                  </Link>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Link to={form.path}>
                      <span className="text-indigo-600 text-xs font-semibold group-hover:underline">
                        Click to Edit →
                      </span>
                    </Link>
                    <button
                      onClick={(e) => handleDirectPrint(form.id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-xs"
                      title="Print Empty Form"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Form 44 Modal */}
      {isForm44Open && (
        <Form44Modal onClose={() => setIsForm44Open(false)} />
      )}

      {/* Form 45 Modal */}
      {isForm45Open && (
        <Form45Modal onClose={() => setIsForm45Open(false)} />
      )}

      {/* Form 46 Modal */}
      {isForm46Open && (
        <Form46Modal onClose={() => setIsForm46Open(false)} />
      )}

      {/* Form 48 Modal */}
      {isForm48Open && (
        <Form48Modal onClose={() => setIsForm48Open(false)} />
      )}

      {/* Sapath Patra Modal */}
      {isSapathPatraOpen && (
        <SapathPatraModal onClose={() => setIsSapathPatraOpen(false)} />
      )}

      {/* Karyalay Form Modal */}
      {isKaryalayFormOpen && (
        <KaryalayFormModal onClose={() => setIsKaryalayFormOpen(false)} />
      )}

      {/* Karyalay Form 2 Modal */}
      {isKaryalayForm2Open && (
        <KaryalayForm2Modal onClose={() => setIsKaryalayForm2Open(false)} />
      )}
    </div>
  )
}

export default Forms
