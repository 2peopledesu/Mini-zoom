# Mini-zoom

A web-based video chat application that provides real-time video conferencing and chat functionality, built with React and Spring Boot.

## Features

### 1. Video Conference

- Real-time video communication using WebRTC
- Support for multiple participants (up to 9)
- Dynamic grid layout based on participant count
- Automatic video quality adjustment
- Display participant names on video feeds
- Local video preview

### 2. Chat System

- Real-time text messaging
- Image sharing capabilities
- Join/Leave notifications
- Message history
- Support for emoji and text formatting
- File upload with drag & drop support

### 3. Room Management

- Create new chat rooms
- Join existing rooms
- View active participants
- Real-time room list updates
- Participant limit management

## Technical Details

### Frontend

- React 18 with TypeScript
- Material-UI for responsive design
- WebRTC for peer-to-peer video
- STOMP WebSocket for real-time messaging
- File handling with drag & drop API

### Backend

- Spring Boot 3.2
- WebSocket with STOMP protocol
- MongoDB for message persistence
- File storage system

## Prerequisites

- Node.js 16+
- Java 17+
- MongoDB 7.0+
- Modern web browser (Chrome, Firefox, Safari)

## Installation

### Backend Setup

- bash
- cd backend
- ./gradlew build
- ./gradlew bootRun

### Frontend Setup

- bash
- cd frontend
- npm install
- npm start

## Environment Variables

### Frontend (.env)

REACT_APP_API_URL = http://localhost:8080
REACT_APP_WS_URL = ws://localhost:8080/ws

### Backend (application.properties)

- properties
- spring.data.mongodb.uri=mongodb://localhost:27017/minizoom
- spring.servlet.multipart.max-file-size = 10MB

## Application Flow

1. Initial Setup

   - Enter display name on the welcome screen
   - System generates a unique user ID

2. Room Management

   - Create new room with custom name
   - Join existing rooms from the active room list
   - View current participant count in each room

3. Video Conference Features

   - Grid layout automatically adjusts based on participant count:
   - Local video preview with name overlay
   - Remote participant streams with names
   - Muted local audio by default

4. Chat Features
   - Real-time messaging using WebSocket/STOMP
   - Join/Leave notifications
   - Image sharing with preview

### WebRTC Implementation

- Peer-to-peer connection management
- ICE candidate exchange
- Stream handling and track management
