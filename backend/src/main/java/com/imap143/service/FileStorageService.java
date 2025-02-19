package com.imap143.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String storeFile(MultipartFile file, String roomId) {
        try {
            Path uploadPath = Paths.get(uploadDir, roomId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String extension = "";
            
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            } else {
                String contentType = file.getContentType();
                if (contentType != null && contentType.contains("image/")) {
                    extension = "." + contentType.substring(contentType.lastIndexOf("/") + 1);
                } else {
                    extension = ".jpg";
                }
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + roomId + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename(), ex);
        }
    }
} 