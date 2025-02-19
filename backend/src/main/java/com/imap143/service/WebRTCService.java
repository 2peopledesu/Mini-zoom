package com.imap143.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import com.imap143.dto.ChatMessageDto;
import com.imap143.dto.ParticipantUpdateMessage;
import com.imap143.model.ChatMessage;
import com.imap143.model.ChatRoom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WebRTCService {
    
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatRoomService chatRoomService;
    private final WebSocketSessionService webSocketSessionService;
    
    private static final Logger log = LoggerFactory.getLogger(WebRTCService.class);
    private static final String QUEUE_SIGNAL = "/queue/signal.";
    
    public void handleOffer(ChatMessageDto.SignalRequest request) {
        log.info("Handling offer from {} to {}", request.getSenderId(), request.getTargetId());
        messagingTemplate.convertAndSend(
            QUEUE_SIGNAL + request.getTargetId(),
            request
        );
    }
    
    public void handleAnswer(ChatMessageDto.SignalRequest request) {
        log.info("Handling answer from {} to {}", request.getSenderId(), request.getTargetId());
        messagingTemplate.convertAndSend(
            QUEUE_SIGNAL + request.getTargetId(),
            request
        );
    }
    
    public void handleIceCandidate(ChatMessageDto.SignalRequest request) {
        // Ice Candidate signal handling
        String targetId = request.getTargetId();
        if (targetId != null) {
            messagingTemplate.convertAndSend(QUEUE_SIGNAL + targetId, request);
        }
    }
    
    public void broadcastParticipantList(String roomId) {
        ChatRoom room = chatRoomService.getRoom(roomId);
        List<String> participants = new ArrayList<>(room.getActiveParticipants());
        
        // Send updated participant list to all participants
        participants.forEach(participantId -> {
            messagingTemplate.convertAndSend(
                "/queue/participants." + participantId,
                new ParticipantUpdateMessage(roomId, participants)
            );
        });
    }
    
    public void addParticipant(String roomId, String userId) {
        // Participant addition and storage
        ChatRoom room = chatRoomService.joinRoom(roomId, userId);
        
        log.info("New participant added: {} to room: {}", userId, roomId);
        
        // Broadcast participant list
        broadcastParticipantList(roomId);
        
        // Send signal to new participant from existing participants
        room.getActiveParticipants().stream()
            .filter(participantId -> !participantId.equals(userId))
            .forEach(participantId -> {
                ChatMessageDto.SignalRequest newPeerSignal = new ChatMessageDto.SignalRequest();
                newPeerSignal.setType(ChatMessage.MessageType.JOIN);
                newPeerSignal.setRoomId(roomId);
                newPeerSignal.setSenderId(userId);
                newPeerSignal.setTargetId(participantId);
                
                // Add necessary information for JOIN signal
                Map<String, Object> signalData = new HashMap<>();
                signalData.put("type", "join");
                signalData.put("userId", userId);
                signalData.put("timestamp", System.currentTimeMillis());
                newPeerSignal.setSignal(signalData);
                
                log.info("Sending JOIN signal from: {} to: {}", userId, participantId);
                messagingTemplate.convertAndSend(QUEUE_SIGNAL + participantId, newPeerSignal);
                
                // Existing participants also send JOIN signal to new participant
                ChatMessageDto.SignalRequest reverseSignal = new ChatMessageDto.SignalRequest();
                reverseSignal.setType(ChatMessage.MessageType.JOIN);
                reverseSignal.setRoomId(roomId);
                reverseSignal.setSenderId(participantId);
                reverseSignal.setTargetId(userId);
                reverseSignal.setSignal(signalData);
                
                log.info("Sending reverse JOIN signal from: {} to: {}", participantId, userId);
                messagingTemplate.convertAndSend(QUEUE_SIGNAL + userId, reverseSignal);
            });
    }
    
    public void removeParticipant(String roomId, String userId) {
        ChatRoom room = chatRoomService.getRoom(roomId);
        if (room != null) {
            // Check if the user's WebSocket session still exists
            if (webSocketSessionService.hasActiveSession(userId)) {
                log.info("User {} still has an active WebSocket session, so not removed from room {}", userId, roomId);
                return;
            }
            
            chatRoomService.leaveRoom(roomId, userId);
            List<String> activeParticipants = room.getActiveParticipants();
            
            if (activeParticipants.isEmpty()) {
                chatRoomService.deleteRoom(roomId);
                log.info("Empty chat room deleted: {}", roomId);
            } else {
                broadcastParticipantList(roomId);
                
                ChatMessageDto.SignalRequest peerLeaveSignal = new ChatMessageDto.SignalRequest();
                peerLeaveSignal.setRoomId(roomId);
                peerLeaveSignal.setSenderId(userId);
                peerLeaveSignal.setType(ChatMessage.MessageType.LEAVE);
                
                activeParticipants.forEach(participantId -> {
                    messagingTemplate.convertAndSend(QUEUE_SIGNAL + participantId, peerLeaveSignal);
                });
            }
        }
    }
    
    // Method called when WebSocket connection is disconnected
    public void handleSessionDisconnect(String userId) {
        chatRoomService.getRooms().stream()
            .filter(room -> room.getActiveParticipants().contains(userId))
            .forEach(room -> removeParticipant(room.getId(), userId));
    }
    
    public List<String> getRoomParticipants(String roomId) {
        ChatRoom room = chatRoomService.getRoom(roomId);
        return new ArrayList<>(room.getActiveParticipants());
    }
} 