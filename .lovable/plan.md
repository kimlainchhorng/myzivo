
## Create Post Modal — Improvement Plan

### 🐛 Fixes
1. **Only first file uploads** — Currently `handlePost` only uploads `files[0]`, ignoring carousel files 2-10
2. **Album uses `prompt()`** — Replace browser `prompt()` with inline album input (bad UX)
3. **Tag search from button doesn't work properly** — The tag button opens search but uses caption-based matching instead of standalone search

### 🎨 UI/Design (Facebook-style polish)
4. **Larger caption area** — Make textarea auto-grow instead of fixed 3 rows
5. **Better media toolbar** — Align icons evenly across bottom with labels, matching Facebook's grid style
6. **Character counter** — Show remaining chars near caption (2200 max)
7. **Polished visibility selector** — Better dropdown animation and styling

### ✨ New Features
8. **Multi-file upload support** — Actually upload all files and store as carousel
9. **Draft save** — Auto-save draft to localStorage so content isn't lost on accidental close
10. **Emoji picker button** — Quick emoji insertion in caption
11. **Post scheduling** — Option to schedule post for later

### Which items would you like me to implement?
I recommend starting with the **bug fixes (#1-3)** and **UI polish (#4-7)** as priority.
