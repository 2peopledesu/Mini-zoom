package com.imap143.config;

import java.util.List;

import com.imap143.application.dto.ChatRoomDto;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.imap143.application.service.ChatRoomService;
import com.imap143.application.service.WebRTCService;
import com.imap143.application.service.WebSocketSessionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private final WebRTCService webRTCService;
    private final ChatRoomService chatRoomService;
    private final WebSocketSessionService webSocketSessionService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = webSocketSessionService.getUserIdBySessionId(sessionId);
        
        log.info("WebSocket connection closed - Session ID: {}, User ID: {}", sessionId, userId);
        
        if (userId != null) {
            webSocketSessionService.removeSession(sessionId);
            List<ChatRoomDto> userRooms = chatRoomService.getRoomsByUserId(userId);
            for (ChatRoomDto room : userRooms) {
                webRTCService.removeParticipant(room.getId(), userId);
                chatRoomService.removeFromActiveParticipants(room.getId(), userId);
            }
        } else {
            log.warn("Failed to find userId - Session ID: {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userId = headerAccessor.getFirstNativeHeader("X-User-Id");
        
        log.info("WebSocket connection attempt - Session ID: {}, User ID: {}", sessionId, userId);
        
        if (userId != null) {
            webSocketSessionService.initializeSession(sessionId, userId);
            log.info("WebSocket connection successful - Session ID: {}, User ID: {}", sessionId, userId);
        } else {
            log.warn("WebSocket connection attempt - User ID missing - Session ID: {}, User ID: {}", sessionId, userId);
        }
    }
} 