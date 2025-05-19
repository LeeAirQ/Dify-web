<template>
  <div class="message" :class="messageClass">
    <div class="message-avatar">
      <el-avatar :icon="avatarIcon" :size="40" :class="message.role"></el-avatar>
    </div>
    <div class="message-content">
      <div class="message-role">{{ roleLabel }}</div>
      
      <!-- 思考过程面板 - 可折叠 -->
      <div v-if="hasThoughts" class="thought-panel">
        <div class="thought-header" @click="toggleThoughts">
          <el-icon :class="{ 'is-rotate': showThoughts }"><ArrowRight /></el-icon>
          <span>思考过程</span>
        </div>
        
        <div v-show="showThoughts" class="thought-content-panel">
          <!-- Agent思考过程显示区域 -->
          <div v-if="message.thoughts && message.thoughts.length > 0" class="agent-thoughts">
            <div v-for="thought in sortedThoughts" :key="thought.id" class="thought-item">
              <div v-if="thought.tool" class="thought-tool">
                <div class="tool-name">
                  <el-icon><SetUp /></el-icon>
                  {{ thought.tool }}
                </div>
                <div v-if="thought.tool_input" class="tool-input">{{ formatToolInput(thought.tool_input) }}</div>
              </div>
              <div v-if="thought.thought" class="thought-content">
                <div class="thought-label">思考:</div>
                <div class="thought-text">{{ thought.thought }}</div>
              </div>
              <div v-if="thought.observation" class="thought-observation">
                <div class="observation-label">观察:</div>
                <div class="observation-text">{{ thought.observation }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 文件内容（如图片）显示区域 -->
      <div v-if="message.files && message.files.length > 0" class="message-files">
        <div v-for="file in message.files" :key="file.id" class="file-item">
          <img v-if="file.type === 'image'" :src="file.url" :alt="file.id" class="image-file" />
          <div v-else class="file-placeholder">{{ file.type }} 文件</div>
        </div>
      </div>
      
      <!-- 消息文本内容 - 最终回答 -->
      <div class="message-bubble" :class="{ 'with-thoughts': hasThoughts }">
        <div v-if="message.isStreaming" class="message-typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <template v-else-if="message.content">
          <div class="message-text" v-html="safedContent"></div>
          <!-- 添加语音播放按钮 -->
          <div v-if="message.role === 'assistant'" class="message-actions">
            <el-button
              v-if="!isPlaying"
              type="primary"
              :icon="Microphone"
              circle
              size="small"
              @click="playAudio"
              :loading="isLoading"
            />
            <el-button
              v-else
              type="danger"
              :icon="VideoPause"
              circle
              size="small"
              @click="stopAudio"
            />
          </div>
        </template>
        <template v-else>
          <div class="message-text empty-content">空消息</div>
        </template>
      </div>
      <div class="message-time">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onUnmounted } from 'vue';
import { ElAvatar, ElIcon, ElButton, ElMessage } from 'element-plus';
import { UserFilled, ChatRound, ArrowRight, SetUp, Microphone, VideoPause } from '@element-plus/icons-vue';
import { Message, AgentThought } from '../types';
import { marked } from 'marked';
import { chatApi } from '../api';

const props = defineProps<{
  message: Message
}>();

// 是否显示思考过程
const showThoughts = ref(false);

// 切换思考过程显示/隐藏
const toggleThoughts = () => {
  showThoughts.value = !showThoughts.value;
};

// 是否有思考过程
const hasThoughts = computed(() => {
  return props.message.thoughts && props.message.thoughts.length > 0;
});

// 跟踪内容是否有变化
const contentChanged = ref(false);

// 监听消息内容变化
watch(
  () => props.message.content,
  (newContent, oldContent) => {
    if (newContent !== oldContent) {
      contentChanged.value = true;
      // 3秒后重置动画标志
      setTimeout(() => {
        contentChanged.value = false;
      }, 1000);
    }
  }
);

// 按位置排序的思考过程
const sortedThoughts = computed(() => {
  if (!props.message.thoughts) return [];
  return [...props.message.thoughts].sort((a, b) => a.position - b.position);
});

// 格式化工具输入参数
const formatToolInput = (input: string) => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return input;
  }
};

// Computed properties
const messageClass = computed(() => [
  `message-${props.message.role}`,
  { 'is-streaming': props.message.isStreaming },
  { 'content-changed': contentChanged.value }
]);

const avatarIcon = computed(() => {
  return props.message.role === 'user' ? UserFilled : ChatRound;
});

const roleLabel = computed(() => {
  return props.message.role === 'user' ? '您' : 'AI 助手';
});

// 安全渲染内容
const safedContent = computed(() => {
  if (!props.message.content) return '';
  
  try {
    // 尝试使用marked处理Markdown
    return marked(props.message.content, { breaks: true });
  } catch (err) {
    console.error('Markdown解析错误:', err);
    
    // 如果解析失败，返回简单的HTML转义版本
    return escapeHtml(props.message.content);
  }
});

// HTML转义函数
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

// 音频播放相关状态
const isPlaying = ref(false);
const isLoading = ref(false);
const audioPlayer = ref<HTMLAudioElement | null>(null);

