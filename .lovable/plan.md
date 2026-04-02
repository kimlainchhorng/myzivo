
# Communication Workflow Upgrade Plan

## Phase 1: Database Schema (Migration)
Create tables for:
- **call_history** — Log all calls with duration, type, participants, recording URL
- **voicemails** — Store voicemail recordings with transcription
- **chat_media** — Track uploaded files/images/videos in chat threads
- **group_calls** — Multi-party call sessions with participant list
- **call_recordings** — Store recordings with consent tracking

## Phase 2: Chat Media & File Sharing
- Upload images, videos, documents, voice notes in chat
- File preview cards with download links
- Upload progress indicator
- Voice note recording with waveform playback
- Integration with Supabase Storage bucket

## Phase 3: Call History & Voicemail
- Call log page showing missed/incoming/outgoing calls
- Duration tracking in WebRTC hook
- Voicemail recording when call is declined/missed
- Voicemail playback with duration display

## Phase 4: Live Chat-to-Call Handoff
- "Call" button inside PersonalChat that initiates WebRTC call
- Seamless transition from text to voice/video
- Call state shown inline in chat thread
- Return to chat after call ends

## Phase 5: Call Enhancements
- **Call quality indicator**: Monitor RTCPeerConnection stats (bitrate, packet loss, jitter)
- **Picture-in-picture**: Floating mini video during navigation
- **Screen sharing**: Add screen track to WebRTC connection
- **Call recording**: MediaRecorder on combined streams with consent UI

## Phase 6: Group Video/Voice Calls
- Multi-party mesh topology (up to 4 participants)
- Participant grid layout with speaker detection
- Group call invite system via chat

## Implementation Order
1. Migration (all tables at once)
2. Chat media sharing + chat-to-call handoff (core workflow)
3. Call history + voicemail
4. Call quality + PiP + screen sharing + recording
5. Group calls (most complex)
