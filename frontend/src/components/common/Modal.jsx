import React from 'react'

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  if (!isOpen) return null
  const sizeClass = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }[size] || 'sm:max-w-lg'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} animate-scale-in`}>
        <div className="card">
          {(title || onClose) && (
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              {onClose && (
                <button className="btn-ghost p-2" onClick={onClose} aria-label="Close">
                  ✕
                </button>
              )}
            </div>
          )}
          <div className="max-h-[70vh] overflow-auto">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export default Modal
