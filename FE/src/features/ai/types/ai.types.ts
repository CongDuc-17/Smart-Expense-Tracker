export interface OcrResult {
  id: string;
  merchantName: string | null;
  categoryId?: string | null;
  totalAmount: string | null; 
  transactionDate: string | null;
  confidenceScore: number | null;
  isVerified: boolean;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface ImageAnalysis {
  id: string;
  suggestedCategoryId: string | null;
  suggestedCategory?: { id: string; name: string; icon: string; color: string };
  tags: string[];
  confidenceScore: number | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface ParsedAiInsightContent {
  overview: string;
  risks: string[];
  recommendations: string[];
  actions: string[];
}

export interface AiInsight {
  content: string; // Chuỗi JSON
  generatedAt: string;
  expiresAt: string;
  isCached: boolean;
}
