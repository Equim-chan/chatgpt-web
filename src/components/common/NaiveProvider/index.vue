<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { dequal } from 'dequal/lite'
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
import { t } from '@/locales'

function registerNaiveTools() {
  window.$loadingBar = useLoadingBar()
  window.$dialog = useDialog()
  window.$message = useMessage()
  window.$notification = useNotification()
}

async function backgroundSync() {
  let oldState = JSON.parse(localStorage.getItem('chatStorage') || '{}')
  delete oldState.data?.active

  try {
    const { data: remoteState } = await get({ url: '/v1/chat-storage' })
    if (remoteState.data) {
      delete remoteState.data.active
      if (!dequal(remoteState, oldState)) {
        window.$dialog?.warning({
          title: t('sync.inconsistentData'),
          content: t('sync.inconsistentDataPrompt'),
          positiveText: t('common.yes'),
          negativeText: t('common.no'),
          onPositiveClick: () => {
            remoteState.data.active = remoteState.data.history?.[0]?.uuid
            localStorage.setItem('chatStorage', JSON.stringify(remoteState))
            window.location.reload()
          },
          onNegativeClick: () => {
            window.$message?.warning(t('sync.autoUpload.disabled'))
          },
        })
        return
      }
    }
  }
  catch (err) {
    window.$message?.error(t('sync.download.failed'))
    console.error(err)
    return
  }

  const interval = 3000
  window.$message?.info(t('sync.autoUpload.enabled'))

  let recentState = oldState
  while (true) {
    await new Promise(resolve => setTimeout(resolve, interval))
    try {
      const newState = JSON.parse(localStorage.getItem('chatStorage') || '{}')
      delete newState.data?.active
      if (!dequal(oldState, newState) && dequal(recentState, newState)) {
        await post({ url: '/v1/chat-storage', data: newState })
        window.$message?.success(t('sync.autoUpload.success'))
      }
      oldState = recentState
      recentState = newState
    }
    catch (err) {
      window.$message?.error(t('sync.autoUpload.failed'))
      console.error(err)
    }
  }
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
