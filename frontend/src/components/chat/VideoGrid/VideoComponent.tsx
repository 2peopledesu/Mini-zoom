import React, { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

interface VideoComponentProps {
  stream: MediaStream;
  isLocal: boolean;
  userName: string;
}

const VideoComponent = React.memo<VideoComponentProps>(
  ({ stream, isLocal, userName }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const playAttemptRef = useRef<number>(0);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !stream) return;

      const setupStream = async () => {
        try {
          // track active check
          stream.getTracks().forEach((track) => {
            if (!track.enabled) {
              track.enabled = true;
            }
          });

          // stream change check
          if (streamRef.current?.id !== stream.id) {
            video.srcObject = stream;
            streamRef.current = stream;

            if (video.readyState >= 2) {
              await video.play();
            }
          }
        } catch (error) {
          console.error(
            `[VideoComponent] Setup failed for ${userName}:`,
            error
          );
          if (playAttemptRef.current < 3) {
            playAttemptRef.current++;
            setTimeout(setupStream, 1000);
          }
        }
      };

      video.onloadedmetadata = async () => {
        try {
          await video.play();
        } catch (error) {
          console.error(`[VideoComponent] Play failed for ${userName}:`, error);
        }
      };

      setupStream();

      return () => {
        playAttemptRef.current = 0;
        if (video.srcObject) {
          video.srcObject = null;
          streamRef.current = null;
        }
      };
    }, [stream, isLocal, userName]);

    return (
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Typography
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {userName}
        </Typography>
      </Box>
    );
  }
);

VideoComponent.displayName = "VideoComponent";

export default VideoComponent;
