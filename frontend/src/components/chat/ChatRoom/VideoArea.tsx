import React, { useEffect } from "react";
import { Box } from "@mui/material";
import VideoGrid from "../VideoGrid";

interface VideoAreaProps {
  remoteStreams: { [key: string]: MediaStream };
  localStream: MediaStream | null;
  userName: string;
  userNames: { [key: string]: string };
}

const VideoArea: React.FC<VideoAreaProps> = ({
  remoteStreams,
  localStream,
  userName,
  userNames,
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
  );
};

export default VideoArea;
