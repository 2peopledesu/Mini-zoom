import React, { useEffect } from "react";
import { Box } from "@mui/material";
import VideoGrid from "../VideoGrid";
import MediaControl from "./MediaControl";

interface VideoAreaProps {
  remoteStreams: { [key: string]: MediaStream };
  localStream: MediaStream | null;
  userName: string;
  userNames: { [key: string]: string };
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

const VideoArea: React.FC<VideoAreaProps> = ({
  remoteStreams,
  localStream,
  userName,
  userNames,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled,
}) => {
  useEffect(() => {
    console.log("[VideoArea] Received remote streams:", {
      count: Object.keys(remoteStreams).length,
      streamIds: Object.entries(remoteStreams).map(([peerId, stream]) => ({
        peerId,
        streamId: stream.id,
      })),
    });
  }, [remoteStreams]);

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <Box
        sx={{
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          p: 1,
        }}
      >
        <VideoGrid
          remoteStreams={remoteStreams}
          localStream={localStream}
          userName={userName}
          userNames={userNames}
        />
      </Box>
      <MediaControl
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
      />
    </Box>
  );
};

export default VideoArea;
