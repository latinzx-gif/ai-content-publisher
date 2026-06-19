# Delivery QA Checklist: AI Content Publisher

## Purpose
An internal checklist to be completed by the delivery lead before handing a new instance over to a client. This ensures quality and consistency.

**Instance URL:** `_________________________`
**QA Date:** `_________________________`
**QA Lead:** `_________________________`

---

### **Phase 1: Setup & Configuration Checks**

- [ ] **Build Status:** The latest Vercel deployment completed successfully.
- [ ] **Environment Variables:** All required environment variables are set in Vercel and match the client's `.env.local` file.
- [ ] **Database Migrations:** All Supabase migration scripts have run successfully.
- [ ] **RLS Policies:** Row Level Security is confirmed as **Enabled** on all tables in the Supabase dashboard.

---

### **Phase 2: Core Feature QA**

- [ ] **Login/Register:**
    - [ ] If `APP_MODE=multi_user`, user can register and log in.
    - [ ] If `APP_MODE=single_owner`, the app loads directly without a login screen.
- [ ] **Brand Profile Setup:**
    - [ ] A new Brand Profile can be created and saved successfully.
    - [ ] The saved profile can be edited and re-saved.
- [ ] **API Key Encryption:**
    - [ ] OpenAI and Buffer keys can be entered, encrypted, and saved.
    - [ ] The `integrations` table in Supabase shows the `encrypted_value` is not plain text.
- [ ] **Content Generation:**
    - [ ] A "Quick Mode" generation completes successfully and creates a `draft` post.
    - [ ] An "Advanced Mode" generation with overridden settings (e.g., a custom CTA) completes successfully.
- [ ] **Draft Review:**
    - [ ] Generated drafts appear on the `/drafts` page.
    - [ ] **[KNOWN GAP]** The UI to "approve" a draft is missing. QA is limited to verifying draft creation.
- [ ] **Image Generation / Custom Visual Template Service:**
    - [ ] **[CRITICAL GAP]** This feature is **required for Standard & Premium packages** but is not yet implemented in the application. QA must confirm the feature is disabled in the UI for all packages.
    - [ ] *Internal Note:* A "Custom Visual Template Service" is offered, which implies this feature should work. Its current state is a critical blocker for higher tiers.
- [ ] **Creative Approval:**
    - [ ] **[KNOWN GAP]** Dependent on Image Generation. Not testable. The UI for this should also be disabled or marked as "Coming Soon".
- [ ] **Buffer Publishing/Scheduling:**
    - [ ] A post with status `text_approved` can be successfully published to Buffer. (Manual status change in DB required for test).
    - [ ] **[KNOWN GAP]** UI for triggering the publish action from the Drafts page is missing. Test must be done via direct action call if possible.

---

### **Phase 3: Final Checks**

- [ ] **Mobile Responsiveness:** The app is usable on a mobile-sized screen (Chrome DevTools).
- [ ] **Error Handling:** Attempting to generate content without an OpenAI key displays a user-friendly error message.
- [ ] **Security:** Confirm the master `ENCRYPTION_KEY` is NOT present in any client-side code.
- [ ] **Client Handoff Doc:** The `CLIENT_HANDOFF` document has been prepared with the client's specific URL and login.

### **Final Verdict**
- [ ] **PASS:** Ready for client handoff.
- [ ] **FAIL:** Critical issues found. Do not deliver.
