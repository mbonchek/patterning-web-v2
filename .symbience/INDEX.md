# SYMBIENCE Protocol Index

**Symbiotic + Ambient Intelligence**

This directory contains working protocols for human-AI collaboration on the Patterning.ai system. When triggered with the keyword `SYMBIENCE`, check this index to determine which protocol(s) to apply.

---

## Quick Decision Tree

**User reports a bug or something not working?**
→ Read `DEBUG.md` - Systematic debugging approach

**Ready to deploy changes?**
→ Read `DEPLOY.md` - Deployment checklist and verification

**Need context from previous session?**
→ Read `WORKING-MEMORY.md` - Session-to-session notes

**Making architectural decisions?**
→ Read `ARCHITECTURE.md` - System design principles

**General code review or quality check?**
→ Read `REVIEW.md` - Code review standards

---

## Protocol Triggers

- `SYMBIENCE` → Read this index and determine relevant protocol(s)
- `SYMBIENCE DEBUG` → Go directly to DEBUG.md
- `SYMBIENCE DEPLOY` → Go directly to DEPLOY.md
- `SYMBIENCE MEMORY` → Go directly to WORKING-MEMORY.md
- `SYMBIENCE ARCH` → Go directly to ARCHITECTURE.md
- `SYMBIENCE REVIEW` → Go directly to REVIEW.md
- `SYMBIENCE REMEMBER [topic]` → Update protocol(s) with new learning
- `SYMBIENCE UPDATE` → Review working memory and batch-update all relevant protocols
- `SYMBIENCE HELP` → Display all available commands and their purposes
- `SYMBIENCE OPTIMIZE` → Review and refactor protocols to remove obsolete/redundant content

---

## Available Protocols

### DEBUG.md
Systematic approach to debugging issues. Emphasizes:
- Check the full data flow (backend → API → frontend)
- Compare expected vs actual data structures
- Fix immediately without excessive logging
- Only verify with user after deployment

### DEPLOY.md
Deployment checklist for Railway:
- Commit and push changes
- Wait 3-4 minutes for deployment
- Verify deployment completed
- Remind user to hard refresh

### WORKING-MEMORY.md
Session-to-session notes:
- Lessons learned
- User preferences
- Ongoing issues
- Next priorities

### ARCHITECTURE.md
System design principles:
- V2 schema structure
- 7-step pipeline flow
- Icon and color conventions
- Component relationships

### REVIEW.md
Code review standards:
- TypeScript best practices
- React patterns
- API design
- Error handling

---

## Maintenance

These protocols should be updated as we learn new patterns and discover better approaches. They are version-controlled in the repo and persist across sessions.

### Updating Protocols

Use `SYMBIENCE REMEMBER [topic]` to add new learnings:

**Examples:**
- `SYMBIENCE REMEMBER: User prefers dark mode for new features` → Updates WORKING-MEMORY.md
- `SYMBIENCE REMEMBER: Always validate API keys before deployment` → Updates DEPLOY.md
- `SYMBIENCE REMEMBER: The visual_layer prompt needs lighting context` → Updates ARCHITECTURE.md

When triggered, I will:
1. Determine which protocol file(s) to update
2. Add the information in the appropriate section
3. Commit the change to the repo
4. Confirm what was added

### Batch Updates with SYMBIENCE UPDATE

Use `SYMBIENCE UPDATE` at the end of a session to:
1. Review everything in working memory (context, lessons learned, decisions made)
2. Identify what should be preserved for future sessions
3. Update all relevant protocol files (DEBUG, DEPLOY, ARCH, MEMORY, REVIEW)
4. Commit all changes together
5. Provide summary of what was updated

This ensures important learnings don't get lost between sessions.

### Getting Help

Use `SYMBIENCE HELP` to see:
- Complete list of available commands
- Brief description of each command's purpose
- Quick reference for when to use each protocol

### Optimizing Protocols

Use `SYMBIENCE OPTIMIZE` to:
1. Review all protocol files for clarity
2. Remove obsolete information
3. Consolidate redundant content
4. Improve organization and readability
5. Update examples to reflect current practices
6. Commit optimizations

Run this periodically to keep protocols clean and relevant.

**Last updated:** 2026-01-08