// 播放音频
const playAudio = async () => {
  if (!props.message.content) return;
  
  try {
    isLoading.value = true;
    const response = await chatApi.textToAudio({
      text: props.message.content,
      user: 'user-' + Date.now()
    });

    if (response.success && response.data.audio) {
      // 创建音频URL
      const audioUrl = URL.createObjectURL(response.data.audio);
      
      // 创建或重用音频播放器
      if (!audioPlayer.value) {
        audioPlayer.value = new Audio();
        audioPlayer.value.onended = () => {
          isPlaying.value = false;
        };
      }
      
      audioPlayer.value.src = audioUrl;
      await audioPlayer.value.play();
      isPlaying.value = true;
    } else {
      console.error('获取音频失败:', response.error);
      // 添加用户友好的错误提示
      ElMessage.error('语音功能暂未启用，请联系管理员开启TTS功能');
    }
  } catch (error) {
    console.error('播放音频时出错:', error);
    // 添加用户友好的错误提示
    ElMessage.error('语音功能暂未启用，请联系管理员开启TTS功能');
  } finally {
    isLoading.value = false;
  }
};

// 停止音频播放
const stopAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
    isPlaying.value = false;
  }
};

// 组件卸载时清理
onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  }
});
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 24px;
  animation: fade-in 0.3s ease-in-out;
  position: relative;
  width: 100%;
}

.message-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.message-avatar :deep(.el-avatar) {
  box-shadow: var(--shadow-sm);
}

.message-avatar :deep(.user) {
  background-color: var(--primary-color);
}

.message-avatar :deep(.assistant) {
  background-color: var(--secondary-color);
}

.message-content {
  flex: 1;
  max-width: calc(100% - 52px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-role {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--neutral-600);
}

/* 思考面板样式 */
.thought-panel {
  margin-bottom: 10px;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: white;
  box-shadow: var(--shadow-sm);
}

.thought-header {
  padding: 8px 12px;
  background-color: var(--neutral-100);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--neutral-600);
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.thought-header:hover {
  background-color: var(--neutral-200);
}

.thought-header .el-icon {
  margin-right: 6px;
  transition: transform 0.3s;
  color: var(--neutral-500);
}

.thought-header .is-rotate {
  transform: rotate(90deg);
}

.thought-content-panel {
  padding: 12px;
  background-color: white;
}

/* Agent思考样式 */
.agent-thoughts {
  font-size: 0.9rem;
}

.thought-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--neutral-200);
}

.thought-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.thought-tool {
  background-color: var(--primary-bg);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 10px;
  border-left: 3px solid var(--primary-color);
}

.tool-name {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.tool-name .el-icon {
  margin-right: 6px;
}

.tool-input {
  font-family: var(--font-mono);
  white-space: pre-wrap;
  background-color: var(--neutral-100);
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  overflow-x: auto;
  color: var(--neutral-700);
}

.thought-content {
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 10px;
}

.thought-label, .observation-label {
  font-weight: 600;
  color: var(--neutral-600);
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.thought-text {
  color: var(--neutral-800);
}

.thought-observation {
  background-color: var(--secondary-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  border-left: 3px solid var(--secondary-color);
}

.observation-text {
  color: var(--neutral-800);
}

/* 文件显示样式 */
.message-files {
  margin-bottom: 10px;
}

.file-item {
  margin-bottom: 8px;
}

.image-file {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.file-placeholder {
  padding: 10px;
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  color: var(--neutral-600);
}

/* 消息气泡 */
.message-bubble {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  position: relative;
  word-break: break-word;
  box-shadow: var(--shadow-sm);
  background-color: white;
  border: 1px solid var(--neutral-200);
}

.message-bubble.with-thoughts {
  border-left: 3px solid var(--primary-color);
}

.message-time {
  font-size: 0.75rem;
  color: var(--neutral-500);
  margin-left: 2px;
}

.message-text {
  line-height: 1.6;
  font-size: 1rem;
  color: var(--neutral-800);
}

.empty-content {
  color: var(--neutral-500);
  font-style: italic;
}

.message-text :deep(p) {
  margin: 0 0 12px;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.message-text :deep(pre) {
  background-color: var(--neutral-100);
  border-radius: var(--radius-md);
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid var(--neutral-200);
}

.message-text :deep(code) {
  font-family: var(--font-mono);
  background-color: var(--neutral-100);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

.message-text :deep(ul), .message-text :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

/* 当内容更新时添加高亮效果 */
.content-changed .message-bubble {
  animation: highlight 1s ease-in-out;
}

@keyframes highlight {
  0%, 100% {
    background-color: white;
  }
  50% {
    background-color: var(--primary-bg);
  }
}

/* User message */
.message-user {
  flex-direction: row-reverse;
}

.message-user .message-avatar {
  margin-right: 0;
  margin-left: 12px;
}

.message-user .message-role {
  text-align: right;
}

.message-user .message-bubble {
  background-color: var(--primary-bg);
  border: 1px solid var(--primary-light);
  color: var(--neutral-800);
}

.message-user .message-time {
  text-align: right;
}

/* Typing animation */
.message-typing {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-light);
  margin: 0 3px;
  animation: typing 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.message-actions .el-button {
  padding: 6px;
}

.message-actions .el-button :deep(.el-icon) {
  font-size: 16px;
}
</style> 