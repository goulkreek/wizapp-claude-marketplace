# TypeScript Patterns for React Components

## Props Interface Patterns

### Extending HTML Attributes avec ComponentPropsWithoutRef

Utiliser `ComponentPropsWithoutRef<'element'>` pour une syntaxe plus concise. **Toujours exporter les interfaces** pour permettre l'héritage :

```typescript
import { ComponentPropsWithoutRef } from 'react'

// Button extending native button attributes
export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

// Input extending native input attributes
export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string
  error?: string
}

// Anchor/Link extending native anchor attributes
export interface LinkProps extends ComponentPropsWithoutRef<'a'> {
  external?: boolean
}

// Div extending native div attributes
export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'elevated' | 'outlined'
}
```

### Avantages de ComponentPropsWithoutRef

- **Syntaxe concise** : `'button'` au lieu de `HTMLButtonElement`
- **Type-safe** : Même niveau de sécurité des types
- **Moderne** : Pattern recommandé par React
- **Sans ref** : N'inclut pas la prop ref (utiliser `ComponentPropsWithRef` si besoin)

### Component Props with Children

```typescript
// Explicit children type
interface ContainerProps {
  children: React.ReactNode
  className?: string
}

// PropsWithChildren utility
import { PropsWithChildren } from 'react'

interface PanelProps extends PropsWithChildren {
  title: string
}
```

### Discriminated Unions

Use for components with mutually exclusive props:

```typescript
// Button can be a button OR a link, not both
export type ButtonProps = (
  | { as?: 'button'; href?: never }
  | { as: 'a'; href: string }
) & {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export const Button = ({ as = 'button', href, ...props }: ButtonProps) => {
  if (as === 'a') {
    return <a href={href} {...props} />
  }
  return <button {...props} />
}
```

### Required vs Optional Props

```typescript
interface UserCardProps {
  // Required - component won't work without these
  user: User

  // Optional with defaults - common configurations
  variant?: 'compact' | 'detailed'  // default: 'detailed'
  showAvatar?: boolean              // default: true

  // Optional without defaults - disabled by default
  onEdit?: () => void
  onDelete?: () => void
}
```

## Props Inheritance (Composant Principal)

Les composants spécialisés ou variantes doivent hériter des props du composant principal pour garantir la cohérence et la réutilisabilité.

### Pattern de base : Extends

```typescript
// Composant principal (base)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

// Composant spécialisé hérite du principal
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  'aria-label': string  // Requis pour accessibilité
}

// Autre variante
interface LoadingButtonProps extends ButtonProps {
  loadingText?: string
}
```

### Héritage avec Omit (exclure certaines props)

```typescript
// Composant principal
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

// Composant spécialisé qui redéfinit certaines props
interface SearchInputProps extends Omit<InputProps, 'type'> {
  onSearch: (query: string) => void
  // type est forcé à 'search', donc on l'exclut
}

export function SearchInput({ onSearch, ...props }: SearchInputProps) {
  return (
    <Input
      type="search"
      {...props}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSearch(e.currentTarget.value)
      }}
    />
  )
}
```

### Héritage avec Pick (sélectionner certaines props)

```typescript
// Composant principal avec beaucoup de props
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
}

// Composant simplifié qui n'expose que certaines props
interface SimpleCardProps extends Pick<CardProps, 'variant' | 'padding' | 'className' | 'children'> {
  title: string
}
```

### Composition avec ComponentProps

```typescript
import { ComponentProps } from 'react'

// Récupérer les props d'un composant existant
type ButtonProps = ComponentProps<typeof Button>

// Étendre pour créer une variante
interface SubmitButtonProps extends ButtonProps {
  form?: string
}

export function SubmitButton(props: SubmitButtonProps) {
  return <Button type="submit" variant="primary" {...props} />
}
```

### Pattern recommandé pour hiérarchie de composants

```typescript
// 1. Props de base (partagées par tous)
interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// 2. Composant principal = Base + HTML natif
interface ButtonProps extends BaseButtonProps,
  React.ButtonHTMLAttributes<HTMLButtonElement> {}

// 3. Variantes héritent du principal
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  'aria-label': string
}

interface LinkButtonProps extends BaseButtonProps,
  React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

// 4. Implémentation avec réutilisation
export function Button({ variant, size, isLoading, ...props }: ButtonProps) {
  // Logique du composant principal
}

export function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <Button {...props}>
      {icon}
    </Button>
  )
}

export function LinkButton({ variant, size, ...props }: LinkButtonProps) {
  // Réutilise les styles mais rend un <a>
  return <a className={getButtonStyles({ variant, size })} {...props} />
}
```

