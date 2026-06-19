# Reusable Database Patterns

## Purpose
To document proven, reusable database schemas and patterns for building secure, multi-tenant SaaS applications on top of Supabase/PostgreSQL.

---

### **Pattern 1: Decoupled User and Brand Identity**

- **Use Case:** Applications where a single user account might need to manage multiple distinct brands or projects, each with its own settings.
- **Structure:**
    - **`profiles` table:** Linked 1-to-1 with `auth.users`. Stores the user's identity (email, user ID).
    - **`brands` table:** Belongs to a `user_id` from `profiles`. Stores the specific operational identity and settings for a project (e.g., `name`, `tone`, `personality`, `business_type`).
- **Benefit:** This allows a user to switch between different brand contexts without needing multiple logins. It also provides a clean separation between the authenticated user and the operational settings of the content they are creating.

---

### **Pattern 2: Generic, Encrypted Secrets Store**

- **Use Case:** Storing sensitive, third-party API keys or tokens (e.g., OpenAI keys, social media access tokens) for each user in a secure and extensible way.
- **Structure:**
    - **`integrations` table:**
        - `user_id`: Foreign key to the user.
        - `provider`: A simple text field to identify the service (e.g., 'openai', 'buffer', 'stripe').
        - `encrypted_value`: A text field containing the encrypted secret.
        - A `UNIQUE` constraint on `(user_id, provider)` to prevent duplicate entries.
- **Benefit:** This generic table can be used to store secrets for any number of future integrations without requiring database schema changes. The encryption pattern (see `SECURITY_PATTERNS.md`) ensures secrets are protected at rest.

---

### **Pattern 3: Action-Oriented Audit Trail**

- **Use Case:** Creating a comprehensive audit log of all significant actions performed by users or system agents. Crucial for debugging, analytics, and compliance.
- **Structure:**
    - **`workflow_logs` table:**
        - `user_id`: Identifies who initiated the action.
        - `action`: A clear description of the action being performed (e.g., 'GENERATE_CONTENT', 'PUBLISH_POST').
        - `status`: The current state of the action ('pending', 'completed', 'failed').
        - `topic` (or `metadata`): A JSONB field to store the inputs or context of the action.
- **Benefit:** Provides full traceability for every job in the system. This data can be used to power a user-facing activity feed, calculate usage metrics, or debug a failed workflow.

---

### **Pattern 4: Content Lifecycle Management**

- **Use Case:** Tracking a piece of content from its creation to its final state (e.g., published, archived).
- **Structure:**
    - **`content_posts` table:**
        - `workflow_id`: Foreign key linking the content back to the `workflow_logs` entry that created it.
        - `content`: The core generated text or data.
        - `status`: A state machine field (e.g., 'draft', 'approved', 'published', 'archived').
        - `external_post_id`: A field to store the ID of the post on the third-party platform (e.g., the post ID from the Buffer API).
- **Benefit:** Allows the application to track and potentially update or delete content on external platforms. Provides a clear view of the content inventory and its current state.
