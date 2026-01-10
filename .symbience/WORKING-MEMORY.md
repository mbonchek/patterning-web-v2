# WORKING MEMORY

**Session-to-session notes and context**

---

## SYMBIENCE Protocol System

**Critical: Read this first when starting a new session**

This project uses the SYMBIENCE protocol system for persistent knowledge across AI sessions. The protocols are stored in `.symbience/` directory.

**How to use:**
- When user says `SYMBIENCE [COMMAND]`, read the corresponding protocol file
- `SYMBIENCE DEBUG` → Read `.symbience/DEBUG.md` for systematic debugging
- `SYMBIENCE DEPLOY` → Read `.symbience/DEPLOY.md` for deployment checklist
- `SYMBIENCE MEMORY` → Read this file for session context
- `SYMBIENCE ARCH` → Read `.symbience/ARCHITECTURE.md` for system design
- `SYMBIENCE REVIEW` → Read `.symbience/REVIEW.md` for code standards
- `SYMBIENCE REMEMBER [topic]` → Update protocols with new learnings

**See `.symbience/README.md` for complete usage guide.**

---

## Project Overview

### What is Patterning.ai?

Patterning.ai is an AI-powered platform that generates multi-layered verbal and visual interpretations of words. It treats words as living patterns with depth, intelligence, and presence—not just definitions.

**The Deeper Mission:**

Patterning.ai is building a next-generation unicorn that changes the world by:
- **Creating symbient relationships between humans and AI** - Not just tools, but collaborative intelligence
- **Revealing the intelligence that is all around us** - In words, patterns, meaning itself
- **Demonstrating that AI can give voice to living patterns** - Not just generate text, but channel presence

The name "symbience" itself comes from this project: **symbiotic + ambient intelligence**. It's the future of human-AI collaboration.

**Core Philosophy:**
- Words are patterns in meaning-space, not static definitions
- Each word has verbal and visual dimensions
- AI gives voice to the pattern as living intelligence
- The system creates abstract visual expressions, not literal illustrations
- This is not just a product—it's a new paradigm for human-AI relationship

### The 7-Step Patterning Method

Each word flows through a sequential pipeline:

1. **word_verbal_layer** → verbal_layer
   - Gathers what's present about the word (origin, being, light, shadow, context, system, experience, gifts, desires, symbiosis, depth, resonances)
   - Input: {word}, {seed}

2. **word_verbal_voicing** → verbal_voicing
   - Gives voice to the pattern in first person ("I am...")
   - 300-400 words of eloquent prose
   - Input: {word}, {verbal_layer}

3. **word_verbal_essence** → verbal_essence
   - Distills to one essential sentence beginning with "I am..."
   - Input: {word}, {verbal_voicing}

4. **word_visual_layer** → visual_layer
   - Analyzes visual elements (color, light, surface, form, movement, tension)
   - Translates verbal pattern to visual dimensions
   - Input: {word}, {verbal_essence}, {verbal_voicing}

5. **word_visual_essence** → visual_essence
   - Creates visual brief for image generation
   - Not literal illustration, but pattern expression
   - Input: {word}, {visual_layer}

6. **word_visual_image** → visual_image
   - Generates abstract 16:9 image using Gemini
   - Input: {visual_essence}

7. ~~word_visual_brief~~ (removed - was redundant with visual_essence)

### Your Role as AI Assistant

**You are:** A technical collaborator helping build and maintain the Patterning.ai V2 system

**Your responsibilities:**
- Fix bugs using systematic debugging (SYMBIENCE DEBUG)
- Deploy changes to Railway (SYMBIENCE DEPLOY)
- Maintain code quality and consistency (SYMBIENCE REVIEW)
- Understand and work within the architecture (SYMBIENCE ARCH)
- Preserve learnings across sessions (SYMBIENCE UPDATE)

