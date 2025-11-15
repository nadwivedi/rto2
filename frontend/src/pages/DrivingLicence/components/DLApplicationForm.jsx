import { useState, useEffect } from 'react'
import { handlePaymentCalculation } from '../../../utils/paymentValidation'

const DLApplicationForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',

    // Contact Information
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',

    // License Information
    licenseType: 'New DL',
    licenseClass: '',
    vehicleCategory: '',
    existingLLNumber: '',
    licenseStatus: 'pending',

    // Educational Information
    qualification: '',

    // Identification
    aadharNumber: '',
    panNumber: '',

    // Emergency Contact
    emergencyContact: '',
    emergencyRelation: '',

    // Payment Information
    totalAmount: '',
    paidAmount: '',
    balanceAmount: 0,

    // Documents (files would be handled separately in production)
    documents: {
      photo: null,
      signature: null,
      aadharCard: null,
      addressProof: null,
      ageProof: null,
      learnerLicense: null,
      medicalCertificate: null
    }
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5 // Changed from 4 to 5 to include payment step
  const [paidExceedsTotal, setPaidExceedsTotal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    // Handle payment calculation with validation
    if (name === 'totalAmount' || name === 'paidAmount') {
      setFormData(prev => {
        // Map field names to match utility function expectations
        const mappedData = {
          totalFee: prev.totalAmount,
          paid: prev.paidAmount
        }
        const mappedName = name === 'totalAmount' ? 'totalFee' : 'paid'

        const paymentResult = handlePaymentCalculation(mappedName, value, mappedData)
        setPaidExceedsTotal(paymentResult.paidExceedsTotal)

        return {
          ...prev,
          [name]: name === 'paidAmount' ? paymentResult.paid : value,
          totalAmount: name === 'totalAmount' ? value : prev.totalAmount,
          paidAmount: name === 'paidAmount' ? paymentResult.paid : prev.paidAmount,
          balanceAmount: parseFloat(paymentResult.balance) || 0
        }
      })
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: file
        }
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate payment amount
    if (paidExceedsTotal) {
      alert('Paid amount cannot be more than the total fee!')
      return
    }

    if (onSubmit) {
      onSubmit(formData)
    }
    onClose()
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold'>New Driving Licence Application</h2>
              <p className='text-indigo-100 text-sm mt-1'>Step {currentStep} of {totalSteps}</p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 rounded-lg p-2 transition'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className='mt-6 flex gap-2'>
            {[...Array(totalSteps)].map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx + 1 <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className='overflow-y-auto max-h-[calc(90vh-200px)]'>
          <div className='p-6'>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Personal Information</h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      First Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Middle Name
                    </label>
                    <input
                      type='text'
                      name='middleName'
                      value={formData.middleName}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Last Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Date of Birth <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='date'
                      name='dateOfBirth'
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Gender <span className='text-red-500'>*</span>
                    </label>
                    <select
                      name='gender'
                      value={formData.gender}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Select Gender</option>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Blood Group <span className='text-red-500'>*</span>
                    </label>
                    <select
                      name='bloodGroup'
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Select Blood Group</option>
                      <option value='A+'>A+</option>
                      <option value='A-'>A-</option>
                      <option value='B+'>B+</option>
                      <option value='B-'>B-</option>
                      <option value='O+'>O+</option>
                      <option value='O-'>O-</option>
                      <option value='AB+'>AB+</option>
                      <option value='AB-'>AB-</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Father's Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='fatherName'
                      value={formData.fatherName}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Mother's Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='motherName'
                      value={formData.motherName}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Educational Qualification <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='qualification'
                    value={formData.qualification}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  >
                    <option value=''>Select Qualification</option>
                    <option value='Below 10th'>Below 10th</option>
                    <option value='10th Pass'>10th Pass</option>
                    <option value='12th Pass'>12th Pass</option>
                    <option value='Graduate'>Graduate</option>
                    <option value='Post Graduate'>Post Graduate</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address Information */}
            {currentStep === 2 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Contact & Address Information</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Mobile Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='tel'
                      name='mobileNumber'
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder='10-digit mobile number'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Email Address <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Complete Address <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    name='address'
                    value={formData.address}
                    onChange={handleChange}
                    rows='3'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      City <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='city'
                      value={formData.city}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      State <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='state'
                      value={formData.state}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Pincode <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='pincode'
                      value={formData.pincode}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    />
                  </div>
                </div>

                <div className='border-t border-gray-200 pt-6 mt-6'>
                  <h4 className='text-lg font-bold text-gray-800 mb-4'>Emergency Contact</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Emergency Contact Number <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='tel'
                        name='emergencyContact'
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Relationship <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='emergencyRelation'
                        value={formData.emergencyRelation}
                        onChange={handleChange}
                        placeholder='e.g., Father, Mother, Spouse'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: License & Identification */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>License & Identification Details</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      License Type <span className='text-red-500'>*</span>
                    </label>
                    <select
                      name='licenseType'
                      value={formData.licenseType}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value='New DL'>New DL</option>
                      <option value='Upgrade'>Upgrade License</option>
                      <option value='International'>International License</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      License Class <span className='text-red-500'>*</span>
                    </label>
                    <select
                      name='licenseClass'
                      value={formData.licenseClass}
                      onChange={handleChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Select Class</option>
                      <option value='MCWG'>MCWG - Two Wheeler</option>
                      <option value='LMV'>LMV - Light Motor Vehicle (Four Wheeler)</option>
                      <option value='MCWG+LMV'>MCWG + LMV - Both Two & Four Wheeler</option>
                      <option value='HMV'>HMV - Heavy Motor Vehicle</option>
                      <option value='Commercial'>Commercial Vehicle</option>
                      <option value='Transport'>Transport Vehicle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Vehicle Category <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='vehicleCategory'
                    value={formData.vehicleCategory}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  >
                    <option value=''>Select Category</option>
                    <option value='Two Wheeler'>Two Wheeler (MCWG)</option>
                    <option value='Four Wheeler'>Four Wheeler (LMV)</option>
                    <option value='Both Two & Four Wheeler'>Both Two & Four Wheeler</option>
                    <option value='Commercial'>Commercial Vehicle</option>
                    <option value='Heavy Vehicle'>Heavy Vehicle (HMV)</option>
                    <option value='Transport'>Transport Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Existing Learner's License Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='existingLLNumber'
                    value={formData.existingLLNumber}
                    onChange={handleChange}
                    placeholder='Enter your LL number'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Must have valid Learner's License to apply for Driving License</p>
                </div>

                <div className='border-t border-gray-200 pt-6 mt-6'>
                  <h4 className='text-lg font-bold text-gray-800 mb-4'>Identification Documents</h4>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Aadhar Number <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='aadharNumber'
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        placeholder='12-digit Aadhar number'
                        maxLength='12'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        PAN Number (Optional)
                      </label>
                      <input
                        type='text'
                        name='panNumber'
                        value={formData.panNumber}
                        onChange={handleChange}
                        placeholder='10-character PAN'
                        maxLength='10'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment Information */}
            {currentStep === 4 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Payment Information</h3>

                <div className='bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Total Amount <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>₹</span>
                        <input
                          type='number'
                          name='totalAmount'
                          value={formData.totalAmount}
                          onChange={handleChange}
                          placeholder='4000.00'
                          min='0'
                          step='0.01'
                          className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold text-lg'
                          required
                        />
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>Total fee for complete driving license process</p>
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Paid Amount <span className='text-red-500'>*</span>
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>₹</span>
                        <input
                          type='number'
                          name='paidAmount'
                          value={formData.paidAmount}
                          onChange={handleChange}
                          placeholder='2000.00'
                          min='0'
                          step='0.01'
                          max={formData.totalAmount}
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 font-semibold text-lg ${
                            paidExceedsTotal
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-transparent'
                          }`}
                          required
                        />
                      </div>
                      {paidExceedsTotal ? (
                        <p className='text-xs mt-1 text-red-600 font-semibold'>
                          Paid amount cannot exceed total fee!
                        </p>
                      ) : (
                        <p className='text-xs text-gray-500 mt-1'>Amount paid for learning license (can pay in parts)</p>
                      )}
                    </div>
                  </div>

                  <div className='bg-white rounded-lg p-4 border-2 border-indigo-300'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-semibold text-gray-700'>Balance Amount Remaining</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-2xl font-black text-indigo-600'>
                          ₹ {formData.balanceAmount.toFixed(2)}
                        </span>
                        {formData.balanceAmount > 0 && (
                          <span className='px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full'>
                            Pending
                          </span>
                        )}
                        {formData.balanceAmount === 0 && formData.totalAmount > 0 && (
                          <span className='px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full'>
                            Fully Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                    <div className='flex gap-2 items-start'>
                      <svg className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <div className='text-xs text-blue-800'>
                        <p className='font-semibold mb-1'>Payment Guidelines:</p>
                        <ul className='list-disc list-inside space-y-1'>
                          <li>Learning License fee: ₹2000 (approx) - Pay at application</li>
                          <li>Driving License fee: ₹2000 (approx) - Pay after passing test</li>
                          <li>Total typical fee: ₹4000 for complete process</li>
                          <li>Balance can be paid later when upgrading to full license</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Document Upload */}
            {currentStep === 5 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>Upload Required Documents</h3>
                <p className='text-sm text-gray-600 mb-6'>
                  Please upload clear, scanned copies of the following documents. Accepted formats: JPG, PNG, PDF (Max size: 2MB each)
                </p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Photo */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Passport Size Photo <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => handleFileChange(e, 'photo')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      required
                    />
                    {formData.documents.photo && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.photo.name}</p>
                    )}
                  </div>

                  {/* Signature */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Signature <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => handleFileChange(e, 'signature')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      required
                    />
                    {formData.documents.signature && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.signature.name}</p>
                    )}
                  </div>

                  {/* Aadhar Card */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Aadhar Card <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) => handleFileChange(e, 'aadharCard')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      required
                    />
                    {formData.documents.aadharCard && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.aadharCard.name}</p>
                    )}
                  </div>

                  {/* Address Proof */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Address Proof <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) => handleFileChange(e, 'addressProof')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      required
                    />
                    {formData.documents.addressProof && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.addressProof.name}</p>
                    )}
                  </div>

                  {/* Age Proof */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Age Proof <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) => handleFileChange(e, 'ageProof')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      required
                    />
                    {formData.documents.ageProof && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.ageProof.name}</p>
                    )}
                  </div>

                  {/* Learner License */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Learner's License <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) => handleFileChange(e, 'learnerLicense')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                      required
                    />
                    {formData.documents.learnerLicense && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.learnerLicense.name}</p>
                    )}
                  </div>

                  {/* Medical Certificate */}
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Medical Certificate
                    </label>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) => handleFileChange(e, 'medicalCertificate')}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                    />
                    {formData.documents.medicalCertificate && (
                      <p className='text-xs text-green-600 mt-2'>✓ {formData.documents.medicalCertificate.name}</p>
                    )}
                    <p className='text-xs text-gray-500 mt-1'>Required for commercial & heavy vehicles</p>
                  </div>
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6'>
                  <div className='flex gap-3'>
                    <svg className='w-6 h-6 text-blue-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <div className='text-sm text-blue-800'>
                      <p className='font-semibold mb-1'>Document Guidelines:</p>
                      <ul className='list-disc list-inside space-y-1'>
                        <li>All documents must be clear and readable</li>
                        <li>Photo should have white background</li>
                        <li>Documents must be valid and not expired</li>
                        <li>File size should not exceed 2MB per document</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className='border-t border-gray-200 p-6 bg-gray-50 flex justify-between'>
            <button
              type='button'
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition'
              >
                Cancel
              </button>

              {currentStep < totalSteps ? (
                <button
                  type='button'
                  onClick={nextStep}
                  className='px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold transition'
                >
                  Next Step
                </button>
              ) : (
                <button
                  type='submit'
                  className='px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold transition'
                >
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DLApplicationForm
