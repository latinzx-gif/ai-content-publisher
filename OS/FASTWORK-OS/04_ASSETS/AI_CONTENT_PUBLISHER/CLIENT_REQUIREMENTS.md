# Client Requirements Checklist

## Purpose
To provide a clear checklist of all information and assets that must be obtained from a client before a new "AI Content Publisher" instance can be delivered.

## Format
A simple checklist organized by category.

---

### **1. Platform Accounts & Credentials**

- [ ] **Supabase Project:** The client must have a Supabase account and create a new project.
    - [ ] Client provides the `Supabase URL`.
    - [ ] Client provides the `Supabase Anon Key`.
    - [ ] Client provides the `Supabase Service Role Key`.
- [ ] **OpenAI Account:** The client must have an OpenAI account with billing enabled.
    - [ ] Client provides their `OpenAI API Key`.
- [ ] **Social Media Publisher Account:** The client must have an account with the target publishing platform.
    - [ ] Example (Buffer): Client provides their `Buffer Access Token`.

---

### **2. Security Configuration**

- [ ] **Master Encryption Key (`ENCRYPTION_KEY`):**
    - [ ] Explain to the client that a secret key is needed to encrypt their API keys.
    - [ ] Guide the client to generate a 32-byte hex key using a tool like `openssl rand -hex 32`.
    - [ ] Client provides the generated key. **This key must be stored securely and not shared publicly.**

---

### **3. Brand Profile & Strategy**

- [ ] **Brand Identity Workshop:** Complete a kickoff call with the client to define their brand profile.
    - [ ] **Brand Name:** The name of their business.
    - [ ] **Business Type:** Select from the predefined list (e.g., `Legal`, `Accounting`, `SaaS`). This is critical for activating compliance rules.
    - [ ] **Target Audience:** A detailed description of their ideal customer.
    - [ ] **Tone:** A list of adjectives describing the desired writing tone (e.g., "Professional, authoritative, but approachable").
    - [ ] **Personality:** A description of the brand's persona (e.g., "A helpful expert and trusted advisor").
- [ ] **Strategic Information:**
    - [ ] **Website URL:** The client's primary business website.
    - [ ] **Forbidden Topics:** A list of topics, competitors, or keywords that the AI must never mention in its generated content.

### **4. Content & Asset Requirements**

- [ ] **Visual Identity (for image generation):**
    - [ ] Client provides their brand logo (in SVG or high-res PNG format).
    - [ ] Client provides their primary and secondary brand colors (hex codes).
- [ ] **Existing Content (Optional):**
    - [ ] Client provides 2-3 links to existing blog posts or articles that represent their desired style. This can be used as a knowledge source for initial generations.
