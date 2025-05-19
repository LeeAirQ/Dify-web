import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Message, AgentThought, MessageFile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import type { chatApi as ChatApiType } from '../api';

// 导入实际的 chatApi 对象
import { chatApi } from '../api';

// 流式事件处理器接口
interface StreamEventHandlers {
  onMessage?: (chunk: string) => void;
  onThought?: (data: any) => void;
  onFile?: (data: any) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const streamingMessageId = ref<string | null>(null);

  // 计算属性
  const lastMessage = computed(() => {
    return messages.value.length > 0 
      ? messages.value[messages.value.length - 1] 
      : null;
  });

  // 动作
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // 清除错误
    error.value = null;
    
    // 创建并添加用户消息
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    
    messages.value.push(userMessage);
    
    // 创建并添加助手空消息
    const assistantMessageId = uuidv4();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      thoughts: [],
      files: []
    };
    
    messages.value.push(assistantMessage);
    
    try {
      isLoading.value = true;
      streamingMessageId.value = assistantMessageId;
      
      // 当前活动的思考过程
      let currentThought: AgentThought | null = null;
      
      // 调用流式API
      await chatApi.sendStreamMessage(content, {
        // 处理文本消息
        onMessage: (chunk: string) => {
          const index = messages.value.findIndex(m => m.id === assistantMessageId);
          if (index !== -1) {
            messages.value[index].content += chunk;
          }
        },
        
        // 处理Agent思考过程
        onThought: (data: any) => {
          const index = messages.value.findIndex(m => m.id === assistantMessageId);
          if (index === -1) return;
          
          // 确保有thoughts数组
          if (!messages.value[index].thoughts) {
            messages.value[index].thoughts = [];
          }
          
          // 检查是否已存在该思考
          const thoughtIndex = messages.value[index].thoughts!.findIndex(t => t.id === data.id);
          
          if (thoughtIndex !== -1) {
            // 更新现有思考
            messages.value[index].thoughts![thoughtIndex] = {
              ...messages.value[index].thoughts![thoughtIndex],
              position: data.position,
              thought: data.thought || messages.value[index].thoughts![thoughtIndex].thought,
              observation: data.observation || messages.value[index].thoughts![thoughtIndex].observation,
              tool: data.tool || messages.value[index].thoughts![thoughtIndex].tool,
              tool_input: data.tool_input || messages.value[index].thoughts![thoughtIndex].tool_input,
              message_files: data.message_files || messages.value[index].thoughts![thoughtIndex].message_files
            };
          } else {
            // 添加新思考
            messages.value[index].thoughts!.push({
              id: data.id,
              position: data.position,
              thought: data.thought || '',
              observation: data.observation || '',
              tool: data.tool || '',
              tool_input: data.tool_input || '',
              message_files: data.message_files || []
            });
          }
        },
        
        // 处理文件（如图片）
        onFile: (data: any) => {
          const index = messages.value.findIndex(m => m.id === assistantMessageId);
          if (index === -1) return;
          
          // 确保有files数组
          if (!messages.value[index].files) {
            messages.value[index].files = [];
          }
          
          // 添加文件信息
          messages.value[index].files!.push({
            id: data.id,
            type: data.type,
            url: data.url,
            belongs_to: 'assistant'
          });
        },
        
        // 处理完成
        onComplete: () => {
          console.log('流式响应完成');
        },
        
        // 处理错误
        onError: (errorMsg: string) => {
          error.value = errorMsg;
          console.error('流式请求错误:', errorMsg);
        }
      });
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : '发送消息失败';
      console.error('Error sending message:', e);
    } finally {
      isLoading.value = false;
      streamingMessageId.value = null;
    }
  };

  const clearMessages = () => {
    messages.value = [];
    error.value = null;
  };

  const removeMessage = (id: string) => {
    messages.value = messages.value.filter(m => m.id !== id);
  };

  return {
    // 状态
    messages,
    isLoading,
    error,
    streamingMessageId,
    
    // 计算属性
    lastMessage,
    
    // 动作
    sendMessage,
    clearMessages,
    removeMessage
  };
}); 