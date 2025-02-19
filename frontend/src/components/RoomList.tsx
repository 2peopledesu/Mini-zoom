import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

interface Room {
  id: string;
  name: string;
  participants: string[];
  createdBy: string;
}

interface RoomListProps {
  userId: string;
  onJoinRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ userId, onJoinRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/rooms", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleCreateRoom = async () => {
    if (newRoomName.trim()) {
      try {
        const response = await fetch("http://localhost:8080/api/rooms", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
            Accept: "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({ name: newRoomName }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newRoom = await response.json();
        setRooms([...rooms, newRoom]);
        setIsCreateDialogOpen(false);
        setNewRoomName("");
        onJoinRoom(newRoom.id);
      } catch (error) {
        console.error("Error creating room:", error);
      }
    }
  };

  return (
    <>
      <Paper sx={{ p: 2, maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Chat room list
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Make a new chat room
        </Button>
        <List>
          {rooms
            .filter((room) => room.participants && room.participants.length > 0)
            .map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton onClick={() => onJoinRoom(room.id)}>
                  <ListItemText
                    primary={room.name}
                    secondary={`참가자: ${room.participants.length}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Paper>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      >
        <DialogTitle>Make a new chat room </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room name"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
