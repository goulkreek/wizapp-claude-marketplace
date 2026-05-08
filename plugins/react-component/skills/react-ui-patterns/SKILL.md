---
name: React UI Patterns
description: This skill should be used when the user asks to "create a React component", "create a UI component", "build a Button component", "make a reusable component", "design a component with variants", or mentions React component patterns, Tailwind CSS styling, component composition, or TypeScript props interfaces. Provides standardization patterns for React UI components.
version: 1.0.0
---

# React UI Component Patterns

## Purpose

Provide standardized patterns for creating reusable React UI components with TypeScript and Tailwind CSS. Ensure consistency across the codebase and maximize component reusability.

## When to Use

Activate when creating new React components or extending existing ones. Check for existing similar components before creating new ones to avoid duplication.

## ⚠️ Règles strictes (lecture obligatoire)

Avant d'écrire ou modifier un composant, consulter **`references/strict-rules.md`** qui contient toutes les règles non-négociables. Résumé :

### TypeScript
- **Jamais** `any`, **jamais** de cast `as` / `<Type>` → utiliser `unknown` + type guards ou des génériques
- **Toujours** exporter l'interface des props : `export interface XxxProps`
- Préférer un type spécifique à un primitif (union littérale, branded type, template literal)

### Style
- **Toujours** des arrow functions (`const Component: FC<Props> = () => {}`) — jamais de `function` declarations
- **Jamais** d'IIFE dans le JSX (`{(() => { ... })()}`) — extraire un composant nommé à la place

### Architecture
- Découpage **UI / Container / Feature** : séparer rendu pur et logique métier
- **Règle des 70%** : si un composant existant couvre ≥70% du besoin, l'**adapter** (variant, allowedXXX, renderXXX) plutôt que dupliquer
- Composants spécialisés héritent **toujours** des props du parent via `extends` (jamais redéfinir une prop existante)

### Limites
- ≤ 300 lignes par fichier, ≤ 40 lignes par fonction, ≤ 10 branches de complexité cyclomatique

### Formulaires
- **Stack obligatoire** : react-hook-form + @hookform/resolvers/zod + zod
- **Interdit** : yup, class-validator, validation manuelle inline

### Asynchrone
- `async/await` ou promises, **jamais** de callbacks (sauf wrapper interne pour API tierce)

### Qualité
- Pas de magic numbers/strings → constantes nommées
- Pas de code commenté, pas de TODO sans ticket, pas d'imports inutilisés
- Tests **100% de couverture** sur tout code ajouté ou modifié (statements, branches, functions, lines)

### Stories Ladle
- Si **Ladle est installé** dans le projet (présence de `@ladle/react` dans `package.json`, dossier `.ladle/`, ou stories existantes) : créer/mettre à jour `<ComponentName>.stories.tsx` à côté de chaque composant créé ou modifié, avec une story par variante et par état (loading, error, empty, disabled, edge cases)
- Si **Ladle n'est pas installé** : **proposer** à l'utilisateur de l'ajouter (`pnpm add -D @ladle/react` + script `"ladle": "ladle serve"`) avant de continuer

### Conventions projet
- Tous textes UI, commentaires et messages d'erreur **en français**
- Commits : `type(scope): description`, jamais de mention IA/Claude

**Voir le détail complet, exemples, et checklist finale dans `references/strict-rules.md`.**

## Core Principles

### Single Responsibility

Each component handles one visual concern. Separate UI components from data-fetching logic.

### Composition Over Inheritance

Build complex components by combining simple ones. Use children and render props for flexibility.

### Explicit Props

Define clear TypeScript interfaces. Document props purpose and constraints.

## Standard Component Structure

### File Naming

Use PascalCase for component files:
- `Button.tsx`
- `UserAvatar.tsx`
- `CardHeader.tsx`

### Basic Template

```typescript
import { ComponentPropsWithoutRef, FC } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        variant === 'ghost' && 'bg-transparent hover:bg-gray-100',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Key Patterns

1. **Export interfaces**: Use `export interface` to allow inheritance by other components
2. **FC<Props> typing**: Use `export const Component: FC<Props> = () => {}`
3. **ComponentPropsWithoutRef**: Use `ComponentPropsWithoutRef<'element'>` for native prop support
4. **Spread remaining props**: Use `...props` to pass through native attributes
5. **Allow className override**: Accept `className` prop and merge with `cn()`
6. **Default variant values**: Provide sensible defaults for all variant props
7. **Named exports**: Use `export const` instead of default exports

## Variant Management with cn()

### The cn() Utility

Combine Tailwind classes conditionally:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(cn(inputs))
}
```

