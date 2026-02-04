---
description: Recherche des composants similaires dans le codebase
argument-hint: [description ou nom]
allowed-tools: Read, Glob, Grep
model: haiku
---

Search for existing React components similar to `$ARGUMENTS` in the codebase.

## Search Strategy

### Step 1: Name-based Search

Use Glob to find component files matching the description:
- `**/*.tsx` files containing component-like names
- Common component directories: `src/components/`, `components/`, `app/components/`
- Look for variations: Button, BaseButton, CustomButton, etc.

### Step 2: Functional Search

Use Grep to find components with similar functionality:
- Search for interface/type definitions matching the description
- Look for variant props related to the use case
- Find components with similar HTML elements (button, input, div, etc.)

### Step 3: Pattern Search

Search for components following similar patterns:
- Same variant props (variant, size, color)
- Same HTML attribute extensions
- Similar Tailwind class patterns

## Results Format

For each similar component found, report:

### Component: `[Name]`
- **Location**: `path/to/Component.tsx`
- **Similarity**: High/Medium/Low
- **Props**: List main props
- **Could extend**: Yes/No with explanation

## Recommendations

Based on findings:

1. **If exact match found**: Explain how to use existing component
2. **If similar found (70%+ match)**: Suggest extending with new variant/prop
3. **If no match**: Confirm safe to create new component

## Extension Examples

If suggesting extension, show how:

```typescript
// Option A: Add new variant
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'NEW_VARIANT'  // ← Add here
}

// Option B: Add feature flag
interface CardProps {
  showNewFeature?: boolean  // ← New optional prop
}

// Option C: Use composition
<ExistingCard>
  <CustomContent />  // ← Compose with existing
</ExistingCard>
```

Provide specific code suggestions for the user's use case.
