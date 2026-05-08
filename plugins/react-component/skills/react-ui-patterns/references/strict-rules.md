# Règles strictes pour la création de composants React

Ces règles s'appliquent à **tout** code de composant React, sans exception. Elles complètent les patterns d'héritage et de composition documentés dans `SKILL.md` et `typescript-patterns.md`.

## TypeScript — règles absolues

### Interdiction totale de `any`

❌ **Jamais** :
```typescript
const data: any = fetchData()
const handler = (e: any) => {}
function process(input: any): any {}
```

✅ **Alternatives** :
```typescript
// unknown + type guard
const data: unknown = fetchData()
if (isUser(data)) { /* data est typé User */ }

// Génériques
function process<T>(input: T): T { return input }

// Union types
function format(input: string | number): string { return String(input) }
```

### Interdiction des casts `as` / `<Type>`

❌ **Jamais** :
```typescript
const user = data as User
const user = <User>data
```

✅ **Alternative** : type guards
```typescript
const isUser = (obj: unknown): obj is User =>
  typeof obj === 'object' && obj !== null && 'id' in obj

if (isUser(data)) {
  // TypeScript sait que data est User
}
```

### Types stricts pour toutes les props

- Toujours **exporter l'interface** : `export interface XxxProps`
- Toujours typer les paramètres et retours de fonctions
- Toujours préférer un type spécifique à un primitif générique :
  - `'pending' | 'active' | 'done'` plutôt que `string`
  - Branded types (`type UserId = string & { __brand: 'UserId' }`) pour les IDs
  - Template literal types (`` `${number}-${number}` ``) pour les formats précis

## Style — arrow functions partout

### Pas de `function` declarations

❌ **Jamais** :
```typescript
function MyComponent({ name }: Props) {
  return <div>{name}</div>
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, i) => sum + i.price, 0)
}
```

✅ **Toujours** :
```typescript
const MyComponent: FC<Props> = ({ name }) => <div>{name}</div>

const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, i) => sum + i.price, 0)
```

**Raison** : cohérence du style, hoisting prévisible, `this` lexical.

## JSX — pas d'IIFE

### Interdiction des fonctions immédiatement invoquées dans JSX

❌ **Jamais** :
```tsx
<div>
  {(() => {
    const firstImage = files?.find(f => f.mimeType.startsWith('image/'))
    return firstImage ? <ImagePreview src={firstImage.data} /> : null
  })()}
</div>
```

**Pourquoi c'est interdit** : une IIFE dans le JSX est *toujours* le signe d'un composant manquant. Son corps a un nom, des props implicites (variables capturées), et une responsabilité unique.

✅ **Refactoring** : extraire un composant nommé.
```tsx
interface FirstImagePreviewProps {
  files?: EmbeddedFile[]
}

const FirstImagePreview: FC<FirstImagePreviewProps> = ({ files }) => {
  const firstImage = files?.find(f => f.mimeType.startsWith('image/'))
  if (!firstImage) return null
  return <ImagePreview src={firstImage.data} />
}

// Usage
<div>
  <FirstImagePreview files={files} />
</div>
```

**Cas tolérés** : ternaire (`?:`) ou `&&` court (≤ 1 ligne) directement dans le JSX. Au-delà, c'est un composant.

## Architecture par couches

### UI / Container / Feature

Découper les composants selon leur responsabilité :

- **UI** (`components/ui/`) — purement visuels, **zéro logique métier**, zéro accès store/API
- **Container** — gèrent la logique, les données, l'état
- **Feature** — assemblent UI + Container pour livrer une fonctionnalité

```typescript
// ❌ MAUVAIS - tout mélangé
const UserCard: FC<{ userId: string }> = ({ userId }) => {
  const { data } = useQuery(GET_USER, { variables: { id: userId } })
  return <div className="card">{data?.user.name}</div>
}

// ✅ BON - séparation
// UI pur
export interface UserCardUIProps {
  user: User
  onEdit?: () => void
}
const UserCardUI: FC<UserCardUIProps> = ({ user, onEdit }) => (
  <div className="card">
    <span>{user.name}</span>
    {onEdit && <button onClick={onEdit}>Modifier</button>}
  </div>
)

// Container
export interface UserCardContainerProps {
  userId: string
}
const UserCardContainer: FC<UserCardContainerProps> = ({ userId }) => {
  const { data } = useQuery(GET_USER, { variables: { id: userId } })
  if (!data) return null
  return <UserCardUI user={data.user} />
}
```

## Recherche avant création

### Règle des 70%

**Avant** de créer un nouveau composant :

1. Chercher avec Grep/Glob s'il existe un composant similaire
2. Si un composant existant couvre **≥ 70% du besoin** : l'**adapter** plutôt que d'en créer un nouveau
3. Techniques d'extension :
   - Prop `variant` ou `preset`
   - Props `allowedXXX` ou `enableXXX`
   - Props `renderXXX` (render props)
   - Composition avec `children` ou slots nommés

