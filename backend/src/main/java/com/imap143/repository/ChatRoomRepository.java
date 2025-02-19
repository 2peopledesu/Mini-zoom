package com.imap143.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.imap143.model.ChatRoom;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    List<ChatRoom> findByParticipantsContaining(String userId);
    List<ChatRoom> findByActiveParticipantsContaining(String userId);
} 