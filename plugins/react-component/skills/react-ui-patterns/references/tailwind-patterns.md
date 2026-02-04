# Tailwind CSS Patterns for React Components

## Class Organization

Organize Tailwind classes in a consistent order for readability:

```typescript
className={cn(
  // 1. Layout & Display
  'flex items-center justify-between',

  // 2. Sizing
  'w-full h-12',

  // 3. Spacing (margin, padding)
  'px-4 py-2 gap-2',

  // 4. Typography
  'text-sm font-medium',

  // 5. Colors (background, text, border)
  'bg-white text-gray-900 border-gray-200',

  // 6. Borders & Rounded
  'border rounded-lg',

  // 7. Effects & Transforms
  'shadow-sm transition-colors',

  // 8. States (hover, focus, active, disabled)
  'hover:bg-gray-50 focus:ring-2 disabled:opacity-50',

  // 9. Responsive variants
  'md:px-6 lg:text-base',

  // 10. Custom/override classes
  className
)}
```

## Responsive Breakpoints

Use mobile-first approach:

```typescript
// Mobile default, then larger screens
'text-sm md:text-base lg:text-lg'
'px-4 md:px-6 lg:px-8'
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
```

## State Classes

### Interactive States

```typescript
// Hover
'hover:bg-blue-600 hover:text-white'

// Focus (accessibility)
'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'

// Focus-visible (keyboard only)
'focus-visible:ring-2 focus-visible:ring-blue-500'

// Active
'active:bg-blue-700 active:scale-95'

// Disabled
'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
```

### Combined State Pattern

```typescript
const baseStyles = 'transition-colors duration-150'
const interactiveStyles = 'hover:bg-gray-100 active:bg-gray-200'
const focusStyles = 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed'
```

## Color Variants

### Semantic Color Mapping

```typescript
const variantColors = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
}
```

### Outline Variants

```typescript
const outlineVariants = {
  primary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  secondary: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  danger: 'border-2 border-red-600 text-red-600 hover:bg-red-50',
}
```

## Size Scales

### Consistent Sizing

```typescript
const sizes = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
  xl: 'h-14 px-8 text-xl',
}
```

### Icon Sizes

```typescript
const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}
```

## Spacing Patterns

### Consistent Padding

```typescript
const padding = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}
```

### Gap for Flex/Grid

```typescript
const gaps = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}
```

## Animation & Transitions

### Standard Transitions

```typescript
// Color transitions
'transition-colors duration-150'

// All properties
'transition-all duration-200'

// Transform
'transition-transform duration-200'

// Opacity
'transition-opacity duration-150'
```

### Hover Effects

```typescript
// Scale
'hover:scale-105 transition-transform'

// Lift effect
'hover:-translate-y-0.5 hover:shadow-lg transition-all'

// Glow
'hover:shadow-blue-500/25 hover:shadow-lg transition-shadow'
```

## Dark Mode

### Using dark: Prefix

```typescript
className={cn(
  'bg-white text-gray-900',
  'dark:bg-gray-800 dark:text-gray-100',
  'border-gray-200 dark:border-gray-700'
)}
```

### Color System for Dark Mode

```typescript
const colors = {
  background: 'bg-white dark:bg-gray-900',
  surface: 'bg-gray-50 dark:bg-gray-800',
  border: 'border-gray-200 dark:border-gray-700',
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
  },
}
```

## Common Component Patterns

### Card

```typescript
'rounded-lg border border-gray-200 bg-white shadow-sm'
'dark:border-gray-700 dark:bg-gray-800'
```

### Input

```typescript
'w-full rounded-md border border-gray-300 px-3 py-2'
'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
'disabled:bg-gray-100 disabled:cursor-not-allowed'
```

### Badge

```typescript
'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
```

### Avatar

```typescript
'relative inline-flex shrink-0 overflow-hidden rounded-full'
```

## Avoiding Class Conflicts

### Use tailwind-merge

The `cn()` utility with `tailwind-merge` handles conflicting classes:

```typescript
// Without tailwind-merge
cn('px-4', 'px-6') // Results in "px-4 px-6" (both applied, unpredictable)

// With tailwind-merge
cn('px-4', 'px-6') // Results in "px-6" (last value wins)
```

### Order Matters

Place override classes last:

```typescript
cn(
  'px-4 py-2',      // Base
  size === 'lg' && 'px-6 py-3',  // Override if large
  className         // Consumer override (always last)
)
```
