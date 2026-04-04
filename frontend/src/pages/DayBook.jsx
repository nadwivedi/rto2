import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const PAGE_SIZE = 7

const typeStyles = {
  'Manage Vehicle': 'bg-sky-100 text-sky-700',
  'Manage Party': 'bg-indigo-100 text-indigo-700',
  'Add NP': 'bg-emerald-100 text-emerald-700',
  'Add CG Permit': 'bg-green-100 text-green-700',
  'Bus Permit': 'bg-orange-100 text-orange-700',
  'Add Temp Permit': 'bg-teal-100 text-teal-700',
  'Temp Permit Other State': 'bg-lime-100 text-lime-700',
  'Add Tax': 'bg-fuchsia-100 text-fuchsia-700',
  'Add Fitness': 'bg-violet-100 text-violet-700',
  PUC: 'bg-cyan-100 text-cyan-700',
  'Add GPS': 'bg-blue-100 text-blue-700',
  Insurance: 'bg-amber-100 text-amber-700',
  Bill: 'bg-rose-100 text-rose-700',
  Transfer: 'bg-slate-200 text-slate-700',
  'Registration Renewal': 'bg-purple-100 text-purple-700',
  NOC: 'bg-pink-100 text-pink-700'
}

const DayBook = () => {
  const [days, setDays] = useState([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerRef = useRef(null)
  const initialLoadDoneRef = useRef(false)

  const fetchDayBook = useCallback(async (requestedOffset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const response = await axios.get(`${API_URL}/api/day-book`, {
        params: {
          offset: requestedOffset,
          limit: PAGE_SIZE
        },
        withCredentials: true
      })

      const nextDays = response.data?.data?.days || []
      const pagination = response.data?.data?.pagination || {}

      setDays((current) => (append ? [...current, ...nextDays] : nextDays))
      setOffset(pagination.nextOffset || requestedOffset + PAGE_SIZE)
      setHasMore(Boolean(pagination.hasMore))
      initialLoadDoneRef.current = true
    } catch (error) {
      console.error('Error fetching day book:', error)
      toast.error('Failed to load day book')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchDayBook(0, false)
  }, [fetchDayBook])

  const loadMoreRef = useCallback((node) => {
    if (loading || loadingMore || !hasMore) {
      return
    }

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        fetchDayBook(offset, true)
      }
    }, {
      rootMargin: '250px'
    })

    if (node) {
      observerRef.current.observe(node)
    }
  }, [fetchDayBook, hasMore, loading, loadingMore, offset])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const totalLoadedItems = useMemo(
    () => days.reduce((sum, day) => sum + (day.totalItems || 0), 0),
    [days]
  )

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-6 lg:px-6'>
        <div className='mx-auto max-w-5xl animate-pulse space-y-4'>
          {[...Array(7)].map((_, index) => (
            <div key={index} className='rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='mb-4 h-7 w-40 rounded bg-slate-200' />
              <div className='space-y-3'>
                <div className='h-20 rounded-2xl bg-slate-100' />
                <div className='h-20 rounded-2xl bg-slate-100' />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-6 lg:px-6'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-5 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur'>
          <p className='text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500'>Day Book</p>
          <h1 className='mt-2 text-2xl font-black text-slate-900'>Daily work register</h1>
          <p className='mt-2 text-sm text-slate-600'>
            Showing 7 days first. Scroll down to load older work day by day.
          </p>
          <p className='mt-3 text-xs font-semibold text-slate-500'>
            Loaded {days.length} days and {totalLoadedItems} work entries
          </p>
        </div>

        <div className='space-y-4'>
          {days.map((day) => (
            <section key={day.date} className='rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]'>
              <div className='border-b border-slate-200 px-5 py-4 sm:px-6'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <h2 className='text-lg font-black text-slate-900'>{day.date}</h2>
                  <span className='inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600'>
                    {day.totalItems} work{day.totalItems === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div className='p-4 sm:p-5'>
                {day.items.length === 0 ? (
                  <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-500'>
                    No work added on this day.
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {day.items.map((item) => (
                      <article key={item.id} className='rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-4 shadow-sm'>
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${typeStyles[item.type] || 'bg-slate-100 text-slate-700'}`}>
                                {item.type}
                              </span>
                              <span className='text-xs font-bold text-slate-500'>{item.time}</span>
                            </div>
                            <h3 className='mt-3 text-base font-bold text-slate-900'>{item.title}</h3>
                            <p className='mt-1 text-sm font-medium text-slate-700'>{item.subtitle}</p>
                            <p className='mt-1 text-xs text-slate-500'>{item.meta}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {hasMore && <div ref={loadMoreRef} className='h-10' />}

        {loadingMore && (
          <div className='py-6 text-center text-sm font-semibold text-slate-500'>
            Loading more work...
          </div>
        )}

        {!hasMore && initialLoadDoneRef.current && (
          <div className='py-8 text-center text-sm font-semibold text-slate-500'>
            No older work found.
          </div>
        )}
      </div>
    </div>
  )
}

export default DayBook
