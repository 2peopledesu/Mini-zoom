import React, { useState, useRef, DragEvent } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
  const [isDragging, setIsDragging] = useState(false);
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
    if (file && file.type.startsWith("image/")) {
      onFileUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        position: "relative",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 1,
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography>Drop image here</Typography>
          </Box>
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Enter your message"
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
    </Box>
  );
};

export default MessageInput;
