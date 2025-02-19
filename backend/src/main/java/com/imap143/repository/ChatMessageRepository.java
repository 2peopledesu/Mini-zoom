package com.imap143.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.imap143.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);
    List<ChatMessage> findByRoomIdAndTimestampGreaterThanOrderByTimestampAsc(String roomId, long timestamp);
} 