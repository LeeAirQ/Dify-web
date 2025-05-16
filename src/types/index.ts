// 消息类型定义
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thoughts?: AgentThought[];  // Agent思考过程
  files?: MessageFile[];      // 消息附件，如图片
}

// Agent思考过程
export interface AgentThought {
  id: string;
  position: number;
  thought: string;
  observation: string;
  tool?: string;
  tool_input?: string;
  message_files?: string[];
}

// 消息文件（如图片）
export interface MessageFile {
  id: string;
  type: string;
  url: string;
  belongs_to: 'user' | 'assistant';
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 聊天请求参数
export interface ChatRequest {
  query: string;
  conversation_id?: string | null;
  user_id: string;
}

// 聊天响应
export interface ChatResponse {
  message_id: string;
  conversation_id: string;
  content: string;
} 