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

**Last updated:** 2026-01-08
