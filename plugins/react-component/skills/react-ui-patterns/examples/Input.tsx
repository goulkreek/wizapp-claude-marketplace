import { forwardRef, ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`
    const hasError = Boolean(error)

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'block w-full rounded-md border bg-white px-3 py-2 text-gray-900 transition-colors',
              'placeholder:text-gray-400',

              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-offset-0',

              // Default border
              !hasError && 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',

              // Error border
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

              // Disabled styles
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',

              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',

              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Usage Example:
// <Input
//   label="Email"
//   type="email"
//   placeholder="you@example.com"
//   hint="We'll never share your email"
// />
//
// <Input
//   label="Password"
//   type="password"
//   error="Password must be at least 8 characters"
// />
//
// With react-hook-form:
// <Input
//   label="Email"
//   {...register('email')}
//   error={errors.email?.message}
// />
