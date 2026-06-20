// /src/types.ts
export interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  price: string;
  area: string;
  shortDescription: string;
  longDescription: string;
  features: string[];
  imageUrl: string;
  investmentHighlights: string[];
  investmentScore?: number;
  isRoadTouch?: boolean;
  isPmrdaApproved?: boolean;
  isVerified?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  properties?: Property[]; // For function call results
  suggestions?: string[];
}
