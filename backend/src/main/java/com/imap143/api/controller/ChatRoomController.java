package com.imap143.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.imap143.api.dto.request.CreateRoomRequest;
import com.imap143.api.dto.response.ChatRoomResponse;
import com.imap143.application.service.ChatRoomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ChatRoomResponse> createRoom(
            @RequestBody CreateRoomRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(chatRoomService.createRoom(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomResponse>> getRooms() {
        return ResponseEntity.ok(chatRoomService.getRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomResponse> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(chatRoomService.getRoom(roomId));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<ChatRoomResponse> joinRoom(
            @PathVariable String roomId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(chatRoomService.joinRoom(roomId, userId));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<ChatRoomResponse> leaveRoom(
            @PathVariable String roomId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(chatRoomService.leaveRoom(roomId, userId));
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<String>> getRoomParticipants(
            @PathVariable String roomId) {
        return ResponseEntity.ok(chatRoomService.getRoomParticipants(roomId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ChatRoomResponse>> getUserRooms(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(chatRoomService.getUserRooms(userId));
    }
}