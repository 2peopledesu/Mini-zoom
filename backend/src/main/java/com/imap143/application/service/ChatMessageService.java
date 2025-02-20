package com.imap143.application.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.imap143.api.dto.response.ChatMessageResponse;
import com.imap143.application.dto.ChatMessageDto;
import com.imap143.domain.entity.ChatMessage;
import com.imap143.domain.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageResponse saveMessage(ChatMessageDto messageDto) {
        ChatMessage message = new ChatMessage();
        message.setRoomId(messageDto.getRoomId());
        message.setSenderId(messageDto.getSenderId());
        message.setSenderName(messageDto.getSenderName());
        message.setContent(messageDto.getContent());
        message.setType(messageDto.getType());
        message.setTimestamp(messageDto.getTimestamp());
        message.setImageUrl(messageDto.getImageUrl());
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        return ChatMessageResponse.from(savedMessage);
    }

    public List<ChatMessageResponse> getRoomMessages(String roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        return messages.stream()
            .map(ChatMessageResponse::from)
            .toList();
    }

    public List<ChatMessageResponse> getRoomMessagesSince(String roomId, long timestamp) {
        List<ChatMessage> messages = chatMessageRepository
            .findByRoomIdAndTimestampGreaterThanOrderByTimestampAsc(roomId, timestamp);
        return messages.stream()
            .map(ChatMessageResponse::from)
            .toList();
    }

    public void deleteMessage(String roomId) {
        chatMessageRepository.deleteByRoomId(roomId);
    }
} 