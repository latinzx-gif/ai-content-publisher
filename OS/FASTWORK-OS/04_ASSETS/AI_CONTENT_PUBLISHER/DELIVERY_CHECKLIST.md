# Delivery & Deployment Checklist

## Purpose
To provide a step-by-step Standard Operating Procedure (SOP) for deploying and delivering a new instance of the "AI Content Publisher" for a client.

## Format
A checklist organized by deployment phase. This ensures every delivery is consistent, secure, and complete.

---

### **Phase 1: Pre-Deployment Setup**

- [ ] **1.1. Gather Client Assets:** Confirm all items from the `CLIENT_REQUIREMENTS.md` checklist have been received from the client.
- [ ] **1.2. Fork Repository:** Create a new, private GitHub repository for the client from the main project template.
- [ ] **1.3. Configure Environment:** Create a `.env.local` file for the project and populate it with the client's Supabase keys, the master `ENCRYPTION_KEY`, and other required variables. **Do not commit this file.**

---

### **Phase 2: Database and Backend Configuration**

- [ ] **2.1. Run Database Migrations:** Connect to the client's Supabase instance and run the `initial_schema.sql` script to create all necessary tables.
- [ ] **2.2. Verify RLS Policies:** Manually navigate to the "Authentication" -> "Policies" section in the Supabase dashboard. Verify that Row Level Security is **Enabled** for all tables and that the correct policies are active.
- [ ] **2.3. Install Dependencies:** Run `npm install` in the project directory.
- [ ] **2.4. Run Build Verification:** Run `npm run build`. The command must complete without errors. This validates that all environment variables are correctly configured.

---

### **Phase 3: Deployment to Vercel**

- [ ] **3.1. Create Vercel Project:** Connect the new private GitHub repository to a new project in Vercel.
- [ ] **3.2. Set Vercel Environment Variables:** Copy all variables from the `.env.local` file into the Vercel project's "Environment Variables" settings. Ensure they are set for "Production, Preview, and Development" environments.
- [ ] **3.3. Trigger First Deployment:** Push a small change to the main branch to trigger the first Vercel deployment.
- [ ] **3.4. Verify Deployment:** Once the deployment is complete, access the Vercel URL and confirm that the application loads without errors.

---

### **Phase 4: Client Hand-off & Calibration**

- [ ] **4.1. Onboard Client Admin:** Invite the client to the application.
- [ ] **4.2. Guided Setup:** Walk the client through the settings page to:
    - [ ] Create their first `Brand Profile` using the information from the kickoff call.
    - [ ] Enter and encrypt their `OpenAI API Key` and other integration tokens.
- [ ] **4.3. Run First Generation:** With the client, perform the first end-to-end test:
    - [ ] Generate a piece of content using "Quick Mode".
    - [ ] Review the content with them.
    - [ ] Make any minor adjustments to the `tone` or `personality` in their Brand Profile based on their feedback.
- [ ] **4.4. Schedule Follow-up:** Schedule a follow-up call for one week later to review their progress and answer any questions.
- [ ] **4.5. Mark Project as "Delivered"**: Update internal project tracker.
