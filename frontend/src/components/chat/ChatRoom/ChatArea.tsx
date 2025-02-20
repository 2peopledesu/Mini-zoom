import React, { useState, DragEvent } from "react";
import { Box } from "@mui/material";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { ChatMessage } from "../../../types/ChatMessage";

interface ChatAreaProps {
  messages: ChatMessage[];
  userId: string;
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  userId,
  onSendMessage,
  onFileUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      onFileUpload(imageFile);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "#ffffff",
        borderRadius: 2,
        p: 2,
        boxShadow: 1,
        position: "relative",
        border: isDragging ? "2px dashed" : "none",
        borderColor: "primary.main",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <MessageList messages={messages} userId={userId} />
      <MessageInput onSendMessage={onSendMessage} onFileUpload={onFileUpload} />
    </Box>
  );
};

export default ChatArea;
