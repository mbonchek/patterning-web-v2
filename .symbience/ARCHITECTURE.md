# ARCHITECTURE Protocol

**System design principles for Patterning.ai V2**

---

## System Overview

Patterning.ai is a sophisticated AI-powered word pattern generation platform that creates multi-layered verbal and visual interpretations of words through a 7-step pipeline.

**Stack:**
- Frontend: React, TypeScript, Vite, Lucide React icons
- Backend: Python, FastAPI, PostgreSQL (Supabase)
- AI Models: Claude (text), Gemini (images)
- Deployment: Railway (auto-deploy from GitHub)

---

## Conceptual Architecture

### Pattern Types

Patterning.ai is designed to support multiple **pattern types**, each with its own generation pipeline and data structure:

- **Word Patterns** (`patterns_word`) - Multi-layered verbal and visual interpretations of words
- **Song Patterns** (`patterns_song`) - Future: Musical patterns (not yet implemented)
- **Other Pattern Types** - Extensible architecture for new pattern types

### Seeds vs Patterns

**Seed:** The input that starts the generation process
- For word patterns: the word text (e.g., "ghost", "love")
- Stored in `word_seeds` table
- One seed can have multiple patterns

**Pattern:** A complete generated artifact
- One specific generation run for a seed
- Includes all layers: verbal_layer, verbal_voicing, verbal_essence, visual_layer, visual_essence, visual_image
- Stored in `patterns_word` table with foreign keys to all element tables
- Each pattern has a unique ID and timestamp

**Why multiple patterns per seed?**
- Users can regenerate the same word with different prompts/models
- Experimentation and iteration
- Version history
- A/B testing different approaches

### Pattern Routing

**By Pattern ID (specific):**
- Route: `/pattern/word/{id}`
- API: `/api/pattern/word/{id}`
- Returns: One specific pattern with all its elements
- Use case: Clicking a pattern card in the Library

**By Word (latest):**
- Route: `/{word}`
- API: `/api/word/{word}`
- Returns: All patterns for that word (sorted by created_at desc)
- Use case: Public-facing word pages, showing most recent pattern

**Library View:**
- Shows all patterns across all seeds
- Can mix word patterns and song patterns (future)
- Each card links to the specific pattern by ID

### Element Reuse

Elements (verbal_layer, visual_image, etc.) can theoretically be shared across patterns, though in practice each pattern generates its own elements. The database design supports reuse:

- Pattern deletion checks for orphaned elements
- Only deletes elements not referenced by other patterns
- This enables future optimizations (e.g., caching, deduplication)

---

## The 7-Step Pipeline

Each word goes through 7 generation steps, each producing a specific output:

### 1. word_verbal_layer → verbal_layer
- **Input:** `{word}`, `{seed}`
- **Output:** Comprehensive analysis of the word's pattern
- **Model:** Claude
- **Purpose:** Gather what's present about the word

### 2. word_verbal_voicing → verbal_voicing
- **Input:** `{word}`, `{verbal_layer}`
- **Output:** First-person voice of the pattern (300-400 words)
- **Model:** Claude
- **Purpose:** Give voice to the pattern as living intelligence

### 3. word_verbal_essence → verbal_essence
- **Input:** `{word}`, `{verbal_voicing}`
- **Output:** One-sentence essence beginning with "I am..."
- **Model:** Claude
- **Purpose:** Distill the pattern to its core

### 4. word_visual_layer → visual_layer
- **Input:** `{word}`, `{verbal_essence}`, `{verbal_voicing}`
- **Output:** Visual elements analysis (color, light, surface, form, movement, tension)
- **Model:** Claude
- **Purpose:** Translate verbal pattern to visual elements

### 5. word_visual_essence → visual_essence
- **Input:** `{word}`, `{visual_layer}`
- **Output:** Visual brief for image generation
- **Model:** Claude
- **Purpose:** Create image generation prompt

### 6. word_visual_image → visual_image
- **Input:** `{visual_essence}`
- **Output:** Generated image (16:9 aspect ratio)
- **Model:** Gemini
- **Purpose:** Create abstract visual expression

### 7. (Removed) word_visual_brief
- **Status:** Consolidated into visual_essence
- **Reason:** Redundant with visual_layer

---

## Database Schema (V2)

### Overview

The V2 schema is fully normalized with a registry pattern. Each word pattern is a record in `patterns_word` that links to component tables via foreign keys. This enables:
- Efficient queries with joins
- Component reusability
- Clean separation of concerns
- Version tracking per component

### Core Tables

**patterns_word** (registry table)
```sql
id: uuid (primary key)
created_at: timestamp
seed_id: uuid → seeds.id
verbal_layer_id: uuid → verbal_layer.id
verbal_voicing_id: uuid → verbal_voicing.id
verbal_essence_id: uuid → verbal_essence.id
visual_layer_id: uuid → visual_layer.id
visual_essence_id: uuid → visual_essence.id
visual_image_id: uuid → visual_image.id
```

**seeds** (word storage)
```sql
id: uuid (primary key)
text: string (the word)
created_at: timestamp
```

**verbal_layer** (step 1 output)
```sql
id: uuid (primary key)
content: text (semantic depth analysis)
prompt_version: string (e.g., "2.1")
created_at: timestamp
```

**verbal_voicing** (step 2 output)
```sql
id: uuid (primary key)
content: text (first-person voice, 300-400 words)
prompt_version: string
created_at: timestamp
```

**verbal_essence** (step 3 output)
```sql
id: uuid (primary key)
content: text (one sentence, "I am...")
prompt_version: string
created_at: timestamp
```

**visual_layer** (step 4 output)
```sql
id: uuid (primary key)
content: text (visual elements analysis)
prompt_version: string
created_at: timestamp
```

**visual_essence** (step 5 output)
```sql
id: uuid (primary key)
content: text (visual brief for image generation)
prompt_version: string
created_at: timestamp
```

**visual_image** (step 6 output)
```sql
id: uuid (primary key)
image_url: string (full resolution)
thumbnail_url: string (optimized preview)
prompt_version: string
created_at: timestamp
```

**prompts** (prompt templates)
```sql
id: uuid (primary key)
slug: string (e.g., "word_verbal_layer")
version: numeric(8,2) (e.g., 2.1)
template: text (prompt with {{variables}})
description: text
comment: text (git-style commit message)
input_variables: string[] (detected variables)
is_active: boolean (only one active per slug)
temperature: float
top_p: float
top_k: integer
max_tokens: integer
created_at: timestamp
```

### Data Flow

**Writing (generation):**
1. Create seed (or reuse existing)
2. Generate verbal_layer → insert into verbal_layer table
3. Generate verbal_voicing → insert into verbal_voicing table
4. Generate verbal_essence → insert into verbal_essence table
5. Generate visual_layer → insert into visual_layer table
6. Generate visual_essence → insert into visual_essence table
7. Generate visual_image → insert into visual_image table
8. Create patterns_word record linking all component IDs

**Reading (history API):**
1. Query patterns_word with LEFT JOINs to all component tables
2. Flatten to: {word, layers, voicing, essence, visual_layer, visual_essence, image_url}
3. Return flat structure for frontend

**Key insight:** The API returns a flat structure for performance, but the database is fully normalized for data integrity.

---

## UI Design Principles

### Icon Library
- **Source:** Lucide React
- **Usage:** Consistent iconography across admin interface

### Color Scheme
- **Verbal components:** Blue (#3b82f6, #60a5fa)
- **Visual components:** Green (#10b981, #34d399)
- **System/Admin:** Purple, Teal
- **Errors:** Red
- **Neutral:** Slate grays

### Component Layout

**Library Cards:**
- 6 components in 2 rows
- Row 1: Verbal (Layers, Voicing, Essence)
- Row 2: Visual (Layers, Essence, Image)
- Icon-based design with colored backgrounds

**Prompt Variables:**
- Display format: `{input_vars} → output_var`
- Example: `{word} {seed} → verbal_layer`
- System prompts don't show variables

---

## Key Design Decisions

### Prompt Versioning
- **System:** Semantic versioning (like git)
- **Format:** Major.Minor (1.0, 1.1, 2.0)
- **Bumping:** 
  - Minor (+0.1): Small tweaks
  - Major (+1.0): Significant changes (>20% diff)
- **Comments:** Git-style commit messages

### Variable Naming
- **Convention:** Consistent across pipeline
- **Mapping:** Frontend must match backend exactly
- **Available vars:** Defined per prompt slug in getAvailableVariables()

### API Response Format
- **History endpoint:** Flat structure for performance
- **Pattern detail:** Nested structure for completeness
- **Streaming:** Server-sent events for real-time generation

### Image Handling
- **Modal:** Fullscreen overlay, not navigation
- **Storage:** Supabase storage with thumbnails
- **Display:** Lazy loading, thumbnail → full resolution

---

## Image Generation System

### Overview

Image generation uses **Gemini** (`gemini-3-pro-image-preview`), NOT DALL-E or other providers. This is a critical detail for debugging and development.

### How It Works

**Step 6 (word_visual_image)** is different from other steps:
- Steps 1-5: Use Claude for text generation
- Step 6: Uses Gemini for image generation

**The visual_essence (from step 5) becomes the image prompt for Gemini.**

### Code Locations

**Backend (patterning-api-v2):**

1. **Main generation pipeline:** `services/ai_service.py`
   - `generate_image()` method (line ~499)
   - Uses `gemini-3-pro-image-preview` model
   - Takes brief, word, and essence as inputs

2. **Streaming generation:** `services/word_pattern_generator.py`
   - `_generate_image_stream()` method (line ~251)
   - Handles real-time image generation with progress updates

3. **Playground testing:** `services/playground_service.py`
   - `test_image_prompt()` method (line ~59)
   - For testing image prompts in the prompt editor

4. **API endpoint:** `api/routes.py`
   - `/generate-image` endpoint (line ~79)
   - Calls `service.generate_image()`

### Image Generation Flow

```
visual_essence (text) 
    → Gemini gemini-3-pro-image-preview
    → Image bytes
    → Upload to Supabase storage
    → Generate thumbnail
    → Store URLs in visual_image table
```

### Prompt Editor Behavior

**IMPORTANT:** The prompt editor playground for `word_visual_image` should NOT generate SVG code. If it's outputting SVG, it means:
- The prompt template is wrong (asking for SVG instead of being an image prompt)
- Or the playground is calling text generation instead of image generation

**Correct behavior:** The playground should call the image generation API and display the resulting image, not generate text/SVG.

### Model Details

- **Model:** `gemini-3-pro-image-preview`
- **Aspect ratio:** 16:9 (1600x900)
- **Output:** PNG image bytes
- **Cost:** Currently free (preview)

### Thumbnails

- Generated automatically after image creation
- Size: 200x200 pixels
- Quality: 85%
- Stored in Supabase alongside full image

---

## V1 vs V2 Schema Migration

### Critical Warning

The codebase has BOTH V1 and V2 schemas. When debugging or modifying code, always check which schema is being used.

### V1 Schema (Legacy)

**Table:** `patterns`

**Columns:**
- `id`, `word`
- `layer_id` → layers table
- `voicing_id` → voicings table
- `essence_id` → essences table
- `brief_id` → briefs table
- `image_id` → images table

**Related tables:** `layers`, `voicings`, `essences`, `briefs`, `images`

### V2 Schema (Current)

**Table:** `patterns_word`

**Columns:**
- `id`, `created_at`
- `seed_id` → word_seeds table
- `verbal_layer_id` → word_verbal_layer table
- `verbal_voicing_id` → word_verbal_voicing table
- `verbal_essence_id` → word_verbal_essence table
- `visual_layer_id` → word_visual_layer table
- `visual_essence_id` → word_visual_essence table
- `visual_image_id` → word_visual_image table

**Related tables:** `word_seeds`, `word_verbal_layer`, `word_verbal_voicing`, `word_verbal_essence`, `word_visual_layer`, `word_visual_essence`, `word_visual_image`

**IMPORTANT:** All V2 tables are prefixed with `word_`. This was confirmed by querying the actual Supabase schema.

### Migration Checklist

When updating code that touches patterns:

1. **Check table name:** `patterns` (V1) vs `patterns_word` (V2)
2. **Check column names:** `layer_id` (V1) vs `verbal_layer_id` (V2)
3. **Check related table names:** `layers` (V1) vs `word_verbal_layer` (V2) - **Note the word_ prefix!**
4. **Check API field names:** `image_brief` (V1) vs `visual_layer` (V2)

**Critical:** V2 tables ALL have `word_` prefix. Don't assume table names - verify with the actual schema.

### Known V1 Code Locations

**PatternManager** (`services/pattern_manager.py`):
- Still uses V1 schema
- Needs update for delete functionality
- Methods: `delete_pattern_safely`, `clear_pattern_element`, `get_pattern_usage_stats`

### API Response Field Mapping

| V1 Field | V2 Field | Notes |
|----------|----------|-------|
| `image_brief` | `visual_layer` | Visual elements analysis |
| `brief` | `visual_essence` | Image generation prompt |
| `layers` | `verbal_layer` | Semantic depth analysis |
| `essence` | `verbal_essence` | One-sentence essence |
| `voicing` | `verbal_voicing` | First-person voice |

---

## Database Access

### Supabase Direct Access

You have direct access to the Supabase database for verification and debugging:

**Credentials location:** `/home/ubuntu/patterning-api-v2/.env`
- `SUPABASE_URL`
- `SUPABASE_KEY` (service role key)

**How to query:**
```bash
# Using curl with Supabase REST API
curl -s "$SUPABASE_URL/rest/v1/table_name?limit=5" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"
```

**When to use:**
- Verifying actual table names and schema structure
- Checking if data exists when API returns unexpected results
- Debugging data flow issues
- Confirming assumptions before making code changes

**Remember:** Don't trust documentation - verify with the actual database when uncertain.

---

## Performance Considerations

### Database Queries
- Use joins to fetch related data in single query
- Avoid N+1 queries (50 patterns × 7 tables = 350 queries)
- Cache history endpoint (2 minutes)

### Frontend Optimization
- Vite for fast builds
- Lazy load images
- Debounce search inputs
- Minimize re-renders

### API Optimization
- Streaming for long-running generation
- HTTP trace for debugging (not logged by default)
- Efficient prompt loading (active versions only)

---

## Error Handling

### Frontend
- User-friendly error messages
- Fallback UI for missing data
- Loading states for async operations

### Backend
- Graceful degradation (history works even if some data missing)
- Detailed error logging
- HTTP status codes (200, 400, 500)

---

**Last updated:** 2026-01-08
