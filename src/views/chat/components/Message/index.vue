<script setup lang='ts'>
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import { NDropdown } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { useUserStore } from '@/store'
import { t } from '@/locales'
import { useBasicLayout } from '@/hooks/useBasicLayout'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
}

interface Emit {
  (e: 'update:text', text: string): void
  (e: 'editSubmit', text: string): void
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const { iconRender } = useIconRender()

const textRef = ref<InstanceType<typeof TextComponent>>()

const edit = ref<boolean>(false)

const origTextRef = ref<string | null>()

const childValue = computed<string>({
  get() {
    return props.text || ''
  },
  set(value) {
    emit('update:text', value)
  },
})

const asRawText = ref(false)

const messageRef = ref<HTMLElement>()

const options = computed(() => [
  {
    label: t('chat.copy'),
    key: 'copyText',
    icon: iconRender({ icon: 'ri:file-copy-2-line' }),
  },
  {
    label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
    key: 'toggleRenderType',
    icon: iconRender({ icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code' }),
  },
  {
    label: t('common.delete'),
    key: 'delete',
    icon: iconRender({ icon: 'ri:delete-bin-line' }),
  },
])

function handleSelect(key: 'copyText' | 'toggleRenderType' | 'delete') {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      return
    case 'toggleRenderType':
      asRawText.value = !asRawText.value
      return
    case 'delete':
      emit('delete')
  }
}

function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

function handleEdit() {
  origTextRef.value = childValue.value
  edit.value = true
  nextTick(() => textRef.value?.inputRef?.focus())
}

function handleEditSubmit(text: string) {
  origTextRef.value = null
  emit('editSubmit', text)
  edit.value = false
}

function handleEditCancel() {
  if (origTextRef.value != null) {
    childValue.value = origTextRef.value
    origTextRef.value = null
  }
  edit.value = false
}

onBeforeUnmount(() => {
  if (origTextRef.value != null) {
    childValue.value = origTextRef.value
  }
})

// for ArrowUp trigger
defineExpose({ handleEdit })
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        <span v-if="!inversion">{{ userInfo.aiName }}&nbsp;</span>
        <span class="text-[#b4bbc4]/50">{{ dateTime }}</span>
        <span v-if="inversion">&nbsp;{{ userInfo.name }}</span>
      </p>
      <div
        class="flex items-end gap-1 mt-2"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >
        <TextComponent
          ref="textRef"
          v-model:text="childValue"
          :inversion="inversion"
          :error="error"
          :loading="loading"
          :as-raw-text="asRawText"
          :edit="edit"
          @edit-cancel="handleEditCancel"
          @edit-submit="handleEditSubmit"
        />
        <div class="flex flex-col">
          <button
            v-if="inversion && !edit"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleEdit"
          >
            <SvgIcon icon="ri:edit-box-line" />
          </button>
          <button
            v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon icon="ri:restart-line" />
          </button>
          <NDropdown
            :trigger="isMobile ? 'click' : 'hover'"
            :placement="!inversion ? 'right' : 'left'"
            :options="options"
            @select="handleSelect"
          >
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>