```typescript
// Plutôt que créer AdminUserCard et CompactUserCard séparément :
export interface UserCardProps {
  user: User
  variant?: 'compact' | 'detailed' | 'admin'  // ← variant au lieu de N composants
  allowedActions?: Array<'edit' | 'delete' | 'view'>
  showAvatar?: boolean
}
```

**Rétrocompatibilité** : les nouvelles props doivent avoir des **valeurs par défaut** qui préservent le comportement existant.

## Limites de taille

| Élément       | Limite max | Action si dépassé          |
| ------------- | ---------- | -------------------------- |
| Fichier       | ~300 lignes | Découper en modules        |
| Fonction      | ~40 lignes  | Extraire en sous-fonctions |
| Complexité cyclomatique | 10 branches | Refactoriser     |

## Formulaires — React Hook Form + Zod

### Stack obligatoire

- **react-hook-form** + **@hookform/resolvers/zod** + **zod**
- **Interdit** : yup, class-validator, validation manuelle inline

### Structure recommandée

```typescript
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Minimum 2 caractères'),
})

type FormData = z.infer<typeof schema>

export interface MyFormProps {
  onSubmit: (data: FormData) => Promise<void>
  initialValues?: Partial<FormData>
}

export const MyForm: FC<MyFormProps> = ({ onSubmit, initialValues }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { email: '', name: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => <input type="email" {...field} />}
      />
      {errors.email && <span>{errors.email.message}</span>}
      {/* ... */}
    </form>
  )
}
```

## Asynchrone — promises plutôt que callbacks

### Règles

- **Toujours préférer `async/await`** aux callbacks
- **Interdit** : `callback hell`, mélanger callbacks et promises dans la même chaîne
- Si une API tierce n'expose que des callbacks : **promisifier le plus bas possible** dans un wrapper utilitaire (`lib/promisify-xxx.ts`), puis utiliser `await` partout ailleurs
- Pas de `.then().catch()` mélangé avec `async/await` dans la même fonction

```typescript
// ❌ MAUVAIS
api.fetchUser(id, (err, user) => {
  if (err) return handleError(err)
  api.fetchPosts(user.id, (err, posts) => { /* callback hell */ })
})

// ✅ BON - promisifier au plus bas
// lib/promisify-api.ts
export const fetchUser = (id: string): Promise<User> =>
  new Promise((resolve, reject) => {
    api.fetchUser(id, (err, user) => err ? reject(err) : resolve(user))
  })

// Composant
const user = await fetchUser(id)
const posts = await fetchPosts(user.id)
```

## Pas de magic numbers/strings

❌ **Jamais** :
```tsx
<div style={{ width: 380 }}>...</div>
if (status === 'pending') {}
setTimeout(handler, 5000)
```

✅ **Toujours** : extraire en constantes nommées
```tsx
const SIDEBAR_WIDTH_PX = 380
const STATUS_PENDING = 'pending'
const RETRY_DELAY_MS = 5000

<div style={{ width: SIDEBAR_WIDTH_PX }}>...</div>
```

Les constantes partagées vont dans `constants/` ou un fichier dédié au domaine.

## Pas de code mort, pas de TODO sans ticket

- **Pas de code commenté** : git le conserve, supprime
- **Pas de TODO sans ticket** : chaque `TODO` doit référencer un ticket existant ou être résolu immédiatement
- **Imports inutilisés** : toujours les supprimer
- **Variables inutilisées** : toujours les supprimer (sauf `_var` intentionnel)

## Stories Ladle — obligatoires si Ladle est installé

### Détection

Avant de créer ou modifier un composant, vérifier si **Ladle** est installé dans le projet :

```bash
# Présence dans package.json (dépendance ou devDependency)
grep -E '"@ladle/react"' package.json

# Ou présence d'un script ladle
grep -E '"ladle"' package.json
```

Indicateurs alternatifs :
- Dossier `.ladle/` à la racine du projet
- Fichiers `*.stories.tsx` existants dans la codebase
- Script `ladle` ou `ladle serve` dans `package.json`

### Si Ladle est installé

**Obligation** : pour **chaque composant créé ou modifié**, créer ou mettre à jour le fichier de stories correspondant.

**Convention de nommage** : `<ComponentName>.stories.tsx`, à côté du composant.

```
components/
└── ui/
    ├── Button.tsx
    ├── Button.stories.tsx       ← obligatoire si Ladle est installé
    ├── UserCard.tsx
    └── UserCard.stories.tsx     ← obligatoire si Ladle est installé
```

**Couverture des stories** : exposer au minimum :

