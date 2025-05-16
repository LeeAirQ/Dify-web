<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-content">
        <div class="logo-area">
          <div class="logo">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 14.8333C20 19.5167 12 23.5 12 23.5C12 23.5 4 19.5167 4 14.8333C4 12.2731 5.05357 9.81848 6.92893 8.05178C8.8043 6.28509 11.3478 5.3 14 5.3C16.6522 5.3 19.1957 6.28509 21.0711 8.05178C22.9464 9.81848 24 12.2731 24 14.8333Z" fill="url(#paint0_linear)"/>
              <path d="M15 14.5C15 15.0523 14.5523 15.5 14 15.5C13.4477 15.5 13 15.0523 13 14.5C13 13.9477 13.4477 13.5 14 13.5C14.5523 13.5 15 13.9477 15 14.5Z" fill="white"/>
              <path d="M14 12C13.6685 12 13.3505 11.8711 13.1129 11.6429C12.8754 11.4147 12.7425 11.1092 12.7368 10.7879C12.7312 10.4666 12.8533 10.1567 13.0826 9.92059C13.3119 9.68452 13.6246 9.54522 13.9559 9.53479C14.2871 9.52437 14.6079 9.64374 14.8519 9.86415C15.0959 10.0846 15.25 10.3896 15.2901 10.7179C15.3302 11.0462 15.254 11.3779 15.0752 11.6599C14.8964 11.9419 14.6265 12.1565 14.31 12.26L14.31 13.25C14.31 13.3828 14.2573 13.5094 14.1635 13.601C14.0698 13.6926 13.9412 13.744 13.8075 13.744C13.6738 13.744 13.5452 13.6926 13.4515 13.601C13.3577 13.5094 13.305 13.3828 13.305 13.25L13.305 12C13.305 11.8672 13.3577 11.7406 13.4515 11.649C13.5452 11.5574 13.6738 11.506 13.8075 11.506C13.9411 11.506 14.0696 11.5574 14.1633 11.649C14.2571 11.7406 14.3097 11.8672 14.3097 12H14C14 12 14 12 14 12Z" fill="white"/>
              <path d="M11 1.5C11 2.05228 10.5523 2.5 10 2.5C9.44772 2.5 9 2.05228 9 1.5C9 0.947715 9.44772 0.5 10 0.5C10.5523 0.5 11 0.947715 11 1.5Z" fill="white"/>
              <path d="M7 3.5C7 4.05228 6.55228 4.5 6 4.5C5.44772 4.5 5 4.05228 5 3.5C5 2.94772 5.44772 2.5 6 2.5C6.55228 2.5 7 2.94772 7 3.5Z" fill="white"/>
              <path d="M5 7.5C5 8.05228 4.55228 8.5 4 8.5C3.44772 8.5 3 8.05228 3 7.5C3 6.94772 3.44772 6.5 4 6.5C4.55228 6.5 5 6.94772 5 7.5Z" fill="white"/>
              <path d="M7 10.5C7 11.0523 6.55228 11.5 6 11.5C5.44772 11.5 5 11.0523 5 10.5C5 9.94772 5.44772 9.5 6 9.5C6.55228 9.5 7 9.94772 7 10.5Z" fill="white"/>
              <path d="M19 3.5C19 4.05228 18.5523 4.5 18 4.5C17.4477 4.5 17 4.05228 17 3.5C17 2.94772 17.4477 2.5 18 2.5C18.5523 2.5 19 2.94772 19 3.5Z" fill="white"/>
              <path d="M21 7.5C21 8.05228 20.5523 8.5 20 8.5C19.4477 8.5 19 8.05228 19 7.5C19 6.94772 19.4477 6.5 20 6.5C20.5523 6.5 21 6.94772 21 7.5Z" fill="white"/>
              <path d="M19 10.5C19 11.0523 18.5523 11.5 18 11.5C17.4477 11.5 17 11.0523 17 10.5C17 9.94772 17.4477 9.5 18 9.5C18.5523 9.5 19 9.94772 19 10.5Z" fill="white"/>
              <defs>
                <linearGradient id="paint0_linear" x1="4" y1="5.3" x2="20" y2="23.5" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#7C3AED"/>
                  <stop offset="1" stop-color="#6D28D9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="app-title">Dify AI-Web</h1>
        </div>
        <el-button v-if="hasMessages" class="clear-button" @click="handleClearChat" size="small">
          <el-icon><Delete /></el-icon>
          <span>清除对话</span>
        </el-button>
      </div>
    </div>

    <div ref="chatContainerRef" class="messages-container">
      <!-- Empty state -->
      <div v-if="!hasMessages" class="empty-state">
        <div class="welcome-message">
          <h2>欢迎使用 Dify AI 助手</h2>
          <p>我可以帮助您回答问题、提供信息或者进行轻松对话。</p>
        </div>
        
        <div class="examples-container">
          <h3>试试这些示例：</h3>
          <div class="example-prompts">
            <div 
              v-for="(prompt, index) in examplePrompts" 
              :key="index" 
              class="example-prompt"
              @click="useExamplePrompt(prompt)"
            >
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ prompt }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat messages -->
      <template v-else>
        <MessageItem 
          v-for="(message, index) in chatMessages" 
          :key="index" 
          :message="message" 
        />
      </template>

      <!-- Loading indicator -->
      <div v-if="isLoading && hasUserInput" class="loading-container">
        <div class="loading-indicator">
          <span>正在处理您的请求...</span>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        <el-alert
          title="出错了"
          type="error"
          :description="error"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <div class="input-container">
      <MessageInput 
        :disabled="isLoading" 
        @send="handleSendMessage" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import MessageInput from '../components/MessageInput.vue';
