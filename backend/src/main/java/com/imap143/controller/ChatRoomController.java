package com.imap143.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.imap143.dto.ChatRoomDto;
import com.imap143.model.ChatRoom;
import com.imap143.service.ChatRoomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ChatRoom> createRoom(
            @RequestBody ChatRoomDto.CreateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(chatRoomService.createRoom(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getRooms() {
        return ResponseEntity.ok(chatRoomService.getRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoom> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(chatRoomService.getRoom(roomId));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<ChatRoom> joinRoom(
            @PathVariable String roomId,
            @RequestHeader("X-User-Id") String userId) {
        ChatRoom room = chatRoomService.joinRoom(roomId, userId);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<ChatRoom> leaveRoom(
            @PathVariable String roomId,
            @RequestHeader("X-User-Id") String userId) {
        ChatRoom room = chatRoomService.leaveRoom(roomId, userId);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<String>> getRoomParticipants(
            @PathVariable String roomId) {
        return ResponseEntity.ok(chatRoomService.getRoomParticipants(roomId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ChatRoom>> getUserRooms(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(chatRoomService.getUserRooms(userId));
    }
} 