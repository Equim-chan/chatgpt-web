<script setup lang="ts">
import { defineComponent, h } from 'vue'
import {
  NDialogProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  useDialog,
  useLoadingBar,
  useMessage,
  useNotification,
} from 'naive-ui'
import { post } from '@/utils/request'

function registerNaiveTools() {
  window.$loadingBar = useLoadingBar()
  window.$dialog = useDialog()
  window.$message = useMessage()
  window.$notification = useNotification()
}

function backgroundSync() {
  const interval = 10000
  window.$message?.info(`Auto upload enabled, interval ${interval} ms`)

  let oldStateJSON = ''
  setInterval(async () => {
    try {
      const newStateJSON = localStorage.getItem('chatStorage') || '{}'
      if (oldStateJSON === newStateJSON) {
        return
      }
      await post({ url: '/v1/chat-storage', data: JSON.parse(newStateJSON) })
      oldStateJSON = newStateJSON
    } catch (err) {
      window.$message?.error('Auto upload failed')
      console.error(err)
    }
  }, interval)
}

const NaiveProviderContent = defineComponent({
  name: 'NaiveProviderContent',
  setup() {
    registerNaiveTools()
    backgroundSync()
  },
  render() {
    return h('div')
  },
})
</script>

<template>
  <NLoadingBarProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <slot />
          <NaiveProviderContent />
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NLoadingBarProvider>
</template>
