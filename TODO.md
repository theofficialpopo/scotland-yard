# Scotland Yard - Implementation Roadmap

## Overview
This document outlines the implementation plan for session persistence, admin panel, and UI improvements.

---

## Feature 1: Session Persistence & Rejoining 🔄

### Goals
- Players can close browser and rejoin their game
- Room code in URL for easy sharing and rejoining
- Automatic reconnection when returning to site
- Secure player identity verification

### Tasks

#### Research Phase
- [ ] 1. Research best practices for session persistence in multiplayer games
- [ ] 2. Research authentication methods: cookies vs localStorage vs sessionStorage

#### Session Token System
- [ ] 3. Design session token system for player rejoining
- [ ] 4. Implement server-side session management
- [ ] 5. Store player session tokens (server-side)
- [ ] 6. Implement client-side session token storage (localStorage)

#### URL Integration
- [ ] 7. Add room code to URL for sharing and rejoining
- [ ] 8. Implement auto-rejoin logic on page load
- [ ] 9. Add IP verification as fallback for session validation

#### Reconnection Logic
- [ ] 10. Handle reconnection during active games

---

## Feature 2: Admin Panel 🛠️

### Goals
- View all active game rooms
- Monitor dev console logs per room
- Display game statistics
- Useful for debugging and analytics

### Tasks

#### Admin Panel Implementation
- [ ] 11. Create admin panel UI component
- [ ] 12. Implement server endpoint to list all active rooms
- [ ] 13. Add dev console view for each room in admin panel
- [ ] 14. Add statistics display in admin panel

### Features
- **Room List View:**
  - Room code, player count, game status
  - Current round, time elapsed
  - Host name

- **Dev Console:**
  - Real-time logs for each room
  - Move history, errors, events

- **Statistics:**
  - Total games played
  - Average game duration
  - Win rates (Mr. X vs Detectives)
  - Player count distribution

### Access
- Protected admin route (e.g., `/admin`)
- Simple password or environment variable protection

---

## Feature 3: Settings UI Improvement ⚙️

### Goals
- Cleaner UI without prominent Leave button
- Centralized settings location
- Ready for future features

### Tasks

#### Settings Panel
- [ ] 15. Replace Leave Game button with settings icon
- [ ] 16. Create settings modal/panel UI
- [ ] 17. Add Leave Game option to settings panel

### Changes
- Remove "Leave Game" button from top HUD
- Add **⚙️ Settings icon** in top right
- Create settings modal with:
  - Leave Game option
  - Future settings (sound, notifications, etc.)

---

## Testing & Deployment

- [ ] 18. Test session persistence across browser sessions
- [ ] 19. Test admin panel functionality
- [ ] 20. Commit and push session persistence features

---

## Research Findings

### Session Persistence Best Practices
- Token expiration strategies
- Security considerations
- Socket.IO reconnection patterns

### Authentication Methods Comparison
- **localStorage**: Persists forever, survives browser close ✅ Best for our use case
- **sessionStorage**: Only lasts browser session
- **Cookies**: Can be HTTP-only, more secure but less convenient

### IP Verification
- Additional security layer
- Prevents token theft
- Consider dynamic IPs (mobile users)

---

## Implementation Order

1. **Research** (Tasks 1-2) → Gather best practices
2. **Session System** (Tasks 3-9) → Core rejoining functionality
3. **Reconnection** (Task 10) → Handle active game rejoins
4. **Admin Panel** (Tasks 11-14) → Monitoring dashboard
5. **Settings UI** (Tasks 15-17) → Better UX
6. **Testing** (Tasks 18-19) → Validate everything works
7. **Deploy** (Task 20) → Push to production

---

## Notes

- Each task is designed to build on previous ones
- Session tokens should expire after 24 hours of inactivity
- Admin panel should be lightweight and real-time
- Settings panel prepares for future feature additions