import MessageItem from '../components/MessageItem.vue';
import { Delete, ChatRound, ChatDotRound } from '@element-plus/icons-vue';

const chatStore = useChatStore();
const chatMessages = computed(() => chatStore.messages);
const isLoading = computed(() => chatStore.isLoading);
const error = computed(() => chatStore.error);
const chatContainerRef = ref<HTMLElement | null>(null);
const examplePrompts = ref([
  '您能帮我写一篇关于人工智能的短文吗？',
  '请解释初链的区块链基本原理',
  '李恒是谁？',
  '给我讲一个有关勇气的故事'
]);

const hasMessages = computed(() => chatMessages.value.length > 0);
const hasUserInput = computed(() => chatMessages.value.some(m => m.role === 'user'));
const hasAssistantMessage = computed(() => chatMessages.value.some(m => m.role === 'assistant'));

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    const container = chatContainerRef.value;
    container.scrollTop = container.scrollHeight;
  }
};

const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;
  
  try {
    await chatStore.sendMessage(message);
    await scrollToBottom();
  } catch (err) {
    console.error('发送消息失败:', err);
  }
};

const handleClearChat = () => {
  chatStore.clearMessages();
};

const useExamplePrompt = (prompt: string) => {
  handleSendMessage(prompt);
};

onMounted(() => {
  // 加载页面时滚动到底部
  scrollToBottom();
});

// 监听消息列表变化，自动滚动到底部
watch(
  chatMessages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  background-color: var(--neutral-50);
}

.chat-header {
  background-color: white;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--neutral-800);
  margin: 0;
}

.clear-button {
  color: var(--neutral-600);
  background-color: transparent;
  border: 1px solid var(--neutral-300);
  display: flex;
  align-items: center;
  gap: 4px;
}

.clear-button:hover {
  color: var(--error-color);
  border-color: var(--error-color);
  background-color: #FEF2F2;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 0 1rem;
  margin-top: -4rem;
}

.welcome-message {
  margin-bottom: 2.5rem;
  max-width: 600px;
}

.welcome-message h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.75rem;
}

.welcome-message p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--neutral-600);
}

.examples-container {
  width: 100%;
  max-width: 700px;
}

.examples-container h3 {
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--neutral-700);
  font-size: 1.1rem;
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.example-prompt {
  padding: 1rem;
  background-color: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.5;
  color: var(--neutral-700);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
}

.example-prompt .el-icon {
  color: var(--primary-color);
  margin-top: 0.125rem;
}

.example-prompt:hover {
  background-color: var(--primary-bg);
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.loading-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.loading-indicator {
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 2rem;
  color: var(--primary-color);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.error-message {
  margin: 1rem 0;
}

.input-container {
  padding: 1rem;
  background-color: white;
  border-top: 1px solid var(--neutral-200);
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

/* 媒体查询适配不同屏幕尺寸 */
@media (max-width: 768px) {
  .chat-container {
    padding: 0;
  }
  
  .example-prompts {
    grid-template-columns: 1fr;
  }
  
  .messages-container {
    padding: 1rem 0.75rem;
  }
}
</style> 