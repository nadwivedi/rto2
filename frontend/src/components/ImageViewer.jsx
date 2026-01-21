import { useState } from 'react'

const ImageViewer = ({ isOpen, onClose, imageUrl, title = 'Image Viewer' }) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  if (!isOpen) return null

  const isPDF = imageUrl && (imageUrl.toLowerCase().includes('.pdf') || imageUrl.startsWith('data:application/pdf'))

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = isPDF ? 'document.pdf' : 'document.webp'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.open(imageUrl, '_blank')
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleClose = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    onClose()
  }

  return (
    <div className='fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-fadeIn'>
      {/* Header */}
      <div className='absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10'>
        <div className='flex items-center justify-between max-w-7xl mx-auto'>
          <h2 className='text-white font-bold text-lg md:text-xl flex items-center gap-2'>
            <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
            {title}
          </h2>
          <button
            onClick={handleClose}
            className='text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:rotate-90'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className='relative w-full h-full flex items-center justify-center overflow-hidden'>
        {isPDF ? (
          <iframe
            src={imageUrl}
            title={title}
            className='w-full h-full border-0 bg-white'
            style={{ minHeight: 'calc(100vh - 80px)' }}
          />
        ) : (
          <div
            className='w-full h-full flex items-center justify-center overflow-hidden'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <img
              src={imageUrl}
              alt='Document'
              className='max-w-full max-h-full object-contain select-none transition-transform duration-200'
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-3 flex items-center gap-3 shadow-2xl border border-white/20'>
        {isPDF ? (
          <>
            {/* Print */}
            <button
              onClick={handlePrint}
              className='text-white hover:text-blue-400 transition-all duration-200 p-2 hover:bg-white/10 rounded-lg'
              title='Print PDF'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
              </svg>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className='text-white hover:text-purple-400 transition-all duration-200 p-2 hover:bg-white/10 rounded-lg'
              title='Download PDF'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
              </svg>
            </button>
          </>
        ) : (
          <>
            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className='text-white hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 p-2 hover:bg-white/10 rounded-lg'
              title='Zoom Out'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7' />
              </svg>
            </button>

            {/* Zoom Level Display */}
            <div className='text-white font-bold text-sm md:text-base min-w-[60px] text-center'>
              {Math.round(zoom * 100)}%
            </div>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className='text-white hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 p-2 hover:bg-white/10 rounded-lg'
              title='Zoom In'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7' />
              </svg>
            </button>

            {/* Divider */}
            <div className='w-px h-6 bg-white/30 mx-1'></div>

            {/* Reset Zoom */}
            <button
              onClick={handleResetZoom}
              disabled={zoom === 1 && position.x === 0 && position.y === 0}
              className='text-white hover:text-green-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 p-2 hover:bg-white/10 rounded-lg'
              title='Reset Zoom'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className='text-white hover:text-purple-400 transition-all duration-200 p-2 hover:bg-white/10 rounded-lg'
              title='Download Image'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      {!isPDF && zoom > 1 && (
        <div className='absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full animate-fadeIn'>
          Click and drag to move image
        </div>
      )}
    </div>
  )
}

export default ImageViewer
