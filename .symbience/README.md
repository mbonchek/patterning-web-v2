# SYMBIENCE System Guide

**For Future AI Instances: How to Use This Protocol System**

---

## What is SYMBIENCE?

SYMBIENCE (Symbiotic + Ambient Intelligence) is a keyword-triggered protocol system that enables persistent knowledge and working practices across AI sessions.

**The Problem It Solves:**
- AI instances don't have memory between sessions
- Lessons learned get forgotten
- User has to re-teach the same debugging approaches
- Working preferences aren't preserved

**The Solution:**
- Protocol files stored in `.symbience/` directory
- Version-controlled in the repo (persists forever)
- Triggered by user with keywords
- AI reads the relevant protocol and applies it

---

## How It Works

### 1. User Triggers with Keywords

When the user says **`SYMBIENCE`** or **`SYMBIENCE [COMMAND]`**, you should:

1. **Read the INDEX.md file** at `/home/ubuntu/patterning-web-v2/.symbience/INDEX.md`
2. **Determine which protocol(s) to apply** based on the command or context
3. **Read the relevant protocol file(s)**
4. **Apply the guidance** to the current task

### 2. Available Commands

| Command | Action | File to Read |
|---------|--------|--------------|
| `SYMBIENCE` | Read INDEX and determine relevant protocol | INDEX.md |
| `SYMBIENCE DEBUG` | Apply systematic debugging approach | DEBUG.md |
| `SYMBIENCE DEPLOY` | Follow deployment checklist | DEPLOY.md |
| `SYMBIENCE MEMORY` | Check session-to-session notes | WORKING-MEMORY.md |
| `SYMBIENCE ARCH` | Review architecture principles | ARCHITECTURE.md |
| `SYMBIENCE REVIEW` | Apply code review standards | REVIEW.md |
| `SYMBIENCE REMEMBER [topic]` | Update protocol(s) with new learning | Determine which file(s) |
| `SYMBIENCE UPDATE` | Review working memory and batch-update protocols | Multiple files |
| `SYMBIENCE HELP` | Display all available commands and their purposes | INDEX.md |
| `SYMBIENCE OPTIMIZE` | Review and refactor protocols to remove obsolete content | All files |

### 3. When to Use Each Protocol

**DEBUG** - User reports a bug or something not working
- Trace full data flow (backend → API → frontend)
- Check data structures match
- Fix immediately without excessive logging

**DEPLOY** - Ready to push changes to production
- Commit and push
- Wait 3-4 minutes
- Remind user to hard refresh

**MEMORY** - Starting a new session or need context
- Check what was accomplished recently
- Review user preferences
- See ongoing issues and priorities

**ARCH** - Making design decisions or understanding system
- Review 7-step pipeline
- Check database schema
- Understand UI conventions (colors, icons)

**REVIEW** - Writing or reviewing code
- Check TypeScript/React patterns
- Verify API design
- Follow established conventions

**REMEMBER** - User wants to preserve a learning
- Determine which protocol file to update
- Add the information in appropriate section
- Commit the change
- Confirm what was added

**UPDATE** - End of session batch update
- Review everything in working memory
- Identify what should be preserved
- Update all relevant protocol files
- Commit all changes together
- Provide summary of updates

**HELP** - Show available commands
- Display complete list of SYMBIENCE commands
- Brief description of each command's purpose
- Quick reference guide

**OPTIMIZE** - Refactor and clean protocols
- Review all protocol files for clarity
- Remove obsolete or redundant information
- Improve organization and readability
- Update examples to current practices
- Commit optimizations

---

## Example Usage Scenarios

### Scenario 1: User Reports a Bug

**User says:** "SYMBIENCE DEBUG - the essence field isn't loading"

**You should:**
1. Read `.symbience/DEBUG.md`
2. Follow the systematic debugging approach:
   - Find the API endpoint being called
   - Check what the backend returns
   - Compare to frontend expectations
   - Identify the mismatch
   - Fix it immediately
3. Deploy and verify

**Don't:** Ask user to check console logs before tracing the data flow

### Scenario 2: Ready to Deploy

**User says:** "SYMBIENCE DEPLOY"

**You should:**
1. Read `.symbience/DEPLOY.md`
2. Follow the checklist:
   - Commit changes with descriptive message
   - Push to master
   - Note it will take 3-4 minutes
   - Remind user to hard refresh (Cmd+Shift+R)

### Scenario 3: Starting a New Session

**User says:** "SYMBIENCE MEMORY"

**You should:**
1. Read `.symbience/WORKING-MEMORY.md`
2. Review:
   - Recent accomplishments
   - User preferences
   - Lessons learned
   - Next priorities
3. Use this context to inform your work

### Scenario 4: User Wants to Preserve a Learning

**User says:** "SYMBIENCE REMEMBER: Always check Railway logs after deployment"

