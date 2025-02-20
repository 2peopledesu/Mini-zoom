package com.imap143.api.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.imap143.api.dto.response.ChatMessageResponse;
import com.imap143.application.dto.ChatMessageDto;
import com.imap143.application.dto.MediaStatusDto;
import com.imap143.application.service.ChatMessageService;
import com.imap143.application.service.WebRTCService;
import com.imap143.application.service.WebSocketSessionService;
import com.imap143.domain.entity.ChatMessage;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatMessageService chatMessageService;
    private final WebRTCService webRTCService;
    private final WebSocketSessionService webSocketSessionService;
    private final ObjectMapper objectMapper;
    private static final Logger log = LoggerFactory.getLogger(ChatMessageController.class);
    private static final String TOPIC_ROOM = "/topic/room.";

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDto messageDto) {
        log.info("Received message: {}", messageDto);
        if (messageDto.getType() == ChatMessage.MessageType.IMAGE) {
            log.info("Image URL: {}", messageDto.getImageUrl());
        }
        
        ChatMessageResponse saved = chatMessageService.saveMessage(messageDto);
        log.info("Saved message: {}", saved);
        
        messagingTemplate.convertAndSend(TOPIC_ROOM + messageDto.getRoomId(), saved);
    }

    @MessageMapping("/chat.join")
    public void joinRoom(@Payload ChatMessageDto messageDto, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String roomId = messageDto.getRoomId();
        String userId = messageDto.getSenderId();
        
        // Check if user is already in the room
        if (webSocketSessionService.isUserInRoom(roomId, userId)) {
            log.info("User {} is already in room {}", userId, roomId);
            return;
        }
        
        // Save WebSocket session information
        webSocketSessionService.addSession(roomId, sessionId, userId);
        
        // Set session attributes
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            attributes.put("room_id", roomId);
            attributes.put("user_id", userId);
        }
        
        // WebRTC participant management
        webRTCService.addParticipant(roomId, userId);
        
        // Broadcast chat room entry message
        messageDto.setType(ChatMessage.MessageType.JOIN);
        messagingTemplate.convertAndSend(TOPIC_ROOM + roomId, messageDto);
    }

    @MessageMapping("/chat.leave")
    public void leaveRoom(@Payload ChatMessageDto messageDto) {
        messageDto.setType(ChatMessage.MessageType.LEAVE);
        messagingTemplate.convertAndSend(TOPIC_ROOM + messageDto.getRoomId(), messageDto);
        
        // WebRTC Participant Remove
        webRTCService.removeParticipant(messageDto.getRoomId(), messageDto.getSenderId());
    }

    // WebRTC Signaling
    @MessageMapping("/signal.offer")
    public void handleOffer(@Payload ChatMessageDto.SignalRequest request) {
        request.setType(ChatMessage.MessageType.OFFER);
        webRTCService.handleOffer(request);
    }

    @MessageMapping("/signal.answer")
    public void handleAnswer(@Payload ChatMessageDto.SignalRequest request) {
        request.setType(ChatMessage.MessageType.ANSWER);
        webRTCService.handleAnswer(request);
    }

    @MessageMapping("/signal.ice_candidate")
    public void handleIceCandidate(@Payload ChatMessageDto.SignalRequest request) {
        messagingTemplate.convertAndSend(
            "/queue/signal." + request.getTargetId(),
            request
        );
    }

    @MessageMapping("/signal.media_status")
    public void handleMediaStatusChange(@Payload ChatMessageDto.SignalRequest request) {
        MediaStatusDto mediaStatus = objectMapper.convertValue(request.getSignal(), MediaStatusDto.class);
        webRTCService.handleMediaStatusChange(request.getRoomId(), request.getSenderId(), mediaStatus);
    }

    @GetMapping("/api/rooms/{roomId}/messages")
    public ResponseEntity<Object> getRoomMessages(
        @PathVariable String roomId,
        @RequestHeader("X-User-Id") String userId) {
        try {
            List<ChatMessageResponse> messages = chatMessageService.getRoomMessages(roomId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to load messages: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/api/rooms/{roomId}/webrtc-participants")
    public ResponseEntity<List<String>> getRoomParticipants(
        @PathVariable String roomId,
        @RequestHeader("X-User-Id") String userId
    ) {
        List<String> participants = webRTCService.getRoomParticipants(roomId);
        return ResponseEntity.ok(participants);
    }
} 