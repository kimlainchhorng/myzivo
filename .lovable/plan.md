
# Next Update — Full Feature Build

## ✅ Phase 1: Post Creation Upgrade — DONE
- Multi-image carousel (up to 10), @mention tagging, location tags, CSS filters

## ✅ Phase 2: Stories Feature — DONE
- Story creation, story rings, story viewer with progress bar, auto-cleanup

## ✅ Phase 3: Comments & Notifications — DONE
- Threaded comments with emoji reactions, real-time social notifications

## ✅ Phase 4: Call Enhancements — DONE
- Call quality indicator (useCallQuality + CallQualityBadge)
- Screen sharing (useScreenShare with track replacement)
- Picture-in-picture (draggable PiP in CallScreen)
- Call recording intentionally removed

## ✅ Phase 5: Group Calls — DONE
- **useGroupCall** — Mesh WebRTC with Supabase Realtime broadcast signaling
- **useSpeakerDetection** — AudioContext-based RMS analysis for active speaker highlight
- **GroupCallScreen** — Participant grid with speaker detection border highlighting
- **GroupCallInviteBubble** — Chat message component for group call invitations
- Group call DB tables (group_calls, group_call_participants) already existed

## Architecture Notes
- Group calls use mesh topology (each peer connects to every other peer)
- Signaling uses Supabase Realtime broadcast (not DB polling) for low latency
- Speaker detection uses Web Audio API with 150ms polling and 600ms silence delay
- Deterministic offer initiation (higher user ID initiates) prevents duplicate offers
