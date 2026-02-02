import { computed, type ComputedRef } from 'vue'
import { useQuasar } from 'quasar'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'

const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

export interface UseBreakpointsReturn {
  isMobile: ComputedRef<boolean>
}

export function useBreakpoints(): UseBreakpointsReturn {
  const $q = useQuasar()

  //TODO: check if is possible to set $q.sreen.lt.mobile
  const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)

  return {
    isMobile,
  }
}
