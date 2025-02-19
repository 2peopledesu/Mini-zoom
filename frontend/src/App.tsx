import React, { useState } from "react";
import { Box, Container, TextField, Button, Typography } from "@mui/material";
import { ChatRoom } from "./components/chat/ChatRoom";
import { RoomList } from "./components/RoomList";

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [userId] = useState(
    () => "user_" + Math.random().toString(36).substr(2, 9)
  );
  const [isNameEntered, setIsNameEntered] = useState(false);

  const handleEnterName = () => {
    if (userName.trim()) {
      setIsNameEntered(true);
    }
  };

  const handleJoinRoom = (selectedRoomId: string) => {
    setRoomId(selectedRoomId);
    setIsJoined(true);
  };

  if (!isNameEntered) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Mini Zoom
          </Typography>
          <TextField
            label="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleEnterName}
            disabled={!userName.trim()}
          >
            Start
          </Button>
        </Box>
      </Container>
    );
  }

  if (!isJoined) {
    return <RoomList userId={userId} onJoinRoom={handleJoinRoom} />;
  }

  return <ChatRoom roomId={roomId} userId={userId} userName={userName} />;
}

export default App;
