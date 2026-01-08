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

### Core Tables

**patterns_word** (registry)
- Main pattern registry
- Links to all component tables via foreign keys
- Single source of truth for a word's pattern

**seeds**
- Word text storage
- Reusable across patterns

**verbal_layer, verbal_voicing, verbal_essence**
- Verbal component outputs
- Each has: content, prompt_version, timestamps

**visual_layer, visual_essence, visual_image**
- Visual component outputs
- visual_image includes: image_url, thumbnail_url

**prompts**
- Prompt templates and configurations
- Versioned (semantic versioning: 1.0, 1.1, 2.0)
- Tracks active versions

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
