import React from 'react'

const Loader = ({ size = 24, className = '' }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        className="animate-spin text-primary-600"
        style={{ width: dimension, height: dimension }}
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  )
}

export default Loader
