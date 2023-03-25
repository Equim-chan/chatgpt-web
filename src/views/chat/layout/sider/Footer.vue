<script setup lang='ts'>
import { defineAsyncComponent, ref, nextTick } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { get, post } from '@/utils/request'
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
// import { t } from '@/locales' // ReferenceError: can't access lexical declaration 'store' before initialization

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const ms = useMessage()
const dialog = useDialog()

function downloadChat() {
  dialog.warning({
    title: 'Download',
    content: 'Download from server and override local data?',
    positiveText: 'Yes',
    negativeText: 'No',
    onPositiveClick: () => {
      nextTick(async () => {
        try {
          const { data: remoteState } = await get({ url: '/v1/chat-storage' })
          remoteState.data.active = remoteState.data.history?.[0]?.uuid
          localStorage.setItem('chatStorage', JSON.stringify(remoteState))
          ms.success('Download success')
          location.reload()
        } catch (error) {
          ms.error('Download failed')
          console.error(error)
        }
      })
    },
  })
}

function uploadChat() {
  dialog.warning({
    title: 'Upload',
    content: 'Upload to server and override remote data?',
    positiveText: 'Yes',
    negativeText: 'No',
    onPositiveClick: () => {
      nextTick(async () => {
        try {
          const chatStorage = JSON.parse(localStorage.getItem('chatStorage') || '{}')
          delete chatStorage.data?.active
          await post({url: '/v1/chat-storage', data: chatStorage})
          ms.success('Upload success')
        } catch (error) {
          ms.error('Upload failed')
          console.error(error)
        }
      })
    },
  })
}

const showSetting = ref(false)
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div>

    <HoverButton @click="uploadChat">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:upload-cloud-2-fill" />
      </span>
    </HoverButton>
    <HoverButton @click="downloadChat">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:download-cloud-2-fill" />
      </span>
    </HoverButton>
    <HoverButton @click="showSetting = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>

    <Setting v-if="showSetting" v-model:visible="showSetting" />
  </footer>
</template>
