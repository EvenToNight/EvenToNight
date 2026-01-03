<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  sendMessage: [content: string]
}>()

const messageText = ref('')
const inputRef = ref<HTMLTextAreaElement>()

function sendMessage() {
  if (messageText.value.trim()) {
    emit('sendMessage', messageText.value.trim())
    messageText.value = ''
    adjustHeight()
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function adjustHeight() {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px'
  }
}
</script>

<template>
  <div class="message-input">
    <q-btn flat round icon="emoji_emotions" color="grey-7" class="emoji-btn">
      <q-tooltip>Emoji</q-tooltip>
    </q-btn>

    <div class="input-wrapper">
      <textarea
        ref="inputRef"
        v-model="messageText"
        placeholder="Scrivi un messaggio"
        class="text-input"
        rows="1"
        @keydown="handleKeyPress"
        @input="adjustHeight"
      />
    </div>

    <q-btn
      v-if="messageText.trim()"
      flat
      round
      icon="send"
      color="primary"
      class="send-btn"
      @click="sendMessage"
    >
      <q-tooltip>Invia</q-tooltip>
    </q-btn>
  </div>
</template>

<style scoped lang="scss">
.message-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--q-background);
  border-top: 1px solid var(--q-separator-color);
  min-height: 62px;

  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: var(--q-input-background);
    border-radius: 24px;
    padding: 9px 12px;
    min-height: 42px;

    .text-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 15px;
      line-height: 20px;
      resize: none;
      max-height: 120px;
      overflow-y: auto;
      color: var(--q-text-primary);
      font-family: inherit;

      &::placeholder {
        color: var(--q-text-secondary);
      }

      // Custom scrollbar
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--q-separator-color);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--q-text-secondary);
      }
    }
  }

  .emoji-btn,
  .attach-btn,
  .mic-btn {
    flex-shrink: 0;
  }

  .send-btn {
    flex-shrink: 0;
    color: var(--q-primary);
  }
}

// Dark mode support
.body--dark {
  .message-input {
    background-color: #202c33;
    border-top-color: #2a3942;

    .input-wrapper {
      background-color: #2a3942;
    }
  }
}
</style>
