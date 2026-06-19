# Reusable Security Patterns

## Purpose
To document proven, reusable security patterns for building secure, multi-tenant SaaS applications, particularly those handling sensitive client data like API keys.

---

### **Pattern 1: Encrypt Secrets at Rest with AES-256-GCM**

- **Use Case:** Storing sensitive client secrets (API keys, access tokens) in the database in a way that they are unreadable even if the database is compromised.
- **Pattern:** "Bring Your Own Key" (BYOK) model combined with authenticated encryption.
    1.  **Master Key:** A single, strong `ENCRYPTION_KEY` (e.g., a 32-byte hex string) is stored as a server-side environment variable. This key is the root of trust.
    2.  **Encryption on Write:** When a client submits an API key, a server-side action:
        - Generates a unique, random 12-byte Initialization Vector (`iv`).
        - Uses the `ENCRYPTION_KEY` and `iv` to encrypt the secret using **AES-256-GCM**.
        - Obtains the `ciphertext` and the `authTag` from the cipher.
        - Stores the result in the database as a single string: `iv:authTag:ciphertext`.
    3.  **Decryption on Read:** When the key is needed for an API call, a server-side action:
        - Retrieves the `iv:authTag:ciphertext` string from the database.
        - Splits the string into its three components.
        - Uses the same `ENCRYPTION_KEY`, `iv`, and `authTag` to decrypt the `ciphertext`.
- **Benefit:** This provides strong, authenticated encryption. The `authTag` ensures that the encrypted data has not been tampered with. Storing the `iv` with the ciphertext allows each secret to be encrypted uniquely.

---

### **Pattern 2: Server-Side Decryption Only**

- **Use Case:** A strict architectural rule to minimize the exposure of decrypted secrets.
- **Pattern:**
    - The `ENCRYPTION_KEY` exists ONLY as a server-side environment variable. It is never exposed to the client.
    - Decryption logic exists ONLY within secure, server-side functions (e.g., Next.js Server Actions).
    - A decrypted key is held in memory only for the brief moment it is needed to make a third-party API call from the server.
    - **Crucially, a decrypted key is NEVER sent back to the client-side browser or stored in React state.**
- **Benefit:** Massively reduces the attack surface. Even if a user's browser is compromised (e.g., via a malicious extension), there are no decrypted secrets to steal from the client-side application.

---

### **Pattern 3: Universal Row Level Security (RLS)**

- **Use Case:** Enforcing strict data isolation in a multi-tenant database (like Supabase/PostgreSQL) where multiple clients' data resides in the same tables.
- **Pattern:**
    1.  **Enable RLS on ALL tables by default.** This creates a "deny-all" security posture. No data can be accessed unless a policy explicitly allows it.
    2.  For each table, create an RLS policy that allows a user to access a row only if the `user_id` column in that row matches the `auth.uid()` of the currently authenticated user.
    3.  Example policy for a `brands` table: `CREATE POLICY "Users can access their own brands" ON brands FOR ALL USING (auth.uid() = user_id);`
- **Benefit:** This is a powerful, database-level guarantee of data privacy. It prevents one user from ever being able to accidentally or maliciously access another user's data, even if there is a bug in the application code.

---

### **Pattern 4: Secure "Single-Owner" Mode for Development**

- **Use Case:** Allowing a developer or a single-client deployment to use the application without the friction of a login UI, while maintaining security.
- **Pattern:**
    - The application has an environment variable, `APP_MODE`.
    - If `APP_MODE` is `"multi_user"`, normal authentication is enforced.
    - If `APP_MODE` is `"single_owner"`, the application uses the Supabase `service_role_key`. This key is configured to bypass RLS policies, giving it full access to the database.
- **Benefit:** In development, this removes the need to constantly log in and out. For a dedicated, single-client deployment, it provides a secure way for the owner to operate the application without managing user accounts, while still relying on the underlying RLS for any potential future users.
