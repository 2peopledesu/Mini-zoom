import React, { useMemo, useEffect, useRef } from "react";
import { Grid, Paper } from "@mui/material";
import VideoComponent from "./VideoComponent";

interface VideoGridProps {
  remoteStreams: { [key: string]: MediaStream };
  localStream: MediaStream | null;
  userName: string;
  userNames: { [key: string]: string };
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  remoteStreams,
  localStream,
  userName,
  userNames,
}) => {
  const previousStreamsRef = useRef<{
    localStreamId: string | null;
    remoteStreamIds: { [key: string]: string };
  }>({
    localStreamId: null,
    remoteStreamIds: {},
  });

  const hasStreamChanged = useMemo(() => {
    const currentLocalId = localStream?.id || null;
    const currentRemoteIds = Object.entries(remoteStreams).reduce(
      (acc, [peerId, stream]) => {
        acc[peerId] = stream.id;
        return acc;
      },
      {} as { [key: string]: string }
    );

    const hasLocalChanged =
      currentLocalId !== previousStreamsRef.current.localStreamId;
    const hasRemoteChanged = Object.keys(currentRemoteIds).some(
      (peerId) =>
        currentRemoteIds[peerId] !==
        previousStreamsRef.current.remoteStreamIds[peerId]
    );

    if (hasLocalChanged || hasRemoteChanged) {
      previousStreamsRef.current = {
        localStreamId: currentLocalId,
        remoteStreamIds: currentRemoteIds,
      };
      return true;
    }
    return false;
  }, [localStream, remoteStreams]);

  useEffect(() => {
    if (hasStreamChanged) {
      console.log("VideoGrid Streams Updated:", {
        localStream: localStream
          ? {
              id: localStream.id,
              tracks: localStream.getTracks().map((track) => ({
                kind: track.kind,
                enabled: track.enabled,
                muted: track.muted,
                readyState: track.readyState,
              })),
            }
          : "None",
        remoteStreams: Object.entries(remoteStreams).map(
          ([peerId, stream]) => ({
            peerId,
            streamId: stream.id,
            tracks: stream.getTracks().map((track) => ({
              kind: track.kind,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
            })),
          })
        ),
      });
    }
  }, [hasStreamChanged, localStream, remoteStreams]);

  // Remote Streams State Monitoring
  useEffect(() => {
    console.log("[VideoGrid] Remote streams state:", {
      remoteStreamsCount: Object.keys(remoteStreams).length,
      streams: Object.entries(remoteStreams).map(([peerId, stream]) => ({
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
  }, [remoteStreams]);

  // Remote Streams State Debugging
  useEffect(() => {
    console.log("[VideoGrid] Detailed remote streams state:", {
      remoteStreamsCount: Object.keys(remoteStreams).length,
      streams: Object.entries(remoteStreams).map(([peerId, stream]) => ({
        peerId,
        streamId: stream.id,
        trackDetails: stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
        })),
      })),
    });
  }, [remoteStreams]);

  const remoteStreamCount = Object.keys(remoteStreams).length;
  const totalParticipants = remoteStreamCount + 1;

  const { cols, rows } = useMemo(() => {
    if (totalParticipants === 1) return { cols: 1, rows: 1 };
    if (totalParticipants === 2) return { cols: 2, rows: 1 };
    if (totalParticipants <= 4) return { cols: 2, rows: 2 };
    if (totalParticipants <= 6) return { cols: 3, rows: 2 };
    return { cols: 3, rows: 3 };
  }, [totalParticipants]);

  const itemWidth = 12 / cols;

  return (
    <Grid
      container
      spacing={1}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {localStream && (
        <Grid
          item
          xs={itemWidth}
          sx={{
            height: `${100 / rows}%`,
            padding: 0.5,
          }}
        >
          <Paper
            sx={{
              height: "100%",
              position: "relative",
              overflow: "hidden",
              backgroundColor: "black",
              aspectRatio: "16/9",
            }}
          >
            <VideoComponent
              stream={localStream}
              isLocal={true}
              userName={userName}
            />
          </Paper>
        </Grid>
      )}

      {Object.entries(remoteStreams).map(([peerId, stream]) => {
        console.log(`[VideoGrid] Rendering remote stream for peer ${peerId}:`, {
          streamId: stream.id,
          tracks: stream.getTracks().length,
        });

        return (
          <Grid
            item
            xs={itemWidth}
            key={peerId}
            sx={{
              height: `${100 / rows}%`,
              padding: 0.5,
            }}
          >
            <Paper
              sx={{
                height: "100%",
                position: "relative",
                overflow: "hidden",
                backgroundColor: "black",
                aspectRatio: "16/9",
              }}
            >
              <VideoComponent
                stream={stream}
                isLocal={false}
                userName={userNames[peerId] || `Participant ${peerId}`}
              />
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default VideoGrid;
