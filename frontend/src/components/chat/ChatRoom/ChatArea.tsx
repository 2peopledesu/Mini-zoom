import React from "react";
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
      }}
    >
      <MessageList messages={messages} userId={userId} />
      <MessageInput onSendMessage={onSendMessage} onFileUpload={onFileUpload} />
    </Box>
  );
};

export default ChatArea;
