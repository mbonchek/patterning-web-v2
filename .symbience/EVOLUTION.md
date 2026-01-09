# Pattern Evolution Model
## Genetic Selection and Creative Lineage

**Version:** 1.0  
**Date:** 2026-01-09  
**Status:** Design Phase

---

## Overview

Patterning.ai implements a **pattern genetics system** where each generated element acts as a "gene" that can be selected, recombined, and evolved based on community feedback. This creates an evolutionary model for identifying the best layers, voicings, essences, and images through natural selection.

---

## Core Concepts

### 1. Pattern DNA

Each pattern is composed of **six genetic elements**, each with a unique identifier (`elid`):

| Element | Code | Description | Role in DNA |
|---------|------|-------------|-------------|
| Verbal Layer | `vely` | Initial interpretation | Verbal chromosome start |
| Verbal Voicing | `vevc` | Refined expression | Verbal chromosome middle |
| Verbal Essence | `vees` | Distilled meaning | Verbal chromosome end |
| Visual Layer | `vily` | Visual interpretation | Visual chromosome start |
| Visual Essence | `vies` | Visual distillation | Visual chromosome middle |
| Visual Image | `viim` | Final manifestation | Visual chromosome end |

**Pattern Genome:**
```
word.{sdid}.vely:{elid}.vevc:{elid}.vees:{elid}.vily:{elid}.vies:{elid}.viim:{elid}
```

Each `elid` is a **genetic marker** that can be:
- **Tracked** across generations
- **Reused** in new patterns
- **Selected for** based on fitness
- **Attributed** to successful outcomes

---

## Evolutionary Mechanisms

### Forward Evolution (Branching)

**Process:** Create variations by branching from any point in the generation pipeline.

**Example:**
```
ghost (generation 0)
├─ ghost-v2 (branch from vees, generation 1)
├─ ghost-v3 (branch from vily, generation 1)
│  └─ ghost-v4 (branch from vies, generation 2)
└─ ghost-v5 (branch from vevc, generation 1)
```

**Branching Points:**
- Branch from `vely` → regenerate all 5 downstream elements
- Branch from `vees` → keep verbal chain, regenerate visual chain
- Branch from `vily` → keep verbal, regenerate visual essence + image
- Branch from `vies` → keep all except final image

**Data Model:**
```sql
patterns_word:
  - parent_pattern_id: UUID of parent pattern
  - branch_point: "vees", "vily", etc. (NULL for root)
  - generation: 0 for original, +1 for each branch level
```

---

### Backward Tracing (Attribution)

**Process:** Trace successful patterns back to their element origins.

**Example:**
```
User loves: ghost-v5.viim:DEF456
Trace back: ← ghost-v5.vies:GHI789
Trace back: ← ghost-v3.vily:JKL012
Trace back: ← ghost.vees:MNO345
```

**Insight:** The lineage `MNO345 → JKL012 → GHI789 → DEF456` represents a successful evolutionary path.

**Implementation:**
- Each element has unique `elid` stored in database
- `pattern_element_usage` table tracks which patterns use which elements
- Can query: "Show all patterns that used `vely:ABC123`"
- Can trace: "What elements led to this successful image?"

---

### Element Reuse (Genetic Conservation)

**Process:** Reuse proven elements in new patterns instead of regenerating.

**Example:**
```python
# Branch from ghost at vees (keep verbal chain)
generate_pattern_stream(
    word="ghost",
    reuse_elements={
        "vely": "ABC123",  # Keep this verbal layer
        "vevc": "XYZ789",  # Keep this voicing
        "vees": "MNO345"   # Keep this essence
    }
)
# Only generates: vily, vies, viim (new)
```

**Benefits:**
- Preserves successful elements
- Reduces generation cost
- Enables controlled variation
- Tracks element provenance

**Data Model:**
```sql
pattern_element_usage:
  - pattern_id: Which pattern uses this element
  - element_elid: The genetic marker
  - was_reused: TRUE if from another pattern
  - source_pattern_id: Where it came from
```

---

### Fitness Metrics (Natural Selection)

**Process:** Track which elements are most successful based on community feedback.

**Fitness Indicators:**

1. **User Likes** - Direct feedback on patterns
2. **Branch Count** - How many descendants (popular for variation)
3. **Reuse Count** - How often element is kept in branches
4. **Survival Rate** - How many generations deep
5. **Descendant Success** - Fitness of child patterns

**Example:**
```
Element vees:MNO345 has:
- times_used: 47 (used in 47 patterns)
- times_reused: 23 (reused from another pattern 23 times)
- user_likes: 156 (total likes across patterns using it)
- descendant_count: 12 (12 patterns branched from patterns using it)

Fitness Score: HIGH → This is a "good gene"
```

