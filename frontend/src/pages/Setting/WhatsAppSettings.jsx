import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const WhatsAppSettings = () => {
    const [settings, setSettings] = useState({
        daysBeforeExpiry: 7,
        sendOnExpiryDay: true,
        enableGracePeriodAlerts: false,
        gracePeriodDays: [7, 15]
    })
    const [loading, setLoading] = useState(true)

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/whatsapp-settings`, { withCredentials: true })
            if (res.data) setSettings(res.data)
        } catch (error) {
            toast.error('Failed to load WhatsApp settings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSave = async () => {
        try {
            await axios.put(`${API_URL}/api/whatsapp-settings`, settings, { withCredentials: true })
            toast.success('WhatsApp settings updated successfully')
        } catch (error) {
            toast.error('Failed to save settings')
        }
    }

    if (loading) return <div>Loading settings...</div>

    return (
        <div className='bg-white rounded-xl p-6 shadow-lg border border-green-200 mt-4'>
            <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xl'>
                    💬
                </div>
                <div>
                    <h2 className='text-lg font-bold text-gray-800'>WhatsApp Automated Settings</h2>
                    <p className='text-xs text-gray-500'>Configure when automated expiry alerts should be sent</p>
                </div>
            </div>

            <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className='text-sm font-semibold text-gray-700 block mb-2'>
                            Days Before Expiry
                        </label>
                        <input
                            type='number'
                            value={settings.daysBeforeExpiry}
                            onChange={(e) => setSettings({ ...settings, daysBeforeExpiry: parseInt(e.target.value) || 0 })}
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
                            min="0"
                        />
                        <p className='text-xs text-gray-500 mt-1'>Send alert X days before document expiry (default: 7)</p>
                    </div>

                    <div className='flex items-center mt-6'>
                        <input
                            type='checkbox'
                            id='sendOnExpiry'
                            checked={settings.sendOnExpiryDay}
                            onChange={(e) => setSettings({ ...settings, sendOnExpiryDay: e.target.checked })}
                            className='w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300'
                        />
                        <label htmlFor='sendOnExpiry' className='ml-2 text-sm font-semibold text-gray-700'>
                            Send message on exact day of expiry
                        </label>
                    </div>

                    <div className='flex items-center mt-2'>
                        <input
                            type='checkbox'
                            id='gracePeriod'
                            checked={settings.enableGracePeriodAlerts}
                            onChange={(e) => setSettings({ ...settings, enableGracePeriodAlerts: e.target.checked })}
                            className='w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300'
                        />
                        <label htmlFor='gracePeriod' className='ml-2 text-sm font-semibold text-gray-700'>
                            Enable Grace Period Alerts (After Expiry)
                        </label>
                    </div>

                    {settings.enableGracePeriodAlerts && (
                        <div>
                            <label className='text-sm font-semibold text-gray-700 block mb-2'>
                                Grace Period Days (Comma separated)
                            </label>
                            <input
                                type='text'
                                value={settings.gracePeriodDays.join(', ')}
                                onChange={(e) => {
                                    const parsed = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                                    setSettings({ ...settings, gracePeriodDays: parsed })
                                }}
                                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
                                placeholder='e.g., 7, 15'
                            />
                            <p className='text-xs text-gray-500 mt-1'>e.g. 7, 15 will send alerts 7 days & 15 days AFTER expiry.</p>
                        </div>
                    )}
                </div>

                <div className='pt-4'>
                    <button onClick={handleSave} className='px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition text-sm'>
                        Save WhatsApp Settings
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WhatsAppSettings
