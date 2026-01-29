<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const authStore = useAuthStore()

interface LanguageOption {
  code: string
  name: string
  nativeName: string
  flag: string
}

// Convert country code to flag emoji
const getFlagEmoji = (languageCode: string): string => {
  // Map language codes to country codes for flags.
  // This is necessary for languages like English ('en') where the language code
  // itself doesn't correspond to a country with a flag emoji ('GB' or 'US').
  const langToCountry: { [key: string]: string } = {
    en: 'GB', // Use Great Britain flag for English
  }

  const countryCode = langToCountry[languageCode] || languageCode

  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return '🌐'
  }
}

// Generate language names using Intl.DisplayNames API
const getLanguageInfo = (code: string): LanguageOption => {
  const englishNames = new Intl.DisplayNames(['en'], { type: 'language' })
  const nativeNames = new Intl.DisplayNames([code], { type: 'language' })

  return {
    code,
    name: englishNames.of(code) || code.toUpperCase(),
    nativeName: nativeNames.of(code) || code.toUpperCase(),
    flag: getFlagEmoji(code),
  }
}

const availableLanguages = computed(() => {
  return SUPPORTED_LOCALES.map((langCode) => getLanguageInfo(langCode))
})

const selectLanguage = async (langCode: string) => {
  locale.value = langCode
  await authStore.updateUser({ language: langCode })
}
</script>

<template>
  <div class="language-tab">
    <div class="language-header">
      <h2 class="language-title">Language Preferences</h2>
      <p class="language-subtitle">Choose your preferred language for the application</p>
    </div>

    <div class="language-list">
      <button
        v-for="language in availableLanguages"
        :key="language.code"
        class="language-item"
        :class="{ active: locale === language.code }"
        @click="selectLanguage(language.code)"
      >
        <div class="language-flag">{{ language.flag }}</div>
        <div class="language-info">
          <div class="language-name">{{ language.nativeName }}</div>
          <div class="language-english-name">{{ language.name }}</div>
        </div>
        <q-icon
          v-if="locale === language.code"
          name="check_circle"
          size="24px"
          class="check-icon"
        />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.language-tab {
  padding: $spacing-6;
  max-width: 800px;
}

.language-header {
  margin-bottom: $spacing-6;
}

.language-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  margin: 0 0 $spacing-2 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.language-subtitle {
  font-size: $font-size-sm;
  color: $color-gray-600;
  margin: 0;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
}

.language-item {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  background: $color-white;
  border: 2px solid $color-gray-200;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  text-align: left;

  @include dark-mode {
    background: $color-background-dark-soft;
    border-color: rgba($color-white, 0.1);
  }

  &:hover {
    border-color: $color-primary;
    background: rgba($color-primary, 0.02);
    transform: translateY(-1px);
    box-shadow: $shadow-sm;

    @include dark-mode {
      background: rgba($color-primary, 0.05);
    }
  }

  &.active {
    border-color: $color-primary;
    background: rgba($color-primary, 0.08);

    @include dark-mode {
      background: rgba($color-primary, 0.12);
    }

    .language-name {
      color: $color-primary;
      font-weight: $font-weight-semibold;
    }
  }
}

.language-flag {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.language-info {
  flex: 1;
}

.language-name {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-1;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.language-english-name {
  font-size: $font-size-sm;
  color: $color-gray-600;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.check-icon {
  color: $color-primary;
  flex-shrink: 0;
}
</style>
