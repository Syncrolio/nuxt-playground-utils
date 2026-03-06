import { defineEventHandler } from 'h3'
import type { PlaygroundRuntimeConfig } from '../../../playground/types'

export default defineEventHandler(() => {
  const runtimeConfig = useRuntimeConfig() as {
    playgroundUtils?: PlaygroundRuntimeConfig
  }

  return {
    utils: runtimeConfig.playgroundUtils?.utils || [],
  }
})
