# PATTERN ID SYSTEM

**Comprehensive reference system for patterns and their elements**

---

## Overview

The PatternID system provides a unique, self-describing reference for every pattern and its constituent elements. It uses base62-encoded short IDs and standardized element codes to create human-readable, URL-safe identifiers.

---

## Structure

### Pattern Reference Format

```
{type}.{sdid}.{element_code}:{elid}.{element_code}:{elid}...
```

**Components:**
- `type` - Pattern type (4 letters): `word`, `song`, `anim` (animal), etc.
- `sdid` - Seed ID: base62-encoded UUID (8 chars)
- `element_code` - 4-letter code identifying the element type
- `elid` - Element ID: base62-encoded UUID (8 chars)

### Example Pattern Reference

```
word.5xT9mK3p.vely:2tvrCaJB.vevc:3kR9mN2x.vees:9xK2pL4m.vily:4mP8nQ1r.vies:7sL3kM9t.viim:1nR4pK2w
```

**Breakdown:**
- `word` - Pattern type
- `5xT9mK3p` - Seed ID (e.g., "ghost")
- `vely:2tvrCaJB` - Verbal layer element
- `vevc:3kR9mN2x` - Verbal voicing element
- `vees:9xK2pL4m` - Verbal essence element
- `vily:4mP8nQ1r` - Visual layer element
- `vies:7sL3kM9t` - Visual essence element
- `viim:1nR4pK2w` - Visual image element

---

## Pattern Types

| Type Code | Description | Status |
|-----------|-------------|--------|
| `word` | Word patterns (verbal + visual) | Active |
| `song` | Song patterns (melody + harmony + lyrics) | Future |
| `anim` | Animal patterns | Future |

---

## Element Codes

### Word Pattern Elements

| Mode | Element | Code | Table Name | Description |
|------|---------|------|------------|-------------|
| verbal | layer | `vely` | word_verbal_layer | Semantic depth analysis |
| verbal | voicing | `vevc` | word_verbal_voicing | First-person expression |
| verbal | essence | `vees` | word_verbal_essence | Distilled essence sentence |
| visual | layer | `vily` | word_visual_layer | Visual element analysis |
| visual | essence | `vies` | word_visual_essence | Visual generation brief |
| visual | image | `viim` | word_visual_image | Generated image |

### Code Construction

Element codes are constructed from:
- **Mode (2 letters):** `ve` (verbal), `vi` (visual)
- **Element (2 letters):** `ly` (layer), `vc` (voicing), `es` (essence), `im` (image)

**Pattern:** `{mode}{element}` = 4 letters

---

## Seeds

### Seed Reference

Seeds are the starting point for pattern generation (e.g., a word, phrase, song title).

**Format:**
```
seed.{sdid}
```

**Example:**
```
seed.5xT9mK3p  → "ghost"
```

### Seed Database Schema

**Table:** `word_seeds`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `sdid` | VARCHAR(8) | Base62-encoded short ID |
| `text` | TEXT | The seed text (e.g., "ghost") |
| `lemma_id` | UUID | Optional: reference to base lemma |

### Lemmas (Future)

Seeds can optionally reference a lemma for word variations:
- "belong", "belongs", "belonging" → lemma: "belong"
- Allows grouping related patterns
- Not yet fully implemented

---

## Base62 Encoding

### Why Base62?

- **URL-safe:** Uses only alphanumeric characters (A-Z, a-z, 0-9)
- **Compact:** 8 characters = 218 trillion possibilities
- **Collision-resistant:** <0.001% chance at 1 billion patterns
- **Human-readable:** Easier to copy/paste than UUIDs

### Character Set

