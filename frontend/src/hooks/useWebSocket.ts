import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  roomId: string;
  timestamp: number;
}

interface WebSocketHook {
  sendMessage: <T>(destination: string, message: T) => void;
  client: React.MutableRefObject<Client | null>;
  isConnected: boolean;
}

export const useWebSocket = (
  userId: string,
  roomId: string,
  onMessageReceived?: (data: any) => void,
  onSignalReceived?: (data: any) => void,
  onConnectionStatusChange?: (status: boolean) => void
): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const client = useRef<Client | null>(null);
  const subscriptions = useRef<{ [key: string]: StompSubscription }>({});
  const processedMessages = useRef<Set<string>>(new Set());
  const isSubscribing = useRef<boolean>(false);
  const connectionAttempts = useRef<number>(0);
  const isInitialConnection = useRef<boolean>(true);

  const subscribe = useCallback(() => {
    if (!client.current?.connected || isSubscribing.current) return;

    isSubscribing.current = true;

    try {
      // unsubscribe all existing subscriptions
      Object.values(subscriptions.current).forEach((sub) => sub?.unsubscribe());
      subscriptions.current = {};

      // subscribe to chat room
      subscriptions.current.chat = client.current.subscribe(
        `/topic/room.${roomId}`,
        (message) => {
          const data = JSON.parse(message.body);
          const messageId = `${data.type}-${data.timestamp}-${data.senderId}`;

          if (!processedMessages.current.has(messageId)) {
            processedMessages.current.add(messageId);
            onMessageReceived?.(data);
          }
        }
      );

      // subscribe to signal
      subscriptions.current.signal = client.current.subscribe(
        `/queue/signal.${userId}`,
        (message) => {
          const data = JSON.parse(message.body);
          onSignalReceived?.(data);
        }
      );

      if (isInitialConnection.current) {
        onConnectionStatusChange?.(true);
        isInitialConnection.current = false;
      }

      console.log("Successfully subscribed to all channels");
    } catch (error) {
      console.error("Error during subscription:", error);
    } finally {
      isSubscribing.current = false;
    }
  }, [
    roomId,
    userId,
    onMessageReceived,
    onSignalReceived,
    onConnectionStatusChange,
  ]);

  const connect = useCallback(() => {
    if (client.current?.connected || isSubscribing.current) return;

    isSubscribing.current = true;

    try {
      const stompClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        connectHeaders: {
          "X-User-Id": userId,
        },
        onConnect: () => {
          console.log("WebSocket connected");
          setIsConnected(true);
          connectionAttempts.current = 0;
          isSubscribing.current = false;
          subscribe();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          setIsConnected(false);
          isSubscribing.current = false;
          onConnectionStatusChange?.(false);
          handleReconnect();
        },
        onWebSocketClose: () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
          isSubscribing.current = false;
          onConnectionStatusChange?.(false);
          handleReconnect();
        },
      });

      client.current = stompClient;
      stompClient.activate();
    } catch (error) {
      console.error("Error during connection:", error);
      isSubscribing.current = false;
      handleReconnect();
    }
  }, [userId, subscribe, onConnectionStatusChange]);

  const handleReconnect = useCallback(() => {
    if (connectionAttempts.current < 5 && !isConnected) {
      console.log(`Reconnecting attempt ${connectionAttempts.current + 1}/5`);
      setTimeout(() => {
        connectionAttempts.current += 1;
        connect();
      }, 3000);
    } else {
      console.error("Maximum reconnection attempts exceeded");
    }
  }, [connect, isConnected]);

  const sendMessage = useCallback((destination: string, message: any) => {
    if (client.current?.connected) {
      client.current.publish({
        destination,
        body: JSON.stringify(message),
      });
    } else {
      console.warn(
        "Message sending failed: WebSocket connection not established"
      );
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      Object.values(subscriptions.current).forEach((sub) => {
        if (sub) sub.unsubscribe();
      });
      if (client.current?.connected) {
        client.current.deactivate();
      }
      setIsConnected(false);
    };
  }, [connect]);

  return { sendMessage, client, isConnected };
};