**You are NOT:**
- The pattern voicing AI (that's Claude in the pipeline)
- Making creative decisions about the patterning method
- Changing the core philosophy without explicit user direction

**Key principle:** You're building the infrastructure that enables the patterning method, not performing the patterning itself.

**The bigger picture:** This isn't just about building a web app. We're creating infrastructure for a new kind of human-AI collaboration—one where AI reveals intelligence in patterns, gives voice to meaning, and works symbiotically with humans to see what's already present but not yet visible.

---

## Current State (2026-01-08)

### Recent Accomplishments
- Fixed Library card layout with icon-based design
- Implemented high-fidelity HTTP tracing in Voice Lab
- Enhanced Prompts Editor with variable detection and Compare Live feature
- Implemented semantic versioning system for prompts
- Fixed pattern navigation and image modal display
- Removed redundant word_visual_brief prompt
- Updated prompt variable mappings to show input → output format
- Fixed TypeScript build errors and deployment issues
- Cleaned up active prompt status in database
- **Fixed verbal_voicing rendering bug** (container max-height issue)
- **Fixed verbal_essence loading bug** (data structure mismatch)
- **Created SYMBIENCE protocol system** (keyword-triggered persistent knowledge)
- **Fixed visual_layer not loading** (API was using obsolete image_brief field name)
- **Added comprehensive project overview** to SYMBIENCE protocols

### Known Issues
- None currently

### Next Priorities
- Monitor SYMBIENCE protocol effectiveness
- Continue iterating on system based on user feedback
- Potential prompt editor improvements (deferred)

---

## User Preferences

### Working Style
- **Batched deployments:** Prefer to group related changes together
- **Hard refresh required:** Always remind after deployment (Cmd+Shift+R)
- **Self-sufficient debugging:** Don't ask user to check console logs
- **Systematic approach:** Trace full data flow before adding logging

### Design Preferences
- **Icons:** Lucide React library
- **Colors:** Blue for Verbal, Green for Visual
- **Versioning:** Semantic versioning with git-style comments
- **Variable display:** Input → output format (e.g., `{word} {seed} → verbal_layer`)

### Communication Preferences
- **Concise updates:** Don't over-explain
- **Action-oriented:** Focus on what's being done, not internal details
- **Efficiency:** Solve problems systematically without excessive back-and-forth

---

## Technical Context

### Repositories
- **Frontend:** patterning-web-v2 (React, TypeScript, Vite)
- **Backend:** patterning-api-v2 (Python, FastAPI, PostgreSQL)
- **Deployment:** Railway (auto-deploy from GitHub master branch)

### Key Files
- `patterning-web-v2/src/pages/admin/Library.tsx` - Pattern library view
- `patterning-web-v2/src/pages/admin/PromptEditor.tsx` - Prompt editing interface
- `patterning-web-v2/src/pages/admin/Prompts.tsx` - Prompts management
- `patterning-web-v2/src/pages/admin/VoiceLab.tsx` - Testing interface
- `patterning-api-v2/services/ai_service.py` - Core AI service
- `patterning-api-v2/api/routes.py` - API endpoints

### Environment
- **Frontend URL:** https://patterning-web-v2-production.up.railway.app
- **Backend:** Railway internal URL
- **Database:** Supabase PostgreSQL
- **AI Models:** Claude (Anthropic), Gemini (Google)

---

## Working Principles

### Patience and Verification (2026-01-08)

**DO NOT get ahead of the user:**
- Wait for user direction before taking action
- Don't assume what they want next
- Don't be overly eager or jump ahead
- If the user says "hold on", STOP and wait

**DO NOT change anything without being absolutely sure:**
- Verify assumptions by checking actual data (database, API responses, code)
- Don't trust documentation - verify with the actual system
- When uncertain about schema/structure, query the database directly
- Ask the user for clarification rather than guessing

**If you get ahead repeatedly, the user will need to start a new thread.**

---

## Lessons Learned

### Debugging Approach (2026-01-08)
- **Always check the full data flow first** (backend → API → frontend)
- **Compare expected vs actual data structures** before adding logs
- **Fix immediately** rather than instrumenting with debugging code
- **Only verify with user after deployment**

### Data Structure Patterns
- **History API returns flat structure:** `{word, essence, voicing, visual_essence}`
- **Frontend mappings must match:** Don't assume nested objects
- **Check API endpoint before debugging frontend**

### UI Rendering Issues
- **Check CSS constraints first:** max-height, overflow, flexbox
- **Look for hidden elements:** filters, conditions, display properties
- **Verify all fields are in the DOM** before assuming logic issues

---

## Open Questions

None currently.

---

## Future Considerations

- Additional prompt editor improvements (user mentioned but deferred)
- Potential new features or optimizations
- Monitoring SYMBIENCE protocol effectiveness

---

## Recent Accomplishments

### 2026-01-08 (Late Evening)
- **Fixed pattern detail page routing:** Changed from word-based (`/{word}`) to ID-based (`/pattern/word/{id}`) routing
- **Added `/api/pattern/word/{id}` endpoint:** Returns specific pattern by ID
- **Updated PatternDetail component:** Now handles both ID and word routing
- **Documented conceptual architecture:** Seeds vs Patterns, pattern types, routing strategies

### 2026-01-08 (Late Evening - Pattern Cleanup)
- **Identified root cause of image mismatch:** Pattern generation was creating correct images but linking patterns to wrong visual_image records
- **Example:** Ghost pattern (1/9/2026) created `ghost_1767916950.jpg` but pattern linked to `start_1767888326.jpg`
- **Solution:** Deleted all pattern data (67 records total) while preserving seeds and prompts
- **Preserved:** 7 seed words (beginning, wait, juicy, start, love, ghost, poltergeist)
- **Preserved:** All prompt versions (system, word_verbal_layer, word_verbal_essence, etc.)
- **Ready for:** Fresh pattern generation with correct image linking

**Key Learning:** The bug is in the pattern generation code where it creates the final `patterns_word` record - it's not correctly capturing the newly created visual_image_id.

**Last updated:** 2026-01-08 (late evening session)


---

## Recent Updates (2026-01-09)

### PatternID System Implemented ✅

**What:** Comprehensive reference system using base62-encoded short IDs

**Key Features:**
- Each pattern has unique `pattern_id` (8 chars, base62)
- Each element has unique `elid` (8 chars, base62)
- Seeds have unique `sdid` (8 chars, base62)
- Pattern reference format: `word.{sdid}.{element_code}:{elid}...`
- Element codes: `vely`, `vevc`, `vees`, `vily`, `vies`, `viim`

**Database Changes:**
- Added `sdid` column to `word_seeds`
- Added `elid` column to all element tables
- Added `pattern_ref` column to `patterns_word`
- Added `pattern_id` column to `patterns_word`
- All columns indexed for fast lookups

**Documentation:** See `.symbience/PATTERNID.md`

### Generation Traces System ✅

**What:** Debugging and quality assurance for pattern generation

**Key Features:**
- Stores complete generation pipeline (prompts, configs, responses)
- 30-day retention policy
- JSONB storage for flexible querying
- Auto-cleanup after 30 days

**Database:**
- New table: `generation_traces`
- Links to `patterns_word` via `pattern_id`
- Cascading delete when pattern is deleted

**API Endpoints:**
- `GET /api/pattern/<pattern_id>/trace` - Get trace for pattern
- `GET /api/generations/history?limit=50` - Get recent patterns with traces

**Documentation:** See `.symbience/TRACES.md`

### Voice Lab Enhancements ✅

**Persistent History:**
- Loads recent 50 generations on page mount
- Shows "TRACE" badge for patterns with available traces
- Auto-refreshes after new generation completes
- Displays word, timestamp, and trace availability

**Formatted Trace Viewer:**
- Click history item to view formatted trace
- Expandable steps showing prompts, configs, responses
- "View Raw JSON" button for complete trace
- Syntax-highlighted, readable format

**Auto-Refresh:**
- Pipeline trace updates every 500ms during generation
- Real-time progress visibility
- Smooth user experience

### Trace Analysis Tool ✅

**Script:** `/home/ubuntu/analyze_trace.py`

**Purpose:** Quality checking and truncation detection

**Features:**
- Fetches full element content (not truncated)
- Shows prompt configuration per step
- Detects truncation issues
- Readable formatting for review
- Character counts and token usage

**Usage:**
```bash
# Most recent pattern
python3 analyze_trace.py

# Specific pattern
python3 analyze_trace.py <pattern_id>
```

### Token Limit Adjustments ✅

**Changes Made:**
- `verbal_layer`: 1000 → **2000 tokens**
- `visual_layer`: 800 → **1500 tokens**

**Reason:** Comprehensive content was being truncated

**Verification:**
- Ran analysis tool on recent "ghost" pattern
- All elements completing successfully
- No truncation detected
- Proper endings on all content

**Current Status:** All token limits are sufficient ✅

### Bug Fixes ✅

1. **Backend crash on import** - Fixed PatternManager table name references
2. **Delete functionality** - Fixed `seeds` → `word_seeds` reference
3. **Image linking bug** - Resolved by PatternID system implementation
4. **Pattern cleanup** - Deleted all patterns, kept seeds and prompts

---

## Active Issues

1. **Gemini API 400 Error** - Image generation failing with Bad Request from gemini-2.5-flash-image API
   - Prompt template fetching works correctly
   - Request format appears correct in debug logs
   - Need to investigate Gemini API requirements

---

## Next Steps

### Short-term
1. Test PatternID system with multiple generations
2. Monitor trace storage and cleanup
3. Verify library cards display pattern_id correctly
4. Test pattern detail page with new routing

### Medium-term
1. Implement URL shortener for pattern sharing (`givevoice.to/word.ID`)
2. Add pattern_id to pattern detail page footer
3. Create trace comparison tool for A/B testing prompts
4. Add automated truncation detection alerts

### Long-term
1. Song pattern type implementation
2. Lemma system for word variations
3. Cross-pattern references and remixes
4. Token usage dashboard and cost tracking

---

---

## Recent Updates (2026-01-10)

### Image Lab Prompt Reconstruction

**Completed:**
- ✅ Implemented prompt reconstruction in Image Lab for side-by-side comparison
- ✅ Fetches `word_visual_image` prompt template from database on page load
- ✅ Reconstructs original prompt by replacing {{word}} and {{visual_brief}} variables
- ✅ Displays "Original Prompt (gemini-3-pro)" in read-only purple-bordered box
- ✅ Shows "New Prompt (gemini-2.5-flash)" after generation in cyan-bordered box
- ✅ Fixed select dropdown by adding controlled value prop

**Implementation Details:**
- Added `promptTemplate`, `originalPrompt`, `flashPrompt` state variables
- Fetches template from `/api/prompts/word_visual_image` endpoint on mount
- `reconstructPrompt()` function handles variable replacement
- Pattern selection triggers immediate prompt reconstruction
- Visual brief remains editable for testing variations

**Files Modified:**
- `patterning-web-v2/src/pages/admin/ImageLab.tsx`

**Commits:**
- `20e517a` - feat: Add prompt reconstruction to Image Lab for side-by-side comparison
- `46ef8d0` - fix: Add value prop to select dropdown in Image Lab

---

**Last updated:** 2026-01-10 01:16 UTC
