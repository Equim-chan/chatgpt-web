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
import { get, post } from '@/utils/request'

function registerNaiveTools() {
  window.$loadingBar = useLoadingBar()
  window.$dialog = useDialog()
  window.$message = useMessage()
  window.$notification = useNotification()
}

async function backgroundSync() {
  let oldStateJSON = localStorage.getItem('chatStorage') || '{}'

  try {
    const { data: body } = await get({ url: '/v1/chat-storage' })
    const remoteJSON = JSON.stringify(body)

    if (remoteJSON !== oldStateJSON) {
      const overrideLocal = await new Promise(resolve => {
        window.$dialog?.warning({
          title: 'Inconsistent Data',
          content: 'There are differences between your local and remote storage. Do you want to overwrite local data?',
          positiveText: 'Yes',
          negativeText: 'No',
          onPositiveClick: () => resolve(true),
          onNegativeClick: () => resolve(false),
          onEsc: () => resolve(false),
        })
      })
      if (!overrideLocal) {
        window.$message?.warning('Auto upload is disabled')
        return
      }
      localStorage.setItem('chatStorage', remoteJSON)
      window.location.reload()
    }
  } catch (err) {
    window.$message?.error('Download failed')
    console.error(err)
    return
  }

  const interval = 3000
  window.$message?.info('Auto upload is enabled')

  let recentStateJSON = oldStateJSON
  setInterval(async () => {
    try {
      const newStateJSON = localStorage.getItem('chatStorage') || '{}'
      if (oldStateJSON !== newStateJSON && recentStateJSON === newStateJSON) {
        await post({ url: '/v1/chat-storage', data: JSON.parse(newStateJSON) })
      }
      oldStateJSON = recentStateJSON
      recentStateJSON = newStateJSON
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
