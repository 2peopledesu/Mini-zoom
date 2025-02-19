import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useWebRTC } from "../useWebRTC";
import { useChatMessages } from "./useChatMessages";
import { useFileUpload } from "./useFileUpload";
import { ParticipantUpdateMessage } from "../../types/ParticipantUpdateMessage";

interface UseChatRoomProps {
  roomId: string;
  userId: string;
  userName: string;
}

interface Participant {
  id: string;
  name: string;
  isActive: boolean;
}

interface StreamState {
  [peerId: string]: {
    stream: MediaStream;
    tracks: {
      audio: MediaStreamTrack | null;
      video: MediaStreamTrack | null;
    };
    status: "connecting" | "connected" | "disconnected";
  };
}

export const useChatRoom = ({ roomId, userId, userName }: UseChatRoomProps) => {
  const [streams, setStreams] = useState<StreamState>({});
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const webRTCHandlersRef = useRef<any>(null);
  const sendMessageRef = useRef<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(true);

  const { uploadFile, isLoading } = useFileUpload(userId);

  const handleRemoteStream = useCallback(
    (peerId: string, stream: MediaStream | null) => {
      console.log("[useChatRoom] handleRemoteStream called:", {
        peerId,
        streamId: stream?.id,
        caller: new Error().stack,
      });
      setStreams((prev) => {
        if (!stream) {
          const { [peerId]: _, ...rest } = prev;
          return rest;
        }

        // 트랙 활성화 확인
        stream.getTracks().forEach((track) => {
          if (!track.enabled) {
            track.enabled = true;
          }
        });

        return {
          ...prev,
          [peerId]: {
            stream,
            tracks: {
              audio: stream.getAudioTracks()[0] ?? null,
              video: stream.getVideoTracks()[0] ?? null,
            },
            status: "connected",
          },
        };
      });
    },
    []
  );

  const remoteStreamsForVideo = useMemo(() => {
    return Object.entries(streams).reduce((acc, [peerId, { stream }]) => {
      acc[peerId] = stream;
      return acc;
    }, {} as { [key: string]: MediaStream });
  }, [streams]);

  const { messages, sendMessage } = useChatMessages({
    roomId,
    userId,
    userName,
    webRTCHandlers: webRTCHandlersRef.current,
  });

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const {
    localStream,
    startLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  } = useWebRTC(
    userId,
    roomId,
    useCallback((signal) => {
      console.log("[useChatRoom] Sending signal:", signal);
      sendMessageRef.current?.(
        "/app/signal." + signal.type.toLowerCase(),
        signal
      );
    }, []),
    handleRemoteStream
  );

  // Store WebRTC handlers in ref
  useEffect(() => {
    webRTCHandlersRef.current = {
      handleOffer,
      handleAnswer,
      handleIceCandidate,
      createOffer,
    };
  }, [handleOffer, handleAnswer, handleIceCandidate, createOffer]);

  const joinRoom = useCallback(async () => {
    try {
      const joinResponse = await fetch(
        `http://localhost:8080/api/rooms/${roomId}/join`,
        {
          method: "POST",
          headers: {
            "X-User-Id": userId,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!joinResponse.ok) {
        throw new Error(`Failed to join room: ${joinResponse.status}`);
      }

      sendMessage("/app/chat.join", {
        roomId,
        senderId: userId,
        senderName: userName,
        type: "JOIN",
      });
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  }, [roomId, userId, userName, sendMessage]);

  const initialize = async () => {
    if (!isSubscribed) return;
    try {
      await startLocalStream(); // Start the local stream first
      await joinRoom(); // Then join the room
    } catch (error) {
      console.error("Failed to initialize chat room:", error);
    }
  };

  useEffect(() => {
    initialize();
    return () => {
      setIsSubscribed(false);
    };
  }, []);

  useEffect(() => {
    console.log("[useChatRoom] RemoteStreamState updated:", {
      count: Object.keys(streams).length,
      streams: Object.entries(streams).map(([peerId, { stream }]) => ({
        peerId,
        streamId: stream.id,
        tracks: stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        })),
      })),
    });
  }, [streams]);

  useEffect(() => {
    console.log("[useChatRoom] Component mounted with props:", {
      roomId,
      userId,
      userName,
      isSubscribed,
    });

    return () => {
      console.log("[useChatRoom] Component unmounting");
    };
  }, []);

  useEffect(() => {
    console.log("[useChatRoom] Streams state changed:", {
      streamCount: Object.keys(streams).length,
      streamIds: Object.entries(streams).map(([peerId, { stream }]) => ({
        peerId,
        streamId: stream.id,
        status: streams[peerId].status,
      })),
      stackTrace: new Error().stack,
    });
  }, [streams]);

  const handleParticipantUpdate = useCallback(
    (data: ParticipantUpdateMessage) => {
      setParticipants(
        data.participants.map((participantId: string) => ({
          id: participantId,
          name: participantId === userId ? userName : `User ${participantId}`,
          isActive: true,
        }))
      );
    },
    [userId, userName]
  );

  const handleStreamUpdate = useCallback(
    (peerId: string, stream: MediaStream) => {
      setStreams((prev) => ({
        ...prev,
        [peerId]: {
          stream,
          tracks: {
            audio: stream.getAudioTracks()[0] ?? null,
            video: stream.getVideoTracks()[0] ?? null,
          },
          status: "connected",
        },
      }));
    },
    []
  );

  const updateStream = useCallback(
    (peerId: string, stream: MediaStream | null) => {
      setStreams((prev) => {
        if (!stream) {
          const { [peerId]: _, ...rest } = prev;
          return rest;
        }

        const tracks = {
          audio: stream.getAudioTracks()[0] ?? null,
          video: stream.getVideoTracks()[0] ?? null,
        };

        return {
          ...prev,
          [peerId]: {
            stream,
            tracks,
            status: "connected",
          },
        };
      });
    },
    []
  );

  return {
    messages,
    localStream,
    remoteStreams: remoteStreamsForVideo,
    userNames,
    participants,
    streams,
    isLoading,
    handleSendMessage: async (content: string) => {
      await sendMessage("/app/chat.send", {
        roomId,
        senderId: userId,
        senderName: userName,
        content,
        type: "CHAT",
        timestamp: Date.now(),
      });
    },
    handleFileUpload: async (file: File) => {
      try {
        const imageUrl = await uploadFile(file, roomId);
        await sendMessage("/app/chat.send", {
          roomId,
          senderId: userId,
          senderName: userName,
          type: "IMAGE",
          imageUrl,
          content: "Sent an image",
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    },
    handleParticipantUpdate,
    handleStreamUpdate,
    updateStream,
  };
};
