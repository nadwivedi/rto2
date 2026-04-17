import { useState } from 'react'
import { Link } from 'react-router-dom'
import QuickDLApplicationForm from './DrivingLicence/components/QuickDLApplicationForm'
import AddVehicleTransferModal from './VehicleTransfer/components/AddVehicleTransferModal'
import AddNocModal from './Noc/components/AddNocModal'
import AddRegistrationRenewalModal from './RegistrationRenewal/components/AddRegistrationRenewalModal'
import SarthiDashboard from './Sarthi/components/SarthiDashboard'

const sarthiOptions = [
  { title: 'Add DL', note: 'New driving license application', icon: '🪪', category: 'dl', badgeTone: 'bg-indigo-100 text-indigo-700' },
  { title: 'Vehicle Transfer', note: 'Ownership transfer service', icon: '🔀', category: 'transfer', badgeTone: 'bg-orange-100 text-orange-700' },
  { title: 'NOC Issued', note: 'No Objection Certificate service', icon: '📄', category: 'noc', badgeTone: 'bg-emerald-100 text-emerald-700' },
  { title: 'RC Renewal', note: 'Vehicle registration renewal', icon: '🔄', category: 'registration', badgeTone: 'bg-violet-100 text-violet-700' }
]

const quickButtons = [
  { title: 'DL List', path: '/driving', tone: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { title: 'Transfer List', path: '/vehicle-transfer', tone: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { title: 'NOC List', path: '/noc', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { title: 'Renewal List', path: '/registration-renewal', tone: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100' }
]

const Sarthi = () => {
  const [activeModal, setActiveModal] = useState(null)

  const openModal = (title) => setActiveModal(title)
  const closeModal = () => setActiveModal(null)

  return (
    <>
      <nav className='sticky top-0 z-50 border-b border-slate-200 bg-white px-4 py-2 shadow-sm'>
        <div className='flex flex-wrap items-center gap-2 lg:gap-3 xl:gap-4 2xl:gap-5'>
          {quickButtons.map((button) => (
            <Link
              key={button.title}
              to={button.path}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${button.tone}`}
            >
              {button.title}
            </Link>
          ))}
        </div>
      </nav>

      <div className='min-h-screen bg-slate-100 px-4 pb-8 pt-4 lg:px-6 lg:pt-5'>
        <div className='flex w-full flex-col gap-6 lg:flex-row'>
          <aside className='lg:fixed lg:left-0 lg:top-[4.75rem] lg:h-[calc(100vh-4.75rem)] lg:w-60 xl:w-64 2xl:w-[19rem] lg:overflow-y-auto'>
            <div className='overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-2xl'>
              <div className='space-y-4 p-6'>
                {sarthiOptions.map((option, index) => (
                  <button
                    key={option.title}
                    type='button'
                    onClick={() => openModal(option.title)}
                    className='block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition duration-200 hover:bg-white/10 hover:shadow-lg'
                  >
                    <div className='flex items-start gap-3'>
                      <span className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold'>
                        {option.icon}
                      </span>
                      <div className='min-w-0'>
                        <h2 className='text-sm font-bold text-white truncate'>{option.title}</h2>
                        <p className='mt-1 text-xs leading-5 text-slate-300'>{option.note}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className='flex-1 lg:ml-60 xl:ml-64 2xl:ml-[19rem]'>
            <div className='bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[calc(100vh-6rem)]'>
              <SarthiDashboard />
            </div>
          </main>
        </div>
      </div>

      {activeModal === 'Add DL' && (
        <QuickDLApplicationForm
          isOpen={true}
          onClose={closeModal}
          onSubmit={closeModal}
        />
      )}

      {activeModal === 'Vehicle Transfer' && (
        <AddVehicleTransferModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={closeModal}
        />
      )}

      {activeModal === 'NOC Issued' && (
        <AddNocModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={closeModal}
        />
      )}

      {activeModal === 'RC Renewal' && (
        <AddRegistrationRenewalModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={closeModal}
        />
      )}
    </>
  )
}

export default Sarthi
