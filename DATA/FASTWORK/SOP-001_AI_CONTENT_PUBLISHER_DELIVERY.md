# SOP-001: AI Content Publisher Delivery (Master)

- **ID:** SOP-001
- **Version:** 1.2
- **Status:** Active
- **Owner:** FASTWORK Delivery Lead
- **Purpose:** To provide a standardized, repeatable master checklist for deploying and delivering a new instance of the "AI Content Publisher" service. This SOP orchestrates the use of other, more detailed delivery assets.

---

### **Scope Consistency Rule**

**CRITICAL:** The `SERVICE_PACKAGE_AI_CONTENT_PUBLISHER.md`, `DELIVERY_QA_CHECKLIST_AI_CONTENT_PUBLISHER.md`, and `CLIENT_HANDOFF_AI_CONTENT_PUBLISHER.md` documents **MUST** always be consistent regarding what features are included in each package tier and what the current known limitations are. Contradictions between these client-facing documents will lead to client dissatisfaction and delivery failures.

---

### **Phase 1: Pre-Deployment Setup (Client Kickoff)**

- [ ] **1.1. Finalize Service Package:**
    - [ ] Confirm with the client which tier from `SERVICE_PACKAGE_AI_CONTENT_PUBLISHER.md` they have purchased (Starter, Standard, or Premium).
- [ ] **1.2. Gather Client Assets:**
    - [ ] Send the `CLIENT_REQUIREMENTS_AI_CONTENT_PUBLISHER.md` checklist to the client.
    - [ ] Confirm all items have been received. Store all credentials securely in a temporary, encrypted location.
- [ ] **1.3. Create Private Repository & Configure Environment:**
    - [ ] Create a new private GitHub repository for the client from the main project template.
    - [ ] Create and populate the `.env.local` file with the client's keys and configuration. Do not commit this file.

---

### **Phase 2: Technical Configuration**

- [ ] **2.1. Run Database Migrations & Verify RLS:**
    - [ ] Connect to the client's Supabase project and execute the `initial_schema.sql` script.
    - [ ] Manually verify in the Supabase dashboard that Row Level Security is **Enabled** on all tables.
- [ ] **2.2. Install Dependencies & Verify Build:**
    - [ ] Run `npm install`.
    - [ ] Run `npm run build` and ensure it completes without errors.

---

### **Phase 3: Deployment & QA**

- [ ] **3.1. Deploy to Vercel:**
    - [ ] Create a new Vercel Project and connect the client's repository.
    - [ ] Copy all environment variables from `.env.local` into the Vercel project's "Environment Variables" settings.
    - [ ] Trigger and verify the first successful deployment.
- [ ] **3.2. Conduct Internal QA:**
    - [ ] Before notifying the client, perform a full quality assurance check using the `DELIVERY_QA_CHECKLIST_AI_CONTENT_PUBLISHER.md`.
    - [ ] The QA must have a **PASS** verdict before proceeding. Address any identified issues.

---

### **Phase 4: Client Hand-off & Activation**

- [ ] **4.1. Prepare Handoff Materials:**
    - [ ] Fill in the placeholders (Login URL, Admin Email) in the `CLIENT_HANDOFF_AI_CONTENT_PUBLISHER.md` template.
    - [ ] Attach the `SUPPORT_SCOPE_AI_CONTENT_PUBLISHER.md` document.
- [ ] **4.2. Conduct Guided Onboarding Call:**
    - [ ] Host the live setup call with the client as detailed in the handoff document.
    - [ ] Guide them as they create their Brand Profile and encrypt their API keys.
- [ ] **4.3. Perform Live End-to-End Test:**
    - [ ] With the client, generate and publish one piece of content to ensure the entire lifecycle is working.
- [ ] **4.4. Schedule Follow-up:**
    - [ ] Schedule a 30-minute follow-up call for one week later to check on their progress.
- [ ] **4.5. Mark as Delivered:**
    - [ ] Update the internal project tracker.
