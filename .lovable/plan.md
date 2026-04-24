
Plan to make the Account page cleaner and move the top controls lower

1. Redesign the Account page top area
   - Update `src/pages/Profile.tsx`.
   - Reduce the empty top space and make the first screen easier to read on mobile.
   - Keep the design emerald, rounded, Apple-like, and compact.
   - Remove the current oversized feel from the top action pills.

2. Move Translate, Notifications, and More down into a clear account actions row
   - Move the language selector, Notifications button, and More button lower so they are not crowded at the very top.
   - Place them under the ZIVO+ / story area or directly above the profile card, depending on what fits best on the 428px mobile viewport.
   - Make each button smaller and easier to scan:
     - Translate / language
     - Notifications
     - More
   - Keep unread notification badge visible but compact.

3. Improve the “Your story” section
   - Make “Your story” clearer and more polished.
   - Reduce large blank spacing around it.
   - Use a compact horizontal story card/row so it does not push the profile card too far down.
   - Keep the add story action easy to tap.

4. Improve the ZIVO+ upgrade banner
   - Make the upgrade banner smaller and cleaner.
   - Keep the crown icon and “Upgrade to ZIVO+” message.
   - Reduce height, padding, and border weight.
   - Position it so it feels like an account benefit card, not a large blocking banner.

5. Make the profile card appear sooner
   - Reduce vertical spacing between:
     - Top actions
     - ZIVO+ banner
     - Story section
     - Profile card
   - On mobile, the user should see more of the profile card without scrolling.
   - Keep avatar, name, status, bio, and stats readable.

6. Keep Notifications dropdown functional
   - The Notifications button will still open the inline notification panel.
   - The panel will stay visually aligned with the moved button.
   - If the panel is too tall on mobile, make it compact with smaller rows and spacing.

7. Keep language picker functional
   - The Translate / language button will still open the language picker.
   - The picker will remain reachable and not overlap the profile card badly.
   - Current selected flag and language will still show.

8. Keep More navigation functional
   - The More button will still route to `/more`.
   - Make it visually consistent with Translate and Notifications.

9. Mobile validation target
   - Check the layout at the current viewport: `428x703`.
   - Confirm:
     - Top controls are lower and clearer.
     - Your Story is not too large.
     - Upgrade banner is smaller.
     - Profile card is visible sooner.
     - Bottom navigation is not blocked.
     - The page looks cleaner and less crowded.

Expected result

The Account page will feel cleaner and easier to use on mobile. Translate, Notifications, More, Your Story, and Upgrade will be moved into a clearer compact layout so the profile card is visible sooner and the screen no longer feels too big or crowded.
