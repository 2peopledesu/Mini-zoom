import React, { useRef, useEffect, useLayoutEffect } from "react";
import { Box } from "@mui/material";
import MessageItem from "./MessageItem";
import { ChatMessage } from "../../../types/ChatMessage";

interface MessageListProps {
  messages: ChatMessage[];
  userId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, userId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 2,
      }}
      ref={messagesEndRef}
    >
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} userId={userId} />
      ))}
    </Box>
  );
};

export default MessageList;
