import React from 'react'

export function Button({ children, variant = 'default', size = 'default', ...props }) {
  const baseStyles = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  }
  const sizeStyles = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm',
  }

  const className = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`

  return (
    <button className={className} {...props}>
      {children}
    </button>
  )
}

