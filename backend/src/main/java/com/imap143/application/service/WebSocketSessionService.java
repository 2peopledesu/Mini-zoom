package com.imap143.application.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WebSocketSessionService {
    private final Map<String, Map<String, String>> roomSessions = new ConcurrentHashMap<>(); // roomId -> (sessionId -> userId)
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>(); // sessionId -> userId
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>(); // userId -> Set<sessionId>
    private final Map<String, Set<String>> roomParticipants = new ConcurrentHashMap<>(); // roomId -> Set<userId>
    
    public void addSession(String roomId, String sessionId, String userId) {
        if (sessionId == null || userId == null) {
            log.warn("Session addition failed: sessionId or userId is null.");
            return;
        }
        
        synchronized (sessionUserMap) {
            sessionUserMap.put(sessionId, userId);
            log.info("Session mapping added: {} -> {}", sessionId, userId);
            
            // Add session to user's session list
            userSessions.computeIfAbsent(userId, k -> new HashSet<>()).add(sessionId);
            log.info("User {} session list: {}", userId, userSessions.get(userId));
            
            // Add user to room participants list
            roomParticipants.computeIfAbsent(roomId, k -> new HashSet<>()).add(userId);
            log.info("Room {} participants list: {}", roomId, roomParticipants.get(roomId));
        }
    }
    
    public void removeSession(String sessionId) {
        String userId = sessionUserMap.remove(sessionId);
        if (userId != null) {
            roomSessions.forEach((roomId, sessions) -> {
                if (sessions.remove(sessionId) != null) {
                    log.info("Session removed: sessionId={}, userId={}", sessionId, userId);
                    if (sessions.isEmpty()) {
                        roomSessions.remove(roomId);
                        log.info("Empty room removed: roomId={}", roomId);
                    }
                }
            });
        }
    }
    
    public String getUserIdBySessionId(String sessionId) {
        String userId = sessionUserMap.get(sessionId);
        if (userId == null) {
            log.warn("User not found for sessionId: {}", sessionId);
        }
        return userId;
    }
    
    public Set<String> getRoomParticipants(String roomId) {
        return new HashSet<>(roomSessions.getOrDefault(roomId, Collections.emptyMap()).values());
    }
    
    public boolean hasActiveSession(String userId) {
        return sessionUserMap.containsValue(userId);
    }
    
    public boolean isUserInRoom(String roomId, String userId) {
        Map<String, String> sessions = roomSessions.get(roomId);
        return sessions != null && sessions.containsValue(userId);
    }
    
    public void initializeSession(String sessionId, String userId) {
        if (sessionId == null || userId == null) {
            log.warn("Session initialization failed: sessionId or userId is null.");
            return;
        }
        
        synchronized (sessionUserMap) {
            sessionUserMap.put(sessionId, userId);
            log.info("Initial session mapping added: {} -> {}", sessionId, userId);
            
            // Add session to user's session list
            userSessions.computeIfAbsent(userId, k -> new HashSet<>()).add(sessionId);
            log.info("Initial session list for user {}: {}", userId, userSessions.get(userId));
        }
    }
} 