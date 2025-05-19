<template>
  <div class="message-input">
    <el-input
      v-model="inputText"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      type="textarea"
      resize="none"
      rows="1"
      autosize
      @keydown.enter.prevent="handleEnter"
      ref="inputRef"
      class="custom-input"
    >
      <template #append>
        <el-button
          type="primary"
          :loading="disabled"
          :disabled="!inputText.trim()"
          @click="handleSend"
          class="send-button"
        >
          <el-icon><Position /></el-icon>
          <span>发送</span>
        </el-button>
      </template>
    </el-input>
    <div class="input-hint">
      按回车键发送，按Shift+回车键换行
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElInput, ElButton, ElIcon } from 'element-plus';
import { Position } from '@element-plus/icons-vue';

const props = defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'send', value: string): void;
}>();

const inputText = ref('');
const inputRef = ref<InstanceType<typeof ElInput> | null>(null);

const placeholder = computed(() => {
  return props.disabled ? '等待响应中...' : '输入您的问题...';
});

const handleEnter = (e: KeyboardEvent) => {
  // Only send on Enter without shift key
  if (!e.shiftKey && inputText.value.trim()) {
    handleSend();
  }
};

const handleSend = () => {
  if (inputText.value.trim() && !props.disabled) {
    emit('send', inputText.value);
    inputText.value = '';
    
    // Focus the input after sending
    setTimeout(() => {
      if (inputRef.value && inputRef.value.$el) {
        const textarea = inputRef.value.$el.querySelector('textarea');
        if (textarea) textarea.focus();
      }
    }, 10);
  }
};

onMounted(() => {
  if (inputRef.value && inputRef.value.$el) {
    const textarea = inputRef.value.$el.querySelector('textarea');
    if (textarea) textarea.focus();
  }
});
</script>

<style scoped>
.message-input {
  width: 100%;
  position: relative;
}

.custom-input {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  padding-right: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--neutral-200);
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: white;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

:deep(.el-textarea__inner) {
  resize: none;
  padding: 12px 16px;
  min-height: 24px !important;
  max-height: 150px !important;
  line-height: 1.5;
  font-size: 1rem;
  color: var(--neutral-800);
}

:deep(.el-input-group__append) {
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  padding: 0;
  background-color: var(--primary-color);
  border: none;
}

.input-hint {
  color: var(--neutral-500);
  font-size: 0.7rem;
  margin-top: 6px;
  text-align: right;
  padding-right: 8px;
}

.send-button {
  border: none;
  background-color: transparent;
  color: white;
  height: 100%;
  padding: 0 16px;
  font-size: 0.9rem;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.send-button:hover {
  background-color: var(--primary-dark);
}

.send-button:disabled {
  background-color: var(--primary-light);
  color: white;
}

.send-button .el-icon {
  font-size: 1rem;
}
</style> 