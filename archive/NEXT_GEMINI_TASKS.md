# NEXT GEMINI TASKS

## Executable Tasks for Gemini

### P1 Tasks (Highest Priority)
1. **SETUP_SUPABASE_STORAGE**: Configure Supabase Storage bucket for image hosting with proper security policies
   - Create storage bucket named 'images'
   - Set up public access policies for image serving
   - Create upload endpoint function

2. **IMPLEMENT_IMAGE_UPLOAD**: Build image upload API endpoint
   - Create POST /api/images endpoint
   - Handle base64 image data
   - Store image in Supabase Storage
   - Return image URL and metadata

3. **CREATE_IMAGE_GALLERY_UI**: Build basic image gallery component
   - Fetch images from Supabase Storage
   - Display thumbnail grid
   - Enable image selection

### P2 Tasks (High Priority)
4. **SETUP_IMAGE_METADATA_DB**: Create database schema for image metadata
   - Create images table with id, url, upload_date, user_id, tags
   - Set up indexes for efficient querying
   - Create helper functions for CRUD operations

5. **IMPLEMENT_IMAGE_DELETE**: Add image deletion functionality
   - Create DELETE /api/images/:id endpoint
   - Remove image from Supabase Storage
   - Delete metadata from database

### P3 Tasks (Medium Priority)
6. **ADD_IMAGE_VALIDATION**: Implement image validation and processing
   - Validate file types (JPEG, PNG, GIF, WebP)
   - Limit file size (max 10MB)
   - Generate thumbnails for display

### P4 Tasks (Lower Priority)
7. **IMPLEMENT_BATCH_UPLOAD**: Add support for multiple image uploads
   - Handle array of base64 images
   - Process uploads concurrently
   - Return results for all images

## Task Selection Guidelines
- Start with P1 tasks in order
- Only move to P2 when P1 tasks are complete or blocked
- Each task should be completable in 1-4 hours of focused work
- Tasks must be executable with clear acceptance criteria