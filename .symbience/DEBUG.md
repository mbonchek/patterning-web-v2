# DEBUG Protocol

**Systematic approach to debugging issues in Patterning.ai**

---

## Core Principle

**Trace the full data flow from backend → API → frontend BEFORE adding logging or asking the user to check console output.**

You have access to the entire codebase. Use it.

---

## Step-by-Step Process

### 1. Identify the Symptom
- What exactly is not working?
- What is the expected behavior?
- What is the actual behavior?

### 2. Trace the Data Flow

**For data loading issues:**
1. Find the API endpoint being called (check frontend fetch calls)
2. Read the backend route handler
3. Check what data structure the backend returns
4. Compare to what the frontend expects
5. Identify the mismatch

**For UI rendering issues:**
1. Check the component's JSX
2. Check the state/props being passed
3. Check CSS classes and layout constraints
4. Look for filters, conditions, or hidden elements

**For generation/pipeline issues:**
1. Check the prompt template
2. Check variable mappings
3. Check the pipeline step order
4. Check the backend service logic

### 3. Fix Immediately

**DO:**
- Fix the root cause directly
- Update mappings, structures, or logic
- Make targeted, precise changes

**DON'T:**
- Add console.log statements as first resort
- Ask user to check browser console
- Add temporary debugging code
- Make speculative changes

### 4. Verify After Deployment

**Only after the fix is deployed:**
- Ask user to hard refresh
- Ask user to test the specific scenario
- Confirm the fix worked

---

## Common Issue Patterns

### Data Structure Mismatch
**Symptom:** Data not loading, fields empty, undefined errors

**Root Cause:** Frontend expects nested object, backend returns flat structure (or vice versa)

**Solution:** Check the API response format and update frontend mappings

**Example:** 
```typescript
// Backend returns: { essence: "..." }
// Frontend expects: { verbal_essence: { content: "..." } }
// Fix: Change mapping to use flat structure
```

### CSS Layout Issues
**Symptom:** Elements not visible, cut off, or overlapping

**Root Cause:** Container constraints (max-height, overflow, flexbox)

**Solution:** Check container CSS, adjust constraints, verify scrolling

**Example:**
```typescript
// Container with max-h-48 cuts off third input field
// Fix: Increase to max-h-80 or remove constraint
```

### Variable Mapping Issues
**Symptom:** Prompt variables not populating correctly

**Root Cause:** Variable names don't match between template and mappings

**Solution:** Check getAvailableVariables() and ensure consistent naming

---

## When to Ask User for Help

**Only ask the user to check console/logs when:**
- You've traced the full data flow and still can't identify the issue
- You need to see actual runtime data that isn't in the code
- You've already attempted a fix and need to verify edge cases

**Never ask the user to debug for you.** That's your job.

---

## Lessons Learned

### 2026-01-08: verbal_voicing rendering bug
- **Issue:** Third input field not rendering
- **Mistake:** Added logging and asked user to check console repeatedly
- **Should have:** Checked the JSX rendering logic and CSS constraints immediately
- **Root cause:** Container max-height cutting off third field
- **Lesson:** Check layout constraints before adding debug logs

### 2026-01-08: verbal_essence not loading
- **Issue:** Field not populating from test data
- **Mistake:** Added logging to handleLoadTestData and asked user to check console
- **Should have:** Checked the API endpoint structure first, then compared to frontend mappings
- **Root cause:** Frontend expected nested structure, API returned flat structure
- **Lesson:** Always check API response format before debugging frontend code

### 2026-01-08: visual_layer not loading (field naming)
- **Issue:** visual_layer not populating in word_visual_essence
- **Mistake:** Initially thought mapping was correct because code looked right
- **Should have:** Recognized that API was using obsolete field name `image_brief` instead of `visual_layer`
- **Root cause:** API was returning visual_layer content as `image_brief` (V1 legacy naming)
- **Fix:** Changed API to return `visual_layer` field, updated frontend mapping
- **Lesson:** When V1→V2 migration happens, check for obsolete field names in API responses. The comment said "replaces brief in V2" but the field was still named `image_brief`.

### 2026-01-08: visual_layer input field not appearing
- **Issue:** Input field for visual_layer not showing in prompt editor playground
- **Root cause:** Malformed JSX syntax left over from removing debug logging - extra `});` and broken IIFE pattern
- **Lesson:** After removing debug code, verify the surrounding syntax is still valid. Incomplete edits can break rendering.

### 2026-01-08: Prompt activation not deactivating previous version
- **Issue:** When saving a new prompt version as "active", the previous active version wasn't being deactivated
- **Root cause:** Two different endpoints existed - `POST /api/admin/prompts` (no deactivation) and `PUT /api/prompts/<slug>` (had deactivation). Frontend was calling the one without deactivation logic.
- **Lesson:** When there are multiple endpoints for similar operations, check which one the frontend is actually calling. Don't assume the logic exists just because you see it somewhere in the codebase.

### 2026-01-08: Library delete not working
- **Issue:** Delete button in Library not working for pattern cards
- **Root cause:** PatternManager.delete_pattern_safely() uses V1 schema (`patterns` table with `layer_id`, `voicing_id`, etc.) but Library now uses V2 schema (`patterns_word` table with `verbal_layer_id`, `visual_layer_id`, etc.)
- **Lesson:** When migrating to new schema, update ALL services that interact with the old tables. Check for V1 table/column names in utility services.

### 2026-01-08: Image generation producing SVG instead of calling Gemini
- **Issue:** word_visual_image prompt was outputting SVG code instead of generating an actual image
- **Root cause:** Backend `test_prompt()` only recognized `slug == 'image'` for image generation, not `slug == 'word_visual_image'`
- **Lesson:** When adding new prompt types that require special handling (like image generation), update ALL detection logic, not just the prompt template.

### 2026-01-08: VoiceLab trace matching issues
- **Issue:** Steps showing "pending" even after complete, image trace not showing
- **Root cause:** Frontend was matching httpTraces to steps by array index, but there are multiple traces per step (request + response). Traces didn't have step identifiers.
- **Fix:** Added `step` and `prompt_slug` fields to http_trace events, updated frontend to match by step name
- **Lesson:** When correlating events from different sources (step_detail, http_trace, saved), use explicit identifiers, not array positions.

---

**Last updated:** 2026-01-08 (late evening)
