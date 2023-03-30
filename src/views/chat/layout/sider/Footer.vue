<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
// import { t } from '@/locales' // ReferenceError: can't access lexical declaration 'store' before initialization

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const showSetting = ref(false)
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div>

    <HoverButton @click="showSetting = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>

    <Setting v-if="showSetting" v-model:visible="showSetting" />
  </footer>
</template>
