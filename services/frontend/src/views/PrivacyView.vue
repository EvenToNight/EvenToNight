<script setup lang="ts">
import { onMounted } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import NavigationBar from '@/components/navigation/NavigationBar.vue'
import { useTranslation } from '@/composables/useTranslation'

const darkMode = useDarkMode()
const { t } = useTranslation('views.PrivacyView')

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<template>
  <div :class="darkMode.isActive ? 'bg-grey-10' : 'bg-grey-2'" :style="{ minHeight: '100vh' }">
    <NavigationBar />
    <div style="max-width: 800px" class="q-mx-auto q-pt-lg q-pt-md-xl q-pb-xl">
      <h1 class="text-h3 text-weight-bold q-mb-md text-center">{{ t('title') }}</h1>
      <p class="text-caption text-center q-mb-xl" style="opacity: 0.7">
        {{ t('lastUpdated') }}
      </p>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('sections.firstSection.title') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('sections.firstSection.content') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('sections.secondSection.title') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('sections.secondSection.content') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('sections.thirdSection.title') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('sections.thirdSection.content') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('sections.fourthSection.title') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('sections.fourthSection.content') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('sections.fifthSection.title') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('sections.fifthSection.content') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('sections.sixthSection.title') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('sections.sixthSection.content') }}
        </p>
      </section>
    </div>
  </div>
</template>
