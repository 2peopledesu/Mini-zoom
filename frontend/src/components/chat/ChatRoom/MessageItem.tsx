import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { ChatMessage } from "../../../types/ChatMessage";

interface MessageItemProps {
  message: ChatMessage;
  userId: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, userId }) => {
  const isMyMessage = message.senderId === userId;

  const getFullImageUrl = (imageUrl: string) => {
    return `http://localhost:8080${imageUrl}`;
  };

  if (message.type === "JOIN" || message.type === "LEAVE") {
    return (
      <Box
        sx={{
          textAlign: "center",
          my: 1,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">
          {message.senderName} is {message.type === "JOIN" ? "입장" : "퇴장"}.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMyMessage ? "flex-end" : "flex-start",
        mb: 1,
      }}
    >
      <Box sx={{ maxWidth: "70%" }}>
        {!isMyMessage && (
          <Typography variant="caption" sx={{ ml: 1 }}>
            {message.senderName}
          </Typography>
        )}
        <Paper
          sx={{
            p: 1,
            backgroundColor: isMyMessage ? "primary.main" : "grey.100",
            color: isMyMessage ? "white" : "text.primary",
            borderRadius: 2,
          }}
        >
          {message.type === "IMAGE" ? (
            <img
              src={getFullImageUrl(message.imageUrl!)}
              alt="uploaded"
              style={{ maxWidth: "100%", borderRadius: 4 }}
              onError={(e) => console.error("Image load error:", e)}
            />
          ) : (
            <Typography>{message.content}</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default MessageItem;
