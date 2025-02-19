package com.imap143.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.imap143.dto.ChatRoomDto;
import com.imap143.model.ChatRoom;
import com.imap143.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    private static final Logger log = LoggerFactory.getLogger(ChatRoomService.class);
    
    public ChatRoom createRoom(ChatRoomDto.CreateRequest request, String userId) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setId(UUID.randomUUID().toString());
        chatRoom.setName(request.getName());
        chatRoom.setCreatedBy(userId);
        chatRoom.setCreatedAt(System.currentTimeMillis());
        
        List<String> participants = new ArrayList<>();
        List<String> activeParticipants = new ArrayList<>();
        
        participants.add(userId);
        activeParticipants.add(userId);
        
        chatRoom.setParticipants(participants);
        chatRoom.setActiveParticipants(activeParticipants);
        
        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        log.info("Chat room created: {}", savedRoom);
        return savedRoom;
    }
    
    public List<ChatRoom> getRooms() {
        List<ChatRoom> rooms = chatRoomRepository.findAll();
        log.info("All chat rooms retrieved from MongoDB: {}", rooms);
        
        List<ChatRoom> activeRooms = rooms.stream()
            .filter(room -> !room.getActiveParticipants().isEmpty())
            .toList();
        log.info("Chat rooms with active participants: {}", activeRooms);
        
        return activeRooms;
    }

    public ChatRoom getRoom(String roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + roomId));
    }
    
    public ChatRoom joinRoom(String roomId, String userId) {
        ChatRoom room = getRoom(roomId);
        
        synchronized (room) {
            List<String> activeParticipants = room.getActiveParticipants();
            if (!activeParticipants.contains(userId)) {
                activeParticipants.add(userId);
                if (!room.getParticipants().contains(userId)) {
                    room.getParticipants().add(userId);
                }
                log.info("User {} joined chat room {}. Current participants: {}", 
                    userId, roomId, activeParticipants);
                return chatRoomRepository.save(room);
            }
            return room;
        }
    }
    
    public ChatRoom leaveRoom(String roomId, String userId) {
        ChatRoom room = getRoom(roomId);
        
        synchronized (room) {
            room.getActiveParticipants().remove(userId);
            room.getParticipants().remove(userId);
            log.info("User {} left chat room {}. Remaining participants: {}", 
                userId, roomId, room.getActiveParticipants());
            return chatRoomRepository.save(room);
        }
    }
    
    public List<ChatRoom> getUserRooms(String userId) {
        return chatRoomRepository.findByParticipantsContaining(userId);
    }

    public void deleteRoom(String roomId) {
        chatRoomRepository.deleteById(roomId);
        log.info("Chat room {} deleted", roomId);
    }

    public List<ChatRoom> getRoomsByUserId(String userId) {
        return chatRoomRepository.findByActiveParticipantsContaining(userId);
    }
    
    public List<String> getRoomParticipants(String roomId) {
        ChatRoom room = getRoom(roomId);
        synchronized (room) {
            List<String> participants = room.getActiveParticipants();
            log.info("Current participants in chat room {}: {}", roomId, participants);
            return new ArrayList<>(participants);
        }
    }
    
    public void removeFromActiveParticipants(String roomId, String userId) {
        ChatRoom room = getRoom(roomId);
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