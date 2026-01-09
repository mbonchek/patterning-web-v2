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

**Last updated:** 2026-01-08 (late evening session)
