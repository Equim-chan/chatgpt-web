<script lang="ts" setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { NButton, NInput } from 'naive-ui'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
  asRawText?: boolean
  edit?: boolean
}

interface Emit {
  (e: 'update:text', text: string): void
  (e: 'editSubmit', text: string): void
  (ev: 'editCancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const inputRef = ref<HTMLElement>()

const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'px-3 py-2',
    'bg-[#f4f6f8]',
    'dark:bg-[#1e1e20]',
    { 'text-red-500': props.error },
    { 'loading': props.loading },
  ]
})

const text = computed(() => {
  const value = props.text ?? ''
  if (!props.asRawText && !props.edit)
    // the span is a dummy element just for rendering the blinking cursor even
    // when the value is empty
    return mdi.render(value) || '<span></span>'
  return value
})

function handleSubmit() {
  emit('editSubmit', text.value)
}

function handleCancel() {
  emit('editCancel')
}

function handleInput(v: string) {
  emit('update:text', v)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

function handleKeypress(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t('chat.copyCode')}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

defineExpose({ inputRef })
</script>

<template>
  <div :class="wrapClass">
    <div class="leading-relaxed break-words">
      <div v-if="edit" class="whitespace-pre-wrap">
        <NInput
          ref="inputRef"
          :value="text"
          type="textarea"
          :autosize="{ minRows: 5 }"
          @input="handleInput"
          @keypress="handleKeypress"
          @keydown="handleKeydown"
        />
        <div class="chat-edit-buttons">
          <NButton type="primary" @click="handleSubmit">
            {{ t('chat.saveAndSubmit') }}
          </NButton>
          <NButton @click="handleCancel">
            {{ t('chat.cancel') }}
          </NButton>
        </div>
      </div>
      <div v-else class="flex items-end">
        <div v-if="!asRawText && !edit" class="w-full markdown-body" v-html="text" />
        <div v-else class="w-full whitespace-pre-wrap" v-text="text" />
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import url(./style.less);
</style>
