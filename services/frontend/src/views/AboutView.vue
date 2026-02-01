<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode'
import NavigationBar from '@/components/navigation/NavigationBar.vue'
import { useTranslation } from '@/composables/useTranslation'

const darkMode = useDarkMode()
const { t } = useTranslation('views.AboutView')
</script>
<template>
  <div
    :class="darkMode.isActive ? 'bg-grey-10' : 'bg-grey-2'"
    :style="{ minHeight: '100vh', overflowY: 'auto' }"
  >
    <NavigationBar />
    <div style="max-width: 800px" class="q-mx-auto q-pt-lg q-pt-md-xl">
      <h1 class="text-h3 text-weight-bold q-mb-xl text-center">{{ t('title') }}</h1>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('firstSectionTitle') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('firstSectionContent') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('secondSectionTitle') }}</h2>
        <p class="text-body1 q-mb-md" style="line-height: 1.8">
          {{ t('secondSectionContent') }}
        </p>
      </section>

      <section class="q-mb-xl">
        <h2 class="text-h5 text-weight-medium q-mb-md">{{ t('thirdSectionTitle') }}</h2>
        <div class="column q-gutter-sm">
          <q-card flat bordered class="q-pa-md">
            <div class="text-body1">
              <span class="text-primary text-weight-bold q-mr-sm">✓</span>
              {{ t('thirdSectionItems.item1') }}
            </div>
          </q-card>
          <q-card flat bordered class="q-pa-md">
            <div class="text-body1">
              <span class="text-primary text-weight-bold q-mr-sm">✓</span>
              {{ t('thirdSectionItems.item2') }}
            </div>
          </q-card>
          <q-card flat bordered class="q-pa-md">
            <div class="text-body1">
              <span class="text-primary text-weight-bold q-mr-sm">✓</span>
              {{ t('thirdSectionItems.item3') }}
            </div>
          </q-card>
        </div>
      </section>
    </div>
  </div>
</template>
