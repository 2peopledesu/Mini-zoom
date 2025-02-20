import React, { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { ChatMessage } from "../../../types/ChatMessage";
import ImagePreview from "./ImagePreview";

interface MessageItemProps {
  message: ChatMessage;
  userId: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, userId }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isMyMessage = message.senderId === userId;

  const getFullImageUrl = (imageUrl: string) => {
    return `http://localhost:8080${imageUrl}`;
  };

  const handleImageClick = () => {
    if (message.type === "IMAGE") {
      setIsPreviewOpen(true);
    }
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
          {message.senderName} is {message.type === "JOIN" ? "JOIN" : "LEAVE"}
        </Typography>
      </Box>
    );
  }

  return (
    <>
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
              cursor: message.type === "IMAGE" ? "pointer" : "default",
            }}
          >
            {message.type === "IMAGE" ? (
              <img
                src={getFullImageUrl(message.imageUrl!)}
                alt="uploaded"
                style={{
                  maxWidth: "100%",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onClick={handleImageClick}
              />
            ) : (
              <Typography>{message.content}</Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {message.type === "IMAGE" && (
        <ImagePreview
          open={isPreviewOpen}
          imageUrl={getFullImageUrl(message.imageUrl!)}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
};

export default MessageItem;
