package com.imap143.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.imap143.api.dto.request.CreateRoomRequest;
import com.imap143.api.dto.response.ChatRoomResponse;
import com.imap143.application.dto.ChatRoomDto;
import com.imap143.domain.entity.ChatRoom;
import com.imap143.domain.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    private static final Logger log = LoggerFactory.getLogger(ChatRoomService.class);
    
    public ChatRoomResponse createRoom(CreateRoomRequest request, String userId) {
        ChatRoomDto dto = ChatRoomDto.from(request, userId);
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setId(UUID.randomUUID().toString());
        chatRoom.setName(dto.getName());
        chatRoom.setCreatedBy(dto.getCreatedBy());
        chatRoom.setCreatedAt(System.currentTimeMillis());
        
        List<String> participants = new ArrayList<>();
        List<String> activeParticipants = new ArrayList<>();
        
        participants.add(dto.getCreatedBy());
        activeParticipants.add(dto.getCreatedBy());
        
        chatRoom.setParticipants(participants);
        chatRoom.setActiveParticipants(activeParticipants);
        
        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomResponse.from(ChatRoomDto.from(savedRoom));
    }
    
    public List<ChatRoomResponse> getRooms() {
        List<ChatRoom> rooms = chatRoomRepository.findAll();
        log.info("All chat rooms retrieved from MongoDB: {}", rooms);
        
        return rooms.stream()
            .filter(room -> !room.getActiveParticipants().isEmpty())
            .map(ChatRoomDto::from)
            .map(ChatRoomResponse::from)
            .toList();
    }

    public ChatRoomResponse getRoom(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + roomId));
        return ChatRoomResponse.from(ChatRoomDto.from(room));
    }
    
    public ChatRoomResponse joinRoom(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + roomId));

        synchronized (room) {
            List<String> activeParticipants = room.getActiveParticipants();
            if (!activeParticipants.contains(userId)) {
                activeParticipants.add(userId);
                if (!room.getParticipants().contains(userId)) {
                    room.getParticipants().add(userId);
                }
                log.info("User {} joined chat room {}. Current participants: {}",
                        userId, roomId, activeParticipants);
                return ChatRoomResponse.from(ChatRoomDto.from(chatRoomRepository.save(room)));
            }
        }
        return ChatRoomResponse.from(ChatRoomDto.from(chatRoomRepository.save(room)));
    }
    
    public ChatRoomResponse leaveRoom(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + roomId));
        
        synchronized (room) {
            room.getActiveParticipants().remove(userId);
            room.getParticipants().remove(userId);
            log.info("User {} left chat room {}. Remaining participants: {}", 
                userId, roomId, room.getActiveParticipants());
                return ChatRoomResponse.from(ChatRoomDto.from(chatRoomRepository.save(room)));
        }
    }
    
    public List<ChatRoomResponse> getUserRooms(String userId) {
        return chatRoomRepository.findByParticipantsContaining(userId)
                .stream()
                .map(ChatRoomDto::from)
                .map(ChatRoomResponse::from)
                .toList();
    }

    public void deleteRoom(String roomId) {
        chatRoomRepository.deleteById(roomId);
        log.info("Chat room {} deleted", roomId);
    }

    public List<ChatRoomDto> getRoomsByUserId(String userId) {
        return chatRoomRepository.findByActiveParticipantsContaining(userId)
                .stream()
                .map(ChatRoomDto::from)
                .toList();
    }
    
    public List<String> getRoomParticipants(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + roomId));
        synchronized (room) {
            List<String> participants = room.getActiveParticipants();
            log.info("Current participants in chat room {}: {}", roomId, participants);
            return new ArrayList<>(participants);
        }
    }
    
    public void removeFromActiveParticipants(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + roomId));
        synchronized (room) {
            room.getActiveParticipants().remove(userId);
            
            if (room.getActiveParticipants().isEmpty()) {
                chatRoomRepository.delete(room);
                log.info("Empty chat room deleted: {}", roomId);
            } else {
                chatRoomRepository.save(room);
                log.info("User {} removed from active participants in chat room {}. Current participants: {}", 
                    userId, roomId, room.getActiveParticipants());
            }
        }
    }
} 