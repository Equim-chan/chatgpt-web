<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NInput, NInputNumber, useMessage } from 'naive-ui'
import { useSettingStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { t } from '@/locales'

const settingStore = useSettingStore()

const ms = useMessage()

const systemMessage = ref(settingStore.systemMessage ?? '')
const temperature = ref(settingStore.temperature ?? '')
const topP = ref(settingStore.topP ?? '')

function updateSettings(options: Partial<SettingsState>) {
  settingStore.updateSetting(options)
  ms.success(t('common.success'))
}

function handleReset() {
  settingStore.resetSetting()
  ms.success(t('common.success'))
  window.location.reload()
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.role') }}</span>
        <div class="flex-1">
          <NInput v-model:value="systemMessage" :autosize="{ minRows: 3, maxRows: 15 }" type="textarea" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ systemMessage })">
          {{ $t('common.save') }}
        </NButton>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Temperature</span>
        <div class="flex-1">
          <NInputNumber v-model:value="temperature" :step="0.01" :precision="2" :min="0" :max="2" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ temperature })">
          {{ $t('common.save') }}
        </NButton>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">Top-P</span>
        <div class="flex-1">
          <NInputNumber v-model:value="topP" :step="0.01" :precision="2" :min="0" :max="1" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ topP })">
          {{ $t('common.save') }}
        </NButton>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">&nbsp;</span>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
      </div>
    </div>
  </div>
</template>
