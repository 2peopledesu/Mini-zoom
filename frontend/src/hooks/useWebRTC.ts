import { useEffect, useRef, useCallback } from "react";

interface WebRTCHook {
  localStream: MediaStream | null;
  remoteStreams: { [key: string]: MediaStream };
  startLocalStream: () => Promise<MediaStream>;
  createOffer: (targetUserId: string) => Promise<void>;
  handleAnswer: (
    answer: RTCSessionDescriptionInit,
    fromUserId: string
  ) => Promise<void>;
  handleOffer: (
    offer: RTCSessionDescriptionInit,
    fromUserId: string
  ) => Promise<void>;
  handleIceCandidate: (
    candidate: RTCIceCandidateInit,
    fromUserId: string
  ) => void;
}

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export const useWebRTC = (
  userId: string,
  roomId: string,
  onSignal: (signal: any) => void,
  onRemoteStream?: (peerId: string, stream: MediaStream | null) => void
): WebRTCHook => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const remoteStreams = useRef<{ [key: string]: MediaStream }>({});
  const pendingCandidates = useRef<{ [key: string]: RTCIceCandidateInit[] }>(
    {}
  );

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      const existingPC = peerConnections.current[targetUserId];
      if (existingPC) {
        if (existingPC.signalingState !== "stable") {
          console.log(
            `[useWebRTC] Cleaning up unstable connection for: ${targetUserId}`
          );
          existingPC.close();
          delete peerConnections.current[targetUserId];
          delete remoteStreams.current[targetUserId];
        } else if (existingPC.connectionState === "connected") {
          console.log(
            `[useWebRTC] Reusing existing connection for: ${targetUserId}`
          );
          return existingPC;
        }
      }

      const pc = new RTCPeerConnection(configuration);
      peerConnections.current[targetUserId] = pc;
      console.log("Creating new peer connection for:", targetUserId);

      // Add local stream tracks
      if (localStreamRef.current) {
        console.log(
          "Adding local stream tracks to peer connection for:",
          targetUserId
        );
        localStreamRef.current.getTracks().forEach((track) => {
          if (localStreamRef.current) {
            console.log(`Adding track: ${track.kind} to peer connection`);
            pc.addTrack(track, localStreamRef.current);
          }
        });
      }

      // Handle remote streams
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];

          // Check track state and enable
          event.streams[0].getTracks().forEach((track) => {
            track.enabled = true;
          });

          remoteStreams.current[targetUserId] = remoteStream;
          onRemoteStream?.(targetUserId, remoteStream);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(
            "Sending ICE candidate to:",
            targetUserId,
            event.candidate
          );
          onSignal({
            type: "ICE_CANDIDATE",
            targetId: targetUserId,
            roomId,
            senderId: userId,
            signal: event.candidate,
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log(
          `Connection state changed for ${targetUserId}:`,
          pc.connectionState
        );
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          delete peerConnections.current[targetUserId];
          delete remoteStreams.current[targetUserId];
          onRemoteStream?.(targetUserId, null);
        }
      };

      return pc;
    },
    [configuration, onRemoteStream]
  );

  const createOffer = useCallback(
    async (targetUserId: string) => {
      console.log("Creating offer for:", targetUserId);
      try {
        const pc = createPeerConnection(targetUserId);

        pc.addTransceiver("audio", { direction: "sendrecv" });
        pc.addTransceiver("video", { direction: "sendrecv" });

        const offer = await pc.createOffer();
        console.log("Created offer:", offer.sdp);

        await pc.setLocalDescription(offer);
        onSignal({
          type: "OFFER",
          targetId: targetUserId,
          roomId,
          senderId: userId,
          signal: offer,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
        if (peerConnections.current[targetUserId]) {
          peerConnections.current[targetUserId].close();
          delete peerConnections.current[targetUserId];
          delete remoteStreams.current[targetUserId];
        }
      }
    },
    [createPeerConnection, roomId, userId, onSignal]
  );

  const handleIceCandidate = useCallback(
    (candidate: RTCIceCandidateInit, fromUserId: string) => {
      console.log("Handling ICE candidate from:", fromUserId);
      const pc = peerConnections.current[fromUserId];

      if (!pc) {
        console.warn("No peer connection found for:", fromUserId);
        return;
      }

      if (pc.remoteDescription) {
        try {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      } else {
        console.log("Remote description not set yet, queuing candidate");
        if (!pendingCandidates.current[fromUserId]) {
          pendingCandidates.current[fromUserId] = [];
        }
        pendingCandidates.current[fromUserId].push(candidate);
      }
    },
    []
  );

  const addPendingCandidates = useCallback((peerId: string) => {
    const pc = peerConnections.current[peerId];
    const candidates = pendingCandidates.current[peerId] || [];

    if (pc && pc.remoteDescription && candidates.length > 0) {
      console.log(
        `Adding ${candidates.length} pending candidates for:`,
        peerId
      );
      candidates.forEach(async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding pending ICE candidate:", error);
        }
      });
      delete pendingCandidates.current[peerId];
    }
  }, []);

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit, fromUserId: string) => {
      console.log("Handling offer from:", fromUserId);
      try {
        const pc = createPeerConnection(fromUserId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        onSignal({
          type: "ANSWER",
          targetId: fromUserId,
          roomId,
          senderId: userId,
          signal: answer,
        });

        addPendingCandidates(fromUserId);
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    },
    [createPeerConnection, roomId, userId, onSignal, addPendingCandidates]
  );

  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit, fromUserId: string) => {
      const pc = peerConnections.current[fromUserId];
      if (pc) {
        try {
          if (pc.signalingState !== "have-local-offer") {
            console.log(
              `[useWebRTC] Invalid state for answer: ${pc.signalingState}`
            );
            pc.close();
            delete peerConnections.current[fromUserId];
            delete remoteStreams.current[fromUserId];
            createOffer(fromUserId);
            return;
          }

          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log(`[useWebRTC] Set remote description for: ${fromUserId}`);

          await addPendingCandidates(fromUserId);
        } catch (error) {
          console.error("[useWebRTC] Error handling answer:", error);

          try {
            if (pc.signalingState !== "closed") {
              pc.close();
            }
            delete peerConnections.current[fromUserId];
            delete remoteStreams.current[fromUserId];

            setTimeout(() => {
              console.log("[useWebRTC] Attempting to create new connection");
              createOffer(fromUserId);
            }, 1000);
          } catch (recoveryError) {
            console.error("[useWebRTC] Recovery failed:", recoveryError);
          }
        }
      } else {
        console.warn("[useWebRTC] No peer connection found for:", fromUserId);
      }
    },
    [createOffer, addPendingCandidates]
  );

  useEffect(() => {
    return () => {
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    localStream: localStreamRef.current,
    remoteStreams: remoteStreams.current,
    startLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  };
};