**Data Model:**
```sql
element_fitness:
  - element_elid: Genetic marker
  - times_used: Total usage count
  - times_reused: Reuse count (conservation)
  - descendant_count: Evolutionary success
  - user_likes: Community feedback
```

---

### Cross-Breeding (Future)

**Process:** Combine elements from different pattern lineages.

**Example:**
```python
# Take verbal from "ghost" and visual from "love"
generate_hybrid_pattern(
    verbal_from="ghost",  # Use ghost.vely, vevc, vees
    visual_from="love"    # Use love.vily, vies, viim
)
```

**Use Cases:**
- Combine strong verbal with strong visual
- Mix successful element combinations
- Create hybrid species of patterns

**Status:** Not yet implemented (requires element reuse mechanism)

---

## Lineage Visualization

### Family Tree Structure

```
ghost (gen 0)
├─ ghost-v2 (gen 1, branch from vees)
│  ├─ ghost-v6 (gen 2, branch from vily)
│  └─ ghost-v7 (gen 2, branch from vees)
├─ ghost-v3 (gen 1, branch from vily)
│  └─ ghost-v4 (gen 2, branch from vies)
└─ ghost-v5 (gen 1, branch from vevc)
```

### Lineage Queries

**Ancestors:**
```sql
-- Get all ancestors of a pattern
WITH RECURSIVE ancestors AS (
  SELECT * FROM patterns_word WHERE id = $pattern_id
  UNION ALL
  SELECT p.* FROM patterns_word p
  JOIN ancestors a ON p.id = a.parent_pattern_id
)
SELECT * FROM ancestors;
```

**Descendants:**
```sql
-- Get all descendants of a pattern
WITH RECURSIVE descendants AS (
  SELECT * FROM patterns_word WHERE id = $pattern_id
  UNION ALL
  SELECT p.* FROM patterns_word p
  JOIN descendants d ON p.parent_pattern_id = d.id
)
SELECT * FROM descendants;
```

**Siblings:**
```sql
-- Get all siblings (same parent)
SELECT * FROM patterns_word 
WHERE parent_pattern_id = (
  SELECT parent_pattern_id FROM patterns_word WHERE id = $pattern_id
);
```

---

## Evolutionary Insights

### What Makes a Good Gene?

**High Fitness Elements:**
- High reuse rate (kept in branches)
- High user likes (community approval)
- High descendant count (spawns successful lineages)
- Low generation depth when reused (early elements are foundational)

**Example Analysis:**
```sql
-- Find the best verbal layers
SELECT 
  vl.elid,
  vl.content,
  ef.times_used,
  ef.times_reused,
  ef.user_likes,
  ROUND(100.0 * ef.times_reused / ef.times_used, 2) as reuse_percentage
FROM word_verbal_layer vl
JOIN element_fitness ef ON vl.elid = ef.element_elid
WHERE ef.times_used > 5
ORDER BY ef.user_likes DESC, reuse_percentage DESC
LIMIT 10;
```

### Evolutionary Strategies

**1. Exploitation (Refine Winners)**
- Branch from successful patterns
- Reuse high-fitness elements
- Small variations on proven formulas

**2. Exploration (Discover New)**
- Generate fresh patterns from seeds
- Try different branch points
- Experiment with cross-breeding

**3. Balanced Evolution**
- 70% exploitation (refine what works)
- 30% exploration (discover new)
- Track diversity metrics

---

## Implementation Roadmap

### Phase 1: Lineage Tracking ✅ (Design Complete)
- [x] Database schema for parent/child relationships
- [x] Migration script (004_add_pattern_evolution.sql)
- [ ] Update pattern_manager.py to record lineage
- [ ] API endpoints for lineage queries

### Phase 2: Element Reuse
- [ ] Modify pattern generator to accept reuse_elements
- [ ] Fetch existing elements by elid
- [ ] Track element usage in pattern_element_usage table
- [ ] Update fitness metrics automatically

### Phase 3: Branching UI
- [ ] "Create Branch" option in library card menu
- [ ] Branch point selector (which step to branch from)
- [ ] Branch naming (auto-generated vs user-named)
- [ ] Branching tab with family tree visualization

### Phase 4: Fitness Dashboard
- [ ] Element fitness leaderboard
- [ ] Pattern lineage explorer
- [ ] Reuse statistics and insights
- [ ] Community feedback integration

### Phase 5: Cross-Breeding
- [ ] Hybrid pattern generator
- [ ] Element combination UI
- [ ] Genetic compatibility checks
- [ ] Hybrid lineage tracking

