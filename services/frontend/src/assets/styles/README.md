# SCSS Styles Structure

This directory contains the SCSS styles for the Vue frontend application.

## Directory Structure

```
styles/
├── abstracts/
│   ├── _variables.scss    # Design tokens (colors, fonts, spacing, etc.)
│   ├── _mixins.scss       # Reusable SCSS mixins
│   └── _functions.scss    # SCSS utility functions
├── base/
│   └── _reset.scss        # CSS reset and base styles
├── components/
│   └── (component styles go here)
├── main.scss              # Main entry point - imports all partials
└── README.md              # This file
```

## Usage

### 1. Using Variables in Vue Components

In your Vue SFC (Single File Component), you can use the SCSS variables directly:

```vue
<template>
  <div class="my-component">
    <h1>Hello World</h1>
    <button class="primary-btn">Click Me</button>
  </div>
</template>

<style lang="scss" scoped>
// Variables are automatically available
.my-component {
  padding: $spacing-4;
  background-color: $color-background-soft;

  h1 {
    color: $color-primary;
    font-size: $font-size-3xl;
    margin-bottom: $spacing-6;
  }
}

.primary-btn {
  padding: $spacing-3 $spacing-6;
  background-color: $color-primary;
  color: $color-white;
  border-radius: $radius-lg;
  font-weight: $font-weight-semibold;
  transition: $transition-base;

  &:hover {
    background-color: $color-primary-dark;
    box-shadow: $shadow-lg;
  }
}
</style>
```

### 2. Using Mixins

```vue
<style lang="scss" scoped>
.card {
  @include card; // Applies padding, border-radius, and box-shadow
  @include hover-lift; // Adds hover effect
}

.container {
  @include container($breakpoint-lg, $spacing-4);
}

.centered-content {
  @include flex-center;
}

// Responsive design
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;

  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to('lg') {
    grid-template-columns: repeat(3, 1fr);
  }
}

// Dark mode
.themed-element {
  background-color: $color-white;
  color: $color-text-primary;

  @include dark-mode {
    background-color: $color-gray-900;
    color: $color-text-dark;
  }
}
</style>
```

### 3. Using Functions

```vue
<style lang="scss" scoped>
.element {
  // Convert px to rem
  padding: rem(24); // 1.5rem
  margin: rem(16); // 1rem

  // Spacing multiplier
  gap: spacing(2); // 2rem (32px)

  // Color with opacity
  background-color: color-alpha($color-primary, 0.1);
}
</style>
```

### 4. Making Variables Available in All Components

To automatically import variables and mixins in all Vue components, add this to `vite.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/abstracts/variables";
          @import "@/assets/styles/abstracts/mixins";
          @import "@/assets/styles/abstracts/functions";
        `
      }
    }
  }
})
```

This way, you don't need to manually import them in every component!

## Design Tokens Reference

### Colors

**Primary & Brand:**
- `$color-primary`, `$color-primary-dark`, `$color-primary-light`
- `$color-secondary`, `$color-secondary-dark`, `$color-secondary-light`
- `$color-accent`, `$color-accent-dark`, `$color-accent-light`

**Semantic:**
- `$color-success`, `$color-warning`, `$color-error`, `$color-info`

**Neutrals:**
- `$color-white`, `$color-black`
- `$color-gray-50` through `$color-gray-900`

### Typography

**Font Families:**
- `$font-family-base` - Inter (body text)
- `$font-family-heading` - Headings
- `$font-family-mono` - Code blocks

**Font Sizes:**
- `$font-size-xs` (12px) to `$font-size-6xl` (60px)

**Font Weights:**
- `$font-weight-light` (300) to `$font-weight-extrabold` (800)

### Spacing

**Scale:** `$spacing-0` through `$spacing-40` (0px to 160px)

**Semantic:**
- `$spacing-section`, `$spacing-container`, `$spacing-card`, etc.

### Border Radius

`$radius-none` through `$radius-3xl` and `$radius-full`

### Shadows

`$shadow-sm` through `$shadow-2xl`, `$shadow-inner`, `$shadow-none`

### Breakpoints

- `$breakpoint-xs` (475px)
- `$breakpoint-sm` (640px)
- `$breakpoint-md` (768px)
- `$breakpoint-lg` (1024px)
- `$breakpoint-xl` (1280px)
- `$breakpoint-2xl` (1536px)

## Customization

To customize the design tokens, edit the values in [abstracts/_variables.scss](abstracts/_variables.scss).

## Adding Component Styles

Create new component stylesheets in the `components/` directory:

```
components/
├── _buttons.scss
├── _cards.scss
├── _forms.scss
└── _navigation.scss
```

Then import them in `main.scss`:

```scss
@import 'components/buttons';
@import 'components/cards';
```

## Best Practices

1. **Use semantic variable names** - Use `$color-primary` instead of `$color-blue`
2. **Leverage mixins** - Don't repeat common patterns
3. **Scoped styles** - Use `<style scoped>` in Vue components
4. **Mobile-first** - Use `@include respond-to()` for responsive design
5. **Consistent spacing** - Use the spacing scale variables
6. **Dark mode support** - Use `@include dark-mode` for theme variations
