---
description: Crée un composant React UI standardisé
argument-hint: [ComponentName]
allowed-tools: Read, Write, Glob, Grep
---

Create a new React UI component named `$ARGUMENTS` following these standards:

## Pre-creation Check

First, search for existing similar components in the codebase:
1. Use Glob to find files matching `**/*$ARGUMENTS*.tsx` or similar patterns
2. Use Grep to search for interfaces or components with similar names
3. If similar components exist, suggest extending them instead of creating new ones

## Component Settings

Check for project configuration in `.claude/react-component.local.md`:
- If exists, read and apply settings (componentsPath, namingConvention)
- If not exists, use defaults: `src/components/`, PascalCase

## Component Creation

If no similar component exists, create the component file:

### File Location
- Place in configured components path (default: `src/components/`)
- Use PascalCase for filename: `$ARGUMENTS.tsx`

### Component Structure

```typescript
import { ComponentPropsWithoutRef, FC } from 'react'
import { cn } from '@/lib/utils'

export interface $ARGUMENTSProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export const $ARGUMENTS: FC<$ARGUMENTSProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-md transition-colors',

        // Variant styles
        variant === 'default' && 'bg-white border border-gray-200',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-100 text-gray-900',

        // Size styles
        size === 'sm' && 'p-2 text-sm',
        size === 'md' && 'p-4 text-base',
        size === 'lg' && 'p-6 text-lg',

        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

## Conventions Applied

1. **Export interface** - Use `export interface` to allow inheritance
2. **FC<Props> typing** - Use `export const Component: FC<Props> = () => {}`
3. **ComponentPropsWithoutRef** - Use `ComponentPropsWithoutRef<'element'>` for native props
4. **cn() for classes** - Conditional Tailwind classes with `@/lib/utils`
5. **Spread props** - `{...props}` for flexibility
6. **Default variants** - Sensible defaults for all variant props
7. **Allow className override** - Consumer can customize styles

## After Creation

1. Report the file location
2. Show example usage
3. Suggest additional variants if applicable
4. Remind about adding to index exports if needed
