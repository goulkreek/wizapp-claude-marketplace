---
# Configuration du plugin React Component
# Copiez ce fichier dans .claude/react-component.local.md de votre projet

# Chemin vers le dossier des composants (relatif à la racine du projet)
componentsPath: src/components

# Convention de nommage des fichiers
# Options: PascalCase, kebab-case, camelCase
namingConvention: PascalCase

# Extension des fichiers de composants
fileExtension: tsx

# Utilitaire pour les classes conditionnelles
# Options: cn, clsx, classnames, twMerge
classUtility: cn

# Chemin vers l'utilitaire cn (pour les imports)
classUtilityPath: "@/lib/utils"

# Générer automatiquement les types dans un fichier séparé
separateTypes: false

# Ajouter automatiquement au fichier index.ts du dossier
autoExport: false

# Préfixe optionnel pour les noms de composants
# componentPrefix: App

# Suffixe optionnel pour les noms de composants
# componentSuffix: Component
---

# Configuration React Component

Ce fichier configure le comportement du plugin React Component pour ce projet.

## Conventions du projet

- Les composants sont placés dans `src/components/`
- Utilisation de Tailwind CSS avec l'utilitaire `cn()` de `@/lib/utils`
- Fichiers en PascalCase (ex: `Button.tsx`)
- Types inline dans le même fichier
- Named exports (pas de default export)

## Structure attendue des composants

```typescript
import { ComponentPropsWithoutRef, FC } from 'react'
import { cn } from '@/lib/utils'

export interface ComponentNameProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'primary'
  // ... autres props
}

export const ComponentName: FC<ComponentNameProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('base-classes', className)}
      {...props}
    >
      {children}
    </div>
  )
}
```

## Variants standards

- `variant`: Style visuel (primary, secondary, ghost, danger, outline)
- `size`: Taille (sm, md, lg, xl)
- `color`: Couleur (si différent de variant)

## Notes

Ajoutez ici des notes spécifiques à votre projet concernant les conventions de composants.
