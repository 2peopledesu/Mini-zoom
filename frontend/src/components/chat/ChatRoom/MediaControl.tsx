import React from "react";
import { IconButton, Box, Tooltip } from "@mui/material";
import { Mic, MicOff, Videocam, VideocamOff } from "@mui/icons-material";

interface MediaControlProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

const MediaControl: React.FC<MediaControlProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "center",
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "8px",
        borderRadius: "24px",
      }}
    >
      <Tooltip
        title={isAudioEnabled ? "Turn off microphone" : "Turn on microphone"}
      >
        <IconButton
          onClick={onToggleAudio}
          sx={{
            bgcolor: isAudioEnabled ? "primary.main" : "error.main",
            color: "white",
            "&:hover": {
              bgcolor: isAudioEnabled ? "primary.dark" : "error.dark",
            },
          }}
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isVideoEnabled ? "Turn off video" : "Turn on video"}>
        <IconButton
          onClick={onToggleVideo}
          sx={{
            bgcolor: isVideoEnabled ? "primary.main" : "error.main",
            color: "white",
            "&:hover": {
              bgcolor: isVideoEnabled ? "primary.dark" : "error.dark",
            },
          }}
        >
          {isVideoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MediaControl;