---

## Design Decisions

### Branch Naming

**Option A: Auto-Generated Versions**
```
ghost → ghost-v2 → ghost-v3
```
- Pros: Simple, automatic, no user input
- Cons: No semantic meaning, hard to remember

**Option B: User-Named Branches**
```
ghost → ghost-ethereal → ghost-haunting
```
- Pros: Meaningful names, easier to track
- Cons: Requires user input, naming conflicts

**Decision:** Hybrid approach
- Default: Auto-generated (ghost-v2, ghost-v3)
- Optional: User can rename branches
- Display: "ghost-v2 (ethereal)" if renamed

### Branching Tab Content

**Option A: Show All Patterns**
- Pros: Complete view of library
- Cons: Duplicates library functionality

**Option B: Show Only Patterns with Lineage**
- Pros: Focused on evolution
- Cons: Hides root patterns with no branches

**Decision:** Show all patterns, but:
- Highlight patterns with lineage (tree icon)
- Filter options: "Has branches", "Is branch", "Root only"
- Default view: Tree visualization of connected patterns

---

## Example Workflows

### Workflow 1: Refine a Successful Pattern

1. User generates "ghost" pattern → loves the verbal essence
2. User clicks "Create Branch" → selects "Branch from Verbal Essence"
3. System reuses vely, vevc, vees → regenerates vily, vies, viim
4. New pattern "ghost-v2" created with same verbal, new visual
5. User compares: prefers ghost-v2 visual
6. System records: vees:ABC123 is high fitness (led to preferred result)

### Workflow 2: Explore Visual Variations

1. User has "love" pattern with great verbal but mediocre visual
2. User branches from "Visual Layer" → keeps verbal chain
3. Generates 3 branches: love-v2, love-v3, love-v4
4. User likes love-v3 image best
5. System traces: love.vily:XYZ789 → love-v3.vies:DEF456 → love-v3.viim:GHI789
6. Insight: XYZ789 → DEF456 → GHI789 is a successful visual lineage

### Workflow 3: Community-Driven Evolution

1. Community generates 100 "hope" patterns
2. System tracks: vely:ABC123 used in 23 patterns, 18 have high likes
3. System identifies: ABC123 is a high-fitness verbal layer
4. Recommendation engine suggests: "Try branching from patterns using ABC123"
5. New patterns reuse ABC123 → higher success rate
6. Evolution: ABC123 becomes dominant gene in "hope" lineage

---

## Success Metrics

### System Health
- **Diversity:** Variety of unique elements in active use
- **Reuse Rate:** Percentage of elements reused vs generated fresh
- **Branch Depth:** Average generation depth (too deep = stagnation)
- **Fitness Distribution:** Are a few elements dominating or is it balanced?

### User Engagement
- **Branch Creation Rate:** How often users create branches
- **Lineage Exploration:** Time spent in Branching tab
- **Feedback Rate:** Percentage of patterns that receive likes
- **Reuse Adoption:** Do users choose to reuse elements?

### Quality Indicators
- **Fitness Correlation:** Do high-fitness elements predict user likes?
- **Lineage Success:** Do branches from liked patterns get liked more?
- **Element Longevity:** How long do elements stay in active use?
- **Cross-Pattern Success:** Do elements succeed across different seeds?

---

## Future Research

### Genetic Algorithms
- Automated fitness scoring
- Mutation rates (how much to vary)
- Selection pressure (exploitation vs exploration)
- Genetic diversity maintenance

### Machine Learning
- Predict element fitness before user feedback
- Recommend optimal branch points
- Suggest element combinations
- Identify emerging patterns

### Community Evolution
- Collaborative breeding (multiple users refine same lineage)
- Pattern competitions (survival of the fittest)
- Element marketplace (trade high-fitness elements)
- Evolutionary challenges (achieve specific traits)

---

## Conclusion

The Pattern Evolution Model transforms Patterning.ai from a **generation tool** into an **evolutionary ecosystem**. By treating each element as a gene with trackable fitness, we enable:

1. **Natural Selection** - Community feedback drives quality
2. **Genetic Attribution** - Trace success back to specific elements
3. **Controlled Evolution** - Branch and refine systematically
4. **Knowledge Discovery** - Learn what makes patterns resonate

This creates a **living library** where patterns evolve, improve, and adapt based on collective creativity and feedback.

---

**Next Steps:**
1. Run migration 004 to add evolution schema
2. Implement element reuse in pattern_manager.py
3. Build Branching UI and API
4. Deploy and gather user feedback
5. Analyze fitness data and refine algorithms
