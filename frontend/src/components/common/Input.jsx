import React from 'react'

const Input = ({
  label,
  error,
  leadingIcon,
  trailingIcon,
  className = '',
  inputClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className={`relative`}>
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leadingIcon}
          </span>
        )}
        <input
          className={`input-base ${leadingIcon ? 'pl-10' : ''} ${trailingIcon ? 'pr-10' : ''} ${inputClassName}`}
          {...props}
        />
        {trailingIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {trailingIcon}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Input
