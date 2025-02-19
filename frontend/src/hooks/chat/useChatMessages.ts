import { useState, useCallback, useRef, useEffect } from "react";
import { useWebSocket } from "../useWebSocket";

interface UseChatMessagesProps {
  roomId: string;
  userId: string;
  userName: string;
  webRTCHandlers: any;
}

export const useChatMessages = ({
  roomId,
  userId,
  userName,
  webRTCHandlers,
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [_, setParticipants] = useState<string[]>([]);
  const webRTCHandlersRef = useRef(webRTCHandlers);
  const joinTimeRef = useRef<{ [key: string]: number }>({});
  const pendingOffersRef = useRef<Set<string>>(new Set());
  const connectionInitialized = useRef<boolean>(false);

  useEffect(() => {
    webRTCHandlersRef.current = webRTCHandlers;
  }, [webRTCHandlers]);

  const handleMessageReceived = useCallback(
    (data: any) => {
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    },
    [roomId]
  );

  const handleSignalReceived = useCallback(
    (data: any) => {
      const { type, senderId } = data;

      if (type === "JOIN") {
        const lastJoinTime = joinTimeRef.current[senderId];
        const currentTime = Date.now();

        if (lastJoinTime && currentTime - lastJoinTime < 2000) {
          console.log("[useChatMessages] Ignoring duplicate JOIN signal");
          return;
        }

        if (pendingOffersRef.current.has(senderId)) {
          console.log("[useChatMessages] Offer already pending for:", senderId);
          return;
        }

        joinTimeRef.current[senderId] = currentTime;
        pendingOffersRef.current.add(senderId);

        setTimeout(() => {
          if (webRTCHandlersRef.current) {
            console.log("[useChatMessages] Creating offer for:", senderId);
            webRTCHandlersRef.current.createOffer(senderId);
          }
          pendingOffersRef.current.delete(senderId);
        }, 1000);
      }
      if (!webRTCHandlersRef.current) {
        console.warn("WebRTC handlers not initialized");
        return;
      }

      const { handleOffer, handleAnswer, handleIceCandidate } =
        webRTCHandlersRef.current;

      switch (type) {
        case "OFFER":
          if (data.signal) {
            console.log("Handling offer from:", senderId);
            handleOffer(data.signal, senderId);
          }
          break;
        case "ANSWER":
          if (data.signal) {
            console.log("Handling answer from:", senderId);
            handleAnswer(data.signal, senderId);
          }
          break;
        case "ICE_CANDIDATE":
          if (data.signal) {
            console.log("Handling ICE candidate from:", senderId);
            handleIceCandidate(data.signal, senderId);
          }
          break;
      }
    },
    [userId]
  );

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/rooms/${roomId}/webrtc-participants`,
        {
          headers: {
            "X-User-Id": userId,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch participants: ${response.status}`);
      const participantList = await response.json();
      setParticipants(participantList);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  }, [roomId, userId]);

  const handleConnectionStatus = useCallback(
    (status: boolean) => {
      if (status && !connectionInitialized.current) {
        console.log("Initial WebSocket connection established");
        fetchParticipants();
        connectionInitialized.current = true;
      }
    },
    [fetchParticipants]
  );

  const { sendMessage } = useWebSocket(
    userId,
    roomId,
    handleMessageReceived,
    handleSignalReceived,
    handleConnectionStatus
  );

  const addMessage = useCallback(
    (content: string) => {
      const message = {
        type: "CHAT",
        roomId,
        senderId: userId,
        senderName: userName,
        content,
        timestamp: Date.now(),
      };
      sendMessage("/app/chat.message", message);
    },
    [roomId, userId, userName, sendMessage]
  );

  return {
    messages,
    addMessage,
    sendMessage,
  };
};