### Règles d'héritage

1. **Toujours étendre le composant principal** - Ne jamais redéfinir les mêmes props
2. **Utiliser Omit pour les props incompatibles** - Quand une prop doit être forcée
3. **Utiliser Pick pour simplifier** - Quand seules certaines props sont pertinentes
4. **Préserver les defaults** - Les valeurs par défaut du parent restent valides
5. **Documenter les différences** - Indiquer ce qui change par rapport au parent

## Generic Components

### Generic List Component

```typescript
export interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  emptyMessage?: string
}

export const List = <T,>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items'
}: ListProps<T>) => {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  )
}

// Usage
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

### Generic Select Component

```typescript
export interface SelectProps<T> {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getValue: (option: T) => string
}

export const Select = <T,>({
  options,
  value,
  onChange,
  getLabel,
  getValue
}: SelectProps<T>) => {
  return (
    <select
      value={value ? getValue(value) : ''}
      onChange={(e) => {
        const selected = options.find(
          (opt) => getValue(opt) === e.target.value
        )
        if (selected) onChange(selected)
      }}
    >
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  )
}
```

## Event Handler Types

### Common Event Types

```typescript
interface FormProps {
  // Form events
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void

  // Mouse events
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void

  // Keyboard events
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void

  // Change events
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

  // Focus events
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
}
```

### Simplified Handler Signatures

When you don't need the event object:

```typescript
export interface ButtonProps {
  onClick?: () => void  // Simple, no event needed
}

export interface InputProps {
  onChange?: (value: string) => void  // Just the value
}

// Implementation
export const Input = ({ onChange, ...props }: InputProps) => {
  return (
    <input
      {...props}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
```

## Ref Forwarding

### Basic Ref Forwarding

```typescript
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(/* ... */)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Generic Ref Forwarding

```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'

// Polymorphic component with ref
type PolymorphicRef<C extends React.ElementType> = ElementRef<C>

type PolymorphicProps<C extends React.ElementType> = {
  as?: C
} & ComponentPropsWithoutRef<C>
```

## Utility Types

### Pick and Omit

```typescript
// Pick specific props from larger interface
interface UserCardProps extends Pick<User, 'name' | 'email' | 'avatar'> {
  showActions?: boolean
}

// Omit props you'll handle differently
interface CustomInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void  // Simplified signature
}
```

### Partial and Required

```typescript
// All props optional
type OptionalUserCardProps = Partial<UserCardProps>

// Make specific props required
type RequiredUserCardProps = Required<Pick<UserCardProps, 'user'>> &
  Omit<UserCardProps, 'user'>
```

### Record for Variant Maps

```typescript
type Variant = 'primary' | 'secondary' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-200 text-gray-900',
  danger: 'bg-red-600 text-white',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}
```

## Type Inference

### Infer Types from Props

```typescript
// Define once, infer elsewhere
const buttonVariants = ['primary', 'secondary', 'ghost'] as const
type ButtonVariant = typeof buttonVariants[number]  // 'primary' | 'secondary' | 'ghost'

const sizes = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
} as const
type Size = keyof typeof sizes  // 'sm' | 'md' | 'lg'
```

### Component Return Types

```typescript
// Let TypeScript infer the return type
function Button({ children }: ButtonProps) {
  return <button>{children}</button>
}

// Explicit return type when needed
function Button({ children }: ButtonProps): React.ReactElement {
  return <button>{children}</button>
}

// For components that might return null
function ConditionalComponent({ show }: Props): React.ReactElement | null {
  if (!show) return null
  return <div>Content</div>
}
```

## Common Patterns

### Component with Subcomponents

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-lg border', className)} {...props} />
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('p-4 border-b', className)} {...props} />
}

function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('p-4', className)} {...props} />
}

// Attach subcomponents
Card.Header = CardHeader
Card.Content = CardContent

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### Controlled vs Uncontrolled Props

```typescript
interface InputProps {
  // Controlled
  value?: string
  onChange?: (value: string) => void

  // Uncontrolled
  defaultValue?: string
}

function Input({ value, onChange, defaultValue }: InputProps) {
  const isControlled = value !== undefined

  // Use controlled or uncontrolled behavior based on props
}
```