```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

### Encoding Process

1. Take UUID (128-bit integer)
2. Convert to base62
3. Pad or truncate to 8 characters
4. Result: `2tvrCaJB`

---

## Database Schema

### Seed Table Updates

```sql
ALTER TABLE word_seeds ADD COLUMN sdid VARCHAR(8) UNIQUE;
CREATE INDEX idx_word_seeds_sdid ON word_seeds(sdid);
```

### Element Table Updates

For each element table (`word_verbal_layer`, `word_verbal_voicing`, etc.):

```sql
ALTER TABLE {table_name} ADD COLUMN elid VARCHAR(8) UNIQUE;
CREATE INDEX idx_{table_name}_elid ON {table_name}(elid);
```

### Pattern Table Updates

```sql
ALTER TABLE patterns_word ADD COLUMN pattern_ref TEXT;
CREATE INDEX idx_patterns_word_pattern_ref ON patterns_word(pattern_ref);
```

---

## Element Sequence

Elements are assembled in the order they are generated:

1. `vely` - Verbal layer
2. `vevc` - Verbal voicing
3. `vees` - Verbal essence
4. `vily` - Visual layer
5. `vies` - Visual essence
6. `viim` - Visual image

This sequence is preserved in the pattern_ref string.

**Optional:** Add a `sequence` field to track element order explicitly.

---

## Usage Examples

### Full Pattern Reference

```
word.5xT9mK3p.vely:2tvrCaJB.vevc:3kR9mN2x.vees:9xK2pL4m.vily:4mP8nQ1r.vies:7sL3kM9t.viim:1nR4pK2w
```

### Partial References

Reference only needed elements:

```
word.5xT9mK3p.vees:9xK2pL4m.viim:1nR4pK2w
```
(Just essence + image)

```
word.5xT9mK3p.viim:1nR4pK2w
```
(Just the image)

### URL Usage

```
/pattern/word.5xT9mK3p.vely:2tvrCaJB.vevc:3kR9mN2x...
```

Or for brevity, use just the pattern table ID:

```
/pattern/word/2tvrCaJB
```

Then fetch full pattern_ref from database.

### API Usage

```
GET /api/pattern/word.5xT9mK3p
GET /api/element/viim:1nR4pK2w
```

---

## Implementation Checklist

- [ ] Create base62 encoder/decoder utility
- [ ] Add element code mapping constants
- [ ] Create database migration for sdid/elid columns
- [ ] Backfill existing records with short IDs
- [ ] Update pattern generator to create pattern_ref
- [ ] Update API routes to accept PatternID references
- [ ] Update frontend to display and use PatternIDs
- [ ] Add PatternID to Library cards
- [ ] Update pattern detail page routing

---

## Benefits

1. **Self-describing:** Pattern ref tells you exactly what elements exist
2. **Flexible:** Elements can be referenced in any order
3. **Extensible:** New elements can be added without breaking existing refs
4. **Compact:** Much shorter than full UUIDs
5. **URL-safe:** Works in URLs without encoding
6. **Human-readable:** Easier to copy, share, and debug
7. **Precise:** Direct database lookups by short ID

---
## Pattern Evolution

### Genetic Model

The PatternID system is the foundation for **pattern genetics** - treating each element as a gene that can be tracked, reused, and selected for fitness.

**Key Insight:** Each `elid` is a **genetic marker** that enables:
- **Forward Evolution:** Branch from any element to create variations
- **Backward Tracing:** Attribute successful patterns to specific elements
- **Element Reuse:** Preserve proven elements in new patterns
- **Fitness Tracking:** Measure which elements are most successful

### Lineage Tracking

Patterns can have parent-child relationships:

```
ghost (gen 0)
├─ ghost-v2 (gen 1, branch from vees)
├─ ghost-v3 (gen 1, branch from vily)
│  └─ ghost-v4 (gen 2, branch from vies)
└─ ghost-v5 (gen 1, branch from vevc)
```

**Database Schema:**
```sql
patterns_word:
  - parent_pattern_id: UUID (references parent pattern)
  - branch_point: VARCHAR(10) (e.g., "vees", "vily")
  - generation: INTEGER (depth from root, 0 = original)
  - branch_count: INTEGER (number of children)
```

### Element Reuse

When branching, elements can be reused instead of regenerated:

```python
# Branch from ghost at vees (keep verbal chain)
generate_pattern_stream(
    word="ghost",
    reuse_elements={
        "vely": "2tvrCaJB",  # Keep this verbal layer
        "vevc": "3kR9mN2x",  # Keep this voicing
        "vees": "9xK2pL4m"   # Keep this essence
    }
)
# Only generates: vily, vies, viim (new)
```

**Tracking:**
```sql
pattern_element_usage:
  - pattern_id: UUID (which pattern uses this element)
  - element_elid: VARCHAR(8) (the genetic marker)
  - was_reused: BOOLEAN (TRUE if from another pattern)
  - source_pattern_id: UUID (where it came from)
```

### Fitness Metrics

Track which elements are most successful:

```sql
element_fitness:
  - element_elid: VARCHAR(8) PRIMARY KEY
  - times_used: INTEGER (total usage count)
  - times_reused: INTEGER (reuse count)
  - descendant_count: INTEGER (branching success)
  - user_likes: INTEGER (community feedback)
```

**Example Query:**
```sql
-- Find the best verbal layers
SELECT vl.elid, vl.content, ef.times_used, ef.user_likes
FROM word_verbal_layer vl
JOIN element_fitness ef ON vl.elid = ef.element_elid
WHERE ef.times_used > 5
ORDER BY ef.user_likes DESC;
```

### Cross-Breeding (Future)

Combine elements from different patterns:

```
word.{sdid}.vely:ABC123.vevc:XYZ789.vees:DEF456.vily:GHI789.vies:JKL012.viim:MNO345
                 ↑ from ghost      ↑ from love     ↑ from hope
```

This enables **hybrid patterns** that combine successful elements from multiple lineages.

**See:** `/.symbience/EVOLUTION.md` for complete evolutionary model documentation.

---

## Future Considerations


### Song Patterns

```
song.3kR9mN2x.mely:7sL3kM9t.haes:1nR4pK2w.lyes:4mP8nQ1r
```

Element codes TBD:
- `mely` - Melody layer
- `haes` - Harmony essence
- `lyes` - Lyrics essence

### Cross-Pattern References

```
remix.word:5xT9mK3p.song:3kR9mN2x
```

Combining multiple patterns into new compositions.

---

**Last updated:** 2026-01-09