### Conditional Classes Pattern

```typescript
className={cn(
  // Base classes (always applied)
  'rounded-md transition-colors',
  // Conditional classes
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50 cursor-not-allowed',
  // Variant-based classes
  variant === 'outline' && 'border-2 border-current',
  // Size-based classes
  size === 'sm' && 'text-sm px-2 py-1',
  // Allow consumer override
  className
)}
```

## Props Design Guidelines

### Variant Props

Define explicit union types for variants:

```typescript
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```

### Boolean Feature Flags

Use `showXXX` or `enableXXX` naming:

```typescript
interface UserCardProps {
  showAvatar?: boolean
  showEmail?: boolean
  enableHover?: boolean
}
```

### Allowed Actions Pattern

Restrict available actions with arrays:

```typescript
interface ItemCardProps {
  allowedActions?: Array<'edit' | 'delete' | 'duplicate'>
}
```

### Render Props for Customization

Allow custom rendering of sub-parts:

```typescript
interface ListItemProps {
  renderIcon?: () => React.ReactNode
  renderActions?: () => React.ReactNode
}
```

## Composition Patterns

### Compound Components

Group related components:

```typescript
import { ComponentPropsWithoutRef, FC } from 'react'

// Card.tsx
export interface CardProps extends ComponentPropsWithoutRef<'div'> {}
export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {}
export interface CardContentProps extends ComponentPropsWithoutRef<'div'> {}

export const Card: FC<CardProps> = ({ children, className, ...props }) => {
  return <div className={cn('rounded-lg border', className)} {...props}>{children}</div>
}

export const CardHeader: FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return <div className={cn('p-4 border-b', className)} {...props}>{children}</div>
}

export const CardContent: FC<CardContentProps> = ({ children, className, ...props }) => {
  return <div className={cn('p-4', className)} {...props}>{children}</div>
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Slot Pattern

Accept named children for layout:

```typescript
interface PageLayoutProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}
```

## Props Inheritance (Héritage)

Les composants spécialisés héritent toujours des props du composant principal :

```typescript
import { ComponentPropsWithoutRef, FC, ReactNode } from 'react'

// Composant principal - TOUJOURS exporter l'interface
export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

// Composant spécialisé HÉRITE du principal
export interface IconButtonProps extends ButtonProps {
  icon: ReactNode
  'aria-label': string
}

// Implémentation réutilise le composant parent
export const IconButton: FC<IconButtonProps> = ({ icon, children, ...props }) => {
  return (
    <Button {...props}>
      {icon}
      {children}
    </Button>
  )
}
```

**Règles d'héritage :**
- **Toujours exporter l'interface** avec `export interface` pour permettre l'héritage
- Toujours `extends` le composant principal
- Utiliser `Omit<ParentProps, 'prop'>` pour exclure des props incompatibles
- Utiliser `Pick<ParentProps, 'prop1' | 'prop2'>` pour sélectionner certaines props
- Ne jamais redéfinir les mêmes props que le parent

Voir `references/typescript-patterns.md` pour les patterns détaillés.

## Extending Existing Components

Before creating a new component, check if an existing one can be extended:

1. **Add variant**: New visual style as a variant option
2. **Add feature flag**: Toggle new functionality with boolean prop
3. **Add render prop**: Allow custom rendering of new section
4. **Composition**: Wrap existing component with additional behavior
5. **Props inheritance**: Create specialized component extending parent props

### Extension Example

```typescript
// Existing Button gains new variant
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' // Added 'danger'
}
```

## Checking for Existing Components

Before creating a component:

1. Search for similar component names in the codebase
2. Look for components with overlapping functionality
3. Check if the need can be met by extending an existing component
4. Consider composition of multiple existing components

Use `/find-component` command to search for similar components.

## Additional Resources

### Reference Files

For detailed patterns and advanced techniques:
- **`references/strict-rules.md`** — Règles strictes obligatoires (TypeScript, style, architecture, formulaires, tests, conventions projet)
- **`references/tailwind-patterns.md`** - Tailwind CSS class organization
- **`references/typescript-patterns.md`** - TypeScript interface patterns

### Example Files

Working component examples in `examples/`:
- **`examples/Button.tsx`** - Complete button with variants
- **`examples/Card.tsx`** - Compound component example
- **`examples/Input.tsx`** - Form input with validation states
