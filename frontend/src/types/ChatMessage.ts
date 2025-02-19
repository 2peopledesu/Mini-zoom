export enum MessageType {
  CHAT = "CHAT",
  IMAGE = "IMAGE",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  ICE_CANDIDATE = "ICE_CANDIDATE",
}

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  imageUrl?: string;
  timestamp: number;
}
