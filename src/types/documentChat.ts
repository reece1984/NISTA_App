export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export interface Citation {
  document_id: number;
  document_name: string;
  file_name: string;
  section: string | null;
  page_numbers: string | null;
  relevance_score: number;
  excerpt: string | null;
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  citations?: Citation[];
  error?: string;
}
