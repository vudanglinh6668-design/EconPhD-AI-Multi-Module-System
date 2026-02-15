
export type ModuleType = 'SUPERVISOR' | 'DATA_SCIENTIST' | 'REFEREE' | 'POLICY' | 'EDITOR';

export interface AIModule {
  id: ModuleType;
  name: string;
  role: string;
  description: string;
  icon: string;
  prompt: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  moduleType: ModuleType;
  timestamp: number;
}
