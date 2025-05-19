import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import type { ChatRequest, ApiResponse, ChatResponse } from '../types';

// 类型定义
interface TextToAudioRequest {
  message_id?: string;
  text?: string;
  user: string;
}

interface TextToAudioResponse {
  audio: Blob;
}

interface StreamEventHandlers {
  onMessage?: (text: string) => void;
  onThought?: (thought: any) => void;
  onFile?: (file: any) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

// 配置常量
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_DIFY_API_BASE_URL || '/api',
  TOKEN: import.meta.env.VITE_DIFY_API_TOKEN || 'app-DVzi1K7It1YoZgtOInbI1wM8',
  HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_DIFY_API_TOKEN}`
  }
} as const;

// 错误处理工具
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API客户端类
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.HEADERS
    });

    // 添加响应拦截器
    this.client.interceptors.response.use(
      response => response,
      this.handleError
    );
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      const responseData = error.response.data as { message?: string; code?: string };
      throw new ApiError(
        responseData.message || '请求失败',
        error.response.status,
        responseData.code,
        error.response.data
      );
    }
    throw new ApiError(error.message || '网络错误');
  }

  // 发送常规消息
  async sendMessage(params: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await this.client.post('/chat-messages', {
        inputs: {},
        query: params.query,
        user: params.user_id,
        conversation_id: params.conversation_id,
        response_mode: 'blocking'
      });
      
      return {
        success: true,
        data: {
          message_id: response.data.id,
          conversation_id: response.data.conversation_id,
          content: response.data.answer
        }
      };
    } catch (error) {
      console.error('发送消息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 发送流式消息
  sendStreamMessage(query: string, handlers: StreamEventHandlers): void {
    const { onMessage, onThought, onFile, onComplete, onError } = handlers;
    
    const params = {
      inputs: {},
      query,
      user: 'user-' + Date.now(),
      response_mode: 'streaming'
    };
    
     // 使用完整的API URL
    const apiUrl = `${API_CONFIG.BASE_URL}/chat-messages`;
    
    
    console.log('发送流式请求:', apiUrl, params);
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.TOKEN}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(params)
    })
      .then(this.handleStreamResponse(onMessage, onThought, onFile, onComplete, onError))
      .catch(error => {
        console.error('流式请求失败:', error);
        onError?.(error.message);
      });
  }

  private handleStreamResponse(
    onMessage?: (text: string) => void,
    onThought?: (thought: any) => void,
    onFile?: (file: any) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) {
    return async (response: Response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processChunk = async () => {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('流式响应完成');
            onComplete?.();
            return;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              await this.processStreamLine(line, onMessage, onThought, onFile, onError);
            }
          }
          
          await processChunk();
        } catch (error) {
          console.error('处理流数据失败:', error);
          onError?.(error instanceof Error ? error.message : '处理流数据失败');
        }
      };

      await processChunk();
    };
  }

  private async processStreamLine(
    line: string,
    onMessage?: (text: string) => void,
    onThought?: (thought: any) => void,
    onFile?: (file: any) => void,
    onError?: (error: string) => void
  ) {
    try {
      const jsonStr = line.substring(5).trim();
      if (!jsonStr) return;
      
      const eventData = JSON.parse(jsonStr);
      
      switch (eventData.event) {
        case 'message':
        case 'agent_message':
          if (eventData.answer !== undefined) {
            onMessage?.(eventData.answer);
          }
          break;
          
        case 'agent_thought':
          onThought?.(eventData);
          break;
          
        case 'message_file':
          onFile?.(eventData);
          break;
          
        case 'message_end':
        case 'tts_message_end':
          console.log('接收到消息结束事件');
          break;
          
        case 'error':
          console.error('流中的错误:', eventData);
          onError?.(eventData.error || '流处理错误');
          break;
          
        default:
          console.log('未处理的事件类型:', eventData.event);
      }
    } catch (error) {
      console.error('处理流数据行失败:', error);
      onError?.(error instanceof Error ? error.message : '处理流数据行失败');
    }
  }

  // 文字转语音
  async textToAudio(params: TextToAudioRequest): Promise<ApiResponse<TextToAudioResponse>> {
    try {
      const requestBody = {
        text: params.text,
        message_id: params.message_id,
        user: params.user
      };

      console.log('发送文字转语音请求:', {
        url: `${API_CONFIG.BASE_URL}/text-to-audio`,
        body: requestBody
      });

      const response = await axios.post(`${API_CONFIG.BASE_URL}/text-to-audio`, requestBody, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          audio: response.data
        }
      };
    } catch (error) {
      console.error('文字转语音失败:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('错误详情:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
}

// 创建API客户端实例
const apiClient = new ApiClient();

// 导出API函数
export const chatApi = {
  sendMessage: apiClient.sendMessage.bind(apiClient),
  sendStreamMessage: apiClient.sendStreamMessage.bind(apiClient),
  textToAudio: apiClient.textToAudio.bind(apiClient)
};

// 为了向后兼容，也导出单独的函数
export const { sendMessage, sendStreamMessage, textToAudio } = chatApi; 
