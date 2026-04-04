import React from 'react'

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
}

const SIZE_CLASS = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  leadingIcon = null,
  trailingIcon = null,
  isLoading = false,
  className = '',
  ...props
}) => {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.primary
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md
  return (
    <button
      className={`${variantClass} ${sizeClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {leadingIcon}
          <span>{children}</span>
          {trailingIcon}
        </>
      )}
    </button>
  )
}

export default Button
