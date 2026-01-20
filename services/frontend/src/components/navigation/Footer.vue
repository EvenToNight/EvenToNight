<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useNavigation } from '@/router/utils'
import AppBrand from '@/components/common/AppBrand.vue'

const { t, locale, availableLocales } = useI18n()
const { changeLocale } = useNavigation()

const selectLanguage = (langCode: string) => {
  locale.value = langCode
  localStorage.setItem('user-locale', langCode)
  changeLocale(langCode)
}
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <AppBrand />

        <div class="footer-links">
          <a href="#" class="footer-link">{{ t('footer.about') }}</a>
          <a href="#" class="footer-link">{{ t('footer.events') }}</a>
          <a href="#" class="footer-link">{{ t('footer.contact') }}</a>
          <a href="#" class="footer-link">{{ t('footer.privacy') }}</a>
        </div>

        <div class="footer-language">
          <span
            v-for="lang in availableLocales"
            :key="lang"
            class="language-option"
            @click="selectLanguage(lang)"
          >
            {{ lang.toUpperCase() }}
          </span>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">{{ '© 2025 EvenToNight. ' + t('footer.copyright') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  width: 100%;
  margin-top: auto;

  @include light-mode {
    background-color: $color-background;
    border-top: 1px solid $color-border;
  }

  @include dark-mode {
    background-color: $color-background-dark;
    border-top: 1px solid $color-border-dark;
  }
}

.footer-container {
  margin: 0 auto;
  padding: $spacing-8;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.footer-content {
  @include flex-column-center;
  gap: $spacing-6;
  text-align: center;
}

.footer-links {
  @include flex-wrap-center;
  gap: $spacing-4;

  @media (max-width: $breakpoint-mobile) {
    gap: $spacing-3;
  }
}

.footer-language {
  @include flex-center;
  gap: $spacing-3;
}

.language-option {
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  padding: $spacing-1 $spacing-2;
  border-radius: $radius-base;
  transition: all $transition-base;
  user-select: none;

  @include light-mode {
    color: $color-text-muted;

    &:hover {
      color: $color-primary;
      background-color: rgba($color-primary, 0.1);
    }

    &.active {
      color: $color-white;
      background-color: $color-primary;
    }
  }

  @include dark-mode {
    color: rgba($color-text-dark, 0.7);

    &:hover {
      color: $color-primary;
      background-color: rgba($color-primary, 0.1);
    }

    &.active {
      color: $color-white;
      background-color: $color-primary;
    }
  }
}

.footer-link {
  text-decoration: none;
  font-size: $font-size-base;
  transition: color $transition-base;

  @include light-mode {
    color: $color-text-secondary;

    &:hover {
      color: $color-primary;
    }
  }

  @include dark-mode {
    color: $color-text-dark;

    &:hover {
      color: $color-primary;
    }
  }
}

.footer-bottom {
  width: 100%;
  padding-top: $spacing-4;

  @include light-mode {
    border-top: 1px solid $color-border;
  }

  @include dark-mode {
    border-top: 1px solid $color-border-dark;
  }
}

.footer-copyright {
  margin: 0;
  font-size: $font-size-sm;

  @include light-mode {
    color: $color-text-muted;
  }

  @include dark-mode {
    color: rgba($color-text-dark, 0.7);
  }
}
</style>