**You should:**
1. Determine which protocol to update (DEPLOY.md in this case)
2. Read the current DEPLOY.md
3. Add the new learning in the appropriate section
4. Commit the change
5. Confirm: "Added to DEPLOY.md: Always check Railway logs after deployment"

### Scenario 5: End of Session Batch Update

**User says:** "SYMBIENCE UPDATE"

**You should:**
1. Review everything in your working memory:
   - What bugs were fixed and how
   - What patterns were discovered
   - What user preferences emerged
   - What architectural decisions were made
   - What code patterns were established
2. Identify what should be preserved:
   - New debugging lessons → DEBUG.md
   - Deployment insights → DEPLOY.md
   - User preferences → WORKING-MEMORY.md
   - Architecture changes → ARCHITECTURE.md
   - Code standards → REVIEW.md
3. Update all relevant files
4. Commit all changes in one commit
5. Provide summary: "Updated 3 protocols: DEBUG (2 lessons), MEMORY (1 preference), ARCH (1 decision)"

### Scenario 6: Getting Help

**User says:** "SYMBIENCE HELP"

**You should:**
1. Read INDEX.md
2. Display formatted list of all commands:
   - Command name and syntax
   - Brief description
   - When to use it
3. Provide quick reference for common scenarios

### Scenario 7: Optimizing Protocols

**User says:** "SYMBIENCE OPTIMIZE"

**You should:**
1. Read all protocol files (INDEX, DEBUG, DEPLOY, MEMORY, ARCH, REVIEW, README)
2. Identify issues:
   - Obsolete information (old bugs, deprecated features)
   - Redundant content (same info in multiple places)
   - Unclear organization (hard to find information)
   - Outdated examples (no longer relevant)
3. Refactor each file:
   - Remove obsolete content
   - Consolidate redundant sections
   - Improve structure and clarity
   - Update examples
4. Commit all optimizations
5. Provide summary: "Optimized 5 protocols: removed 3 obsolete items, consolidated 2 redundant sections, updated 4 examples"

---

## How to Update Protocols

### When User Says "SYMBIENCE REMEMBER [topic]"

**Step 1: Determine which file(s) to update**
- Debugging lessons → DEBUG.md
- Deployment practices → DEPLOY.md
- User preferences → WORKING-MEMORY.md
- Architecture decisions → ARCHITECTURE.md
- Code standards → REVIEW.md
- General notes → WORKING-MEMORY.md

**Step 2: Read the current file**
```typescript
file.read('/home/ubuntu/patterning-web-v2/.symbience/[FILE].md')
```

**Step 3: Update the appropriate section**
- Add to existing section if relevant
- Create new section if needed
- Update "Last updated" date

**Step 4: Commit the change**
```bash
cd /home/ubuntu/patterning-web-v2
git add .symbience/[FILE].md
git commit -m "docs: update [FILE] - [brief description]"
git push origin master
```

**Step 5: Confirm to user**
"✓ Updated [FILE].md: [what was added]"

---

## Important Principles

### 1. Always Read the Protocol First
When user triggers SYMBIENCE, **read the file before doing anything else**. The protocols contain hard-won lessons that prevent wasted time.

### 2. Apply the Guidance
Don't just acknowledge the protocol exists—**actually follow it**. If DEBUG.md says "trace the data flow first," do that before adding logging.

### 3. Update When You Learn
When you discover a new pattern or the user corrects your approach, suggest updating the protocols. Use "SYMBIENCE REMEMBER" to preserve the learning.

### 4. Keep Protocols Current
Update the "Last updated" date when modifying files. Add specific examples from real issues encountered.

### 5. Trust the System
The protocols exist because past instances made mistakes. Trust that the guidance is there for a reason.

---

## File Locations

All protocol files are in:
```
/home/ubuntu/patterning-web-v2/.symbience/
├── README.md           # This file (usage guide)
├── INDEX.md            # Master index and decision tree
├── DEBUG.md            # Systematic debugging approach
├── DEPLOY.md           # Deployment checklist
├── WORKING-MEMORY.md   # Session-to-session notes
├── ARCHITECTURE.md     # System design principles
└── REVIEW.md           # Code review standards
```

---

## Testing the System

To verify SYMBIENCE is working:

1. User says: `SYMBIENCE DEBUG`
2. You should immediately read DEBUG.md
3. Confirm you've loaded the protocol
4. Be ready to apply systematic debugging

**Success criteria:**
- You read the file without being told the path
- You understand the guidance
- You apply it to the current task
- You don't repeat mistakes documented in the protocol

---

## Maintenance

The protocols should evolve as the project evolves:
- Add new lessons learned from debugging sessions
- Update user preferences as they emerge
- Document architectural decisions as they're made
- Refine code standards based on experience

**The goal:** Each AI instance should be smarter than the last because it inherits all previous learnings.

---

**Created:** 2026-01-08
**Last updated:** 2026-01-08