1. Une story **par variante** (chaque valeur de `variant`, `size`, etc.)
2. Une story pour chaque **état important** (loading, error, empty, disabled)
3. Les **edge cases** visuels pertinents (texte long, sans avatar, beaucoup d'items…)

### Template Ladle

```typescript
import type { Story } from '@ladle/react'
import { Button, type ButtonProps } from './Button'

export default {
  title: 'UI / Button',
}

export const Primary: Story<ButtonProps> = (args) => <Button {...args} />
Primary.args = {
  variant: 'primary',
  children: 'Bouton principal',
}

export const Secondary: Story<ButtonProps> = (args) => <Button {...args} />
Secondary.args = {
  variant: 'secondary',
  children: 'Bouton secondaire',
}

export const Loading: Story<ButtonProps> = (args) => <Button {...args} />
Loading.args = {
  variant: 'primary',
  isLoading: true,
  children: 'Chargement…',
}

export const Disabled: Story<ButtonProps> = (args) => <Button {...args} />
Disabled.args = {
  variant: 'primary',
  disabled: true,
  children: 'Désactivé',
}
```

### Mise à jour lors d'une modification

Si tu **modifies** un composant existant (nouvelle prop, nouveau variant, nouveau comportement) :

- Ajouter une story qui exerce la nouvelle fonctionnalité
- Mettre à jour les stories existantes si leur comportement change
- Ne jamais laisser une story qui ne compile plus

### Si Ladle n'est PAS installé

**Action obligatoire** : avant de continuer, **proposer à l'utilisateur** d'installer Ladle. Exemple de message :

> Le projet n'a pas Ladle installé. Veux-tu l'ajouter pour documenter visuellement les composants ? Cela me permettra de créer des stories pour chaque composant créé/modifié.
>
> Installation : `pnpm add -D @ladle/react`
> Script à ajouter dans `package.json` : `"ladle": "ladle serve"`

**Si l'utilisateur refuse** : continuer sans stories, mais le **noter explicitement** dans la réponse pour qu'il en soit conscient.

**Si l'utilisateur accepte** :
1. Installer Ladle (`pnpm add -D @ladle/react` ou équivalent npm/yarn)
2. Ajouter le script `ladle` dans `package.json`
3. Créer la configuration `.ladle/config.mjs` minimale si nécessaire
4. Créer les stories pour le composant en cours

## Tests — 100% de couverture sur le code touché

### Obligation

Tout code **ajouté ou modifié** dans un composant doit avoir une couverture **100%** sur :

- **Statements** : chaque instruction exécutée
- **Branches** : chaque `if/else`, `?:`, `||`, `??`, early-return testé dans les deux sens
- **Functions** : chaque fonction exportée ou interne appelée
- **Lines** : chaque ligne exécutable couverte

### Exigences pratiques

1. Chaque branche d'un `switch`/`case` doit avoir un test (utiliser `it.each` pour factoriser)
2. Chaque early-return doit avoir un test qui le déclenche **et** un qui le franchit
3. Chaque erreur levée doit être testée avec `expect(...).toThrow(...)`
4. Chaque valeur limite (`undefined`, `null`, tableau vide) doit être testée

### Interdit

- ❌ Tests triviaux pour gonfler la couverture (`expect(true).toBe(true)`)
- ❌ `// istanbul ignore` sans justification motivée et ciblée
- ❌ Tests de getters/setters triviaux sans valeur métier

## SOLID, DRY, KISS, YAGNI

- **Single Responsibility** : un composant = une seule chose
- **Open/Closed** : extensible sans modification du code existant (props variant, render props)
- **Liskov** : les composants spécialisés respectent le contrat du parent (héritage `extends`)
- **Interface Segregation** : props fines et spécifiques (pas de méga-objet)
- **Dependency Inversion** : dépendre des abstractions (props/contextes), pas des implémentations
- **DRY** : toute logique dupliquée > 2 fois → extraire en hook ou utilitaire
- **KISS** : la solution la plus simple qui résout le problème
- **YAGNI** : ne pas implémenter "au cas où"

## Conventions transversales du projet

### Langue

- **Tous les commentaires, messages d'erreur et textes UI** en français
- Les identifiants (variables, fonctions, types) restent en anglais standard de programmation

### Git

- Format de commit : `type(scope): description concise`
- Types : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- **Ne jamais** mentionner Claude, Claude Code, IA, "Co-Authored-By: Claude", "Generated with Claude Code"
- Les commits doivent paraître écrits par un développeur humain
- Ne jamais mélanger refactoring et feature dans le même commit

### Documentation

- Ne créer des fichiers `.md`, README ou ADR **que sur demande explicite**
- Les commentaires de code se justifient seulement quand le **pourquoi** est non-obvious

## Checklist avant de finaliser un composant

- [ ] Aucun `any`, aucun cast `as` / `<Type>`
- [ ] Toutes les fonctions sont des arrow functions (`const fn = () => {}`)
- [ ] Aucune IIFE dans le JSX
- [ ] Interface `XxxProps` exportée
- [ ] Composants spécialisés `extends` l'interface du parent
- [ ] Variant/preset utilisés plutôt que duplication
- [ ] Composant existant cherché avant création (règle 70%)
- [ ] Fichier ≤ 300 lignes, fonctions ≤ 40 lignes
- [ ] Magic numbers/strings extraits en constantes
- [ ] Imports inutilisés supprimés
- [ ] Tests couverture 100% sur code ajouté/modifié
- [ ] Story Ladle créée/mise à jour si Ladle est installé (sinon proposé à l'utilisateur)
- [ ] Si formulaire : react-hook-form + zod (pas de yup)
- [ ] Pas de code commenté, pas de TODO sans ticket
- [ ] Linter et typecheck passent sans erreur
