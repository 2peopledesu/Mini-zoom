import React, { useState } from "react";
import { Box, Container, Grid } from "@mui/material";
import VideoArea from "./VideoArea";
import ChatArea from "./ChatArea";
import { useChatRoom } from "../../../hooks/chat/useChatRoom";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  userName: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  userId,
  userName,
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const {
    messages,
    localStream,
    remoteStreams,
    userNames,
    handleSendMessage,
    handleFileUpload,
  } = useChatRoom({ roomId, userId, userName });

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
      <Grid container spacing={2} sx={{ height: "calc(100% - 32px)" }}>
        <Grid item xs={12} sx={{ height: "60%" }}>
          <VideoArea
            remoteStreams={remoteStreams}
            localStream={localStream}
            userName={userName}
            userNames={userNames}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
          />
        </Grid>
        <Grid item xs={12} sx={{ height: "40%" }}>
          <ChatArea
            messages={messages}
            userId={userId}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
          />
        </Grid>
      </Grid>
    </Container>
  );
};
