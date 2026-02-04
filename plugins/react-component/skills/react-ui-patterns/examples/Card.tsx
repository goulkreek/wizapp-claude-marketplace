import { ComponentPropsWithoutRef, FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Card Root
export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: FC<CardProps> = ({
  variant = 'elevated',
  padding = 'none',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-white',

        // Variant styles
        variant === 'elevated' && 'shadow-md',
        variant === 'outlined' && 'border border-gray-200',
        variant === 'flat' && 'bg-gray-50',

        // Padding styles
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header
export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {
  title?: string
  description?: string
  action?: ReactNode
}

export const CardHeader: FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 p-4', className)}
      {...props}
    >
      <div className="space-y-1">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// Card Content
export interface CardContentProps extends ComponentPropsWithoutRef<'div'> {}

export const CardContent: FC<CardContentProps> = ({ className, ...props }) => {
  return <div className={cn('p-4 pt-0', className)} {...props} />
}

// Card Footer
export interface CardFooterProps extends ComponentPropsWithoutRef<'div'> {
  align?: 'left' | 'center' | 'right' | 'between'
}

export const CardFooter: FC<CardFooterProps> = ({
  align = 'right',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-gray-100 p-4',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        align === 'between' && 'justify-between',
        className
      )}
      {...props}
    />
  )
}

// Usage Example:
// <Card variant="elevated">
//   <CardHeader
//     title="Card Title"
//     description="Card description goes here"
//     action={<Button size="sm">Action</Button>}
//   />
//   <CardContent>
//     <p>Card content goes here</p>
//   </CardContent>
//   <CardFooter>
//     <Button variant="ghost">Cancel</Button>
//     <Button>Save</Button>
//   </CardFooter>
// </Card>
