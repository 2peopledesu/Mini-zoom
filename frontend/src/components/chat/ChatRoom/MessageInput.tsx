import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileUpload,
  isLoading = false,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1 }}
    >
      <TextField
        fullWidth
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Input your message"
        variant="outlined"
        size="small"
        disabled={isLoading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                color="primary"
                onClick={handleImageButtonClick}
                size="small"
                disabled={isLoading}
              >
                <ImageIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        type="submit"
        disabled={!messageInput.trim() || isLoading}
      >
        Send
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
    </Box>
  );
};

export default MessageInput;
