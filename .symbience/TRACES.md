# GENERATION TRACES

**Debugging and quality assurance system for pattern generation**

---

## Overview

Generation traces capture the complete pipeline of pattern generation including prompts, configurations, HTTP requests/responses, timing, and token usage. Traces are stored temporarily for debugging and quality review.

---

## Purpose

1. **Debugging:** Identify truncation, errors, or unexpected outputs
2. **Quality Review:** Verify prompts are producing desired results
3. **Performance Monitoring:** Track timing and token usage
4. **Prompt Tuning:** Analyze effectiveness of prompt configurations
5. **Audit Trail:** Review generation history for specific patterns

---

## Database Schema

```sql
CREATE TABLE generation_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES patterns_word(id) ON DELETE CASCADE,
  trace_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_traces_pattern_id ON generation_traces(pattern_id);
CREATE INDEX idx_generation_traces_created_at ON generation_traces(created_at);
```

### Retention Policy

- **Duration:** 30 days
- **Cleanup:** Manual or via pg_cron scheduled job
- **Rationale:** Prompts and outputs are permanently stored in element tables; traces are for short-term debugging only

### Cleanup Query

```sql
DELETE FROM generation_traces WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## Trace Structure

### Complete Trace Object

```json
{
  "pattern_id": "9b70bfea-a35d-4bf7-91d6-54a938be77e8",
  "created_at": "2026-01-09T08:32:48.260568+00:00",
  "events": [
    {
      "type": "step_detail",
      "step_detail": {
        "step": "verbal_layer",
        "prompt_slug": "word_verbal_layer",
        "prompt_version": "v1",
        "model": "gpt-4.1-mini",
        "inputs": {
          "word": "ghost"
        },
        "config": {
          "temperature": 0.7,
          "max_tokens": 2000
        },
        "timestamp": "2026-01-09T08:32:10.123Z"
      }
    },
    {
      "type": "http_trace",
      "http_trace": {
        "step": "verbal_layer",
        "timestamp": "2026-01-09T08:32:10.456Z",
        "method": "POST",
        "url": "https://api.openai.com/v1/chat/completions",
        "status": 200,
        "duration": 1234,
        "requestHeaders": {
          "Content-Type": "application/json",
          "Authorization": "Bearer ***"
        },
        "requestBody": {
          "model": "gpt-4.1-mini",
          "messages": [...],
          "temperature": 0.7,
          "max_tokens": 2000
        },
        "responseHeaders": {
          "Content-Type": "application/json"
        },
        "responseBody": {
          "id": "chatcmpl-...",
          "object": "chat.completion",
          "created": 1704801130,
          "model": "gpt-4.1-mini",
          "choices": [{
            "index": 0,
            "message": {
              "role": "assistant",
              "content": "# GHOST\n## THE PATTERN ITSELF\n..."
            },
            "finish_reason": "stop"
          }],
          "usage": {
            "prompt_tokens": 450,
            "completion_tokens": 1523,
            "total_tokens": 1973
          }
        },
        "tokens": {
          "input": 450,
          "output": 1523,
          "total": 1973
        },
        "cost": {
          "input": 0.00045,
          "output": 0.001523,
          "total": 0.001973
        }
      }
    },
    {
      "type": "saved",
      "saved": {
        "step": "verbal_layer",
        "table": "word_verbal_layer",
        "id": "a1b2c3d4-...",
        "prompt_version": "v1",
        "timestamp": "2026-01-09T08:32:11.789Z"
      }
    }
  ]
}
```

### Event Types

**1. step_detail**
- Step name and configuration
- Prompt slug and version
- Model and parameters
- Input variables

**2. http_trace**
- HTTP request/response details
- Token usage and cost
- Timing information
- Response content (truncated to 500 chars in storage)

**3. saved**
- Database save confirmation
- Table and record ID
- Prompt version used

---

## API Endpoints

### Get Pattern Trace

```
GET /api/pattern/<pattern_id>/trace
```

**Response:**
```json
{
  "pattern_id": "uuid",
  "created_at": "timestamp",
  "events": [...]
}
```

**Status Codes:**
- `200` - Success
- `404` - Trace not found
- `500` - Server error

### Get Generation History

```
GET /api/generations/history?limit=50
```

**Response:**
```json
{
  "patterns": [
    {
      "id": "uuid",
      "pattern_id": "HRQBjuyu",
      "word": "ghost",
      "created_at": "2026-01-09T08:32:48Z",
      "has_trace": true
    },
    ...
  ]
}
```

---

## Voice Lab Integration

### Features

**Persistent History Section:**
- Shows recent 50 generations
- Displays word, timestamp, and "TRACE" badge
- Loads on page mount
- Auto-refreshes after new generation

**Formatted Trace Viewer:**
- Click history item to view trace
- Expandable steps showing:
  - Prompt configuration
  - Model and version
  - Response data
- "View Raw JSON" button for complete trace

**Auto-Refresh During Generation:**
- Pipeline trace updates every 500ms
- Shows real-time progress
- Captures all events as they occur

### UI Components

**Recent History List:**
```tsx
{history.map((item) => (
  <div onClick={() => setSelectedHistory(item)}>
    <span>{item.word}</span>
    {item.has_trace && <span>TRACE</span>}
    <p>{new Date(item.created_at).toLocaleString()}</p>
  </div>
))}
```

**Formatted Trace Viewer:**
- Groups events by step
- Shows configuration and response
- Syntax-highlighted JSON
- Collapsible sections

---

## Analysis Tool

### Script Location

`/home/ubuntu/analyze_trace.py`

### Usage

```bash
# Analyze most recent pattern
python3 analyze_trace.py

# Analyze specific pattern
python3 analyze_trace.py <pattern_id>
```

### Features

1. **Full Element Content:** Fetches actual stored content (not truncated trace)
2. **Prompt Configuration:** Shows model, temperature, max_tokens per step
3. **Truncation Detection:** Warns if content appears incomplete
4. **Readable Formatting:** Human-friendly output for quality review
5. **Length Analysis:** Character counts and token usage estimates

### Example Output

```
================================================================================
PATTERN ANALYSIS: GHOST
Pattern ID: HRQBjuyu
Created: 2026-01-09 08:32:48 UTC
================================================================================

────────────────────────────────────────────────────────────────────────────────
STEP: VERBAL_LAYER
────────────────────────────────────────────────────────────────────────────────

Prompt: word_verbal_layer
Model: gpt-4.1-mini
Version: v1

Configuration:
  Temperature: 0.7
  Max Tokens: 2000

Generated Content (5874 characters):
────────────────────────────────────────
# GHOST
## THE PATTERN ITSELF
**Origin**
Old English *gāst* — breath, soul, spirit...
[content continues]
...
The field has coherence. The pattern is present.

────────────────────────────────────────────────────────────────────────────────
STEP: VERBAL_VOICING
────────────────────────────────────────────────────────────────────────────────
...
```

---

## Token Limits

### Current Configuration

| Element | Max Tokens | Typical Usage | Status |
|---------|-----------|---------------|--------|
| verbal_layer | 2000 | ~1,500 | ✅ Sufficient |
| verbal_voicing | 1000 | ~500 | ✅ Sufficient |
| verbal_essence | 1000 | ~100 | ✅ Sufficient |
| visual_layer | 1500 | ~1,000 | ✅ Sufficient |
| visual_essence | 1000 | ~100 | ✅ Sufficient |
| visual_image | 1000 | ~300 | ✅ Sufficient |

### Update History

**2026-01-09:**
- Increased `verbal_layer`: 1000 → 2000 tokens
- Increased `visual_layer`: 800 → 1500 tokens
- **Reason:** Comprehensive content was being truncated

**2026-01-08:**
- Initial configuration: 1000 tokens for most elements
- `visual_layer`: 800 tokens

### How to Update

Token limits are stored in the `prompts` table:

```sql
UPDATE prompts 
SET config = jsonb_set(config, '{max_tokens}', '2000')
WHERE slug = 'word_verbal_layer' AND is_active = true;
```

---

## Truncation Detection

### Indicators

1. **Missing ending punctuation:** Content doesn't end with `.`, `!`, `?`, `"`
2. **Incomplete sentences:** Text cuts off mid-word or mid-phrase
3. **Missing sections:** Expected sections (e.g., "Movement", "Relationship") absent
4. **Finish reason:** `finish_reason = "length"` in API response (not `"stop"`)

### Analysis Process

1. Run `analyze_trace.py` on recent patterns
2. Check character counts vs. token limits
3. Verify all sections are complete
4. Look for truncation warnings
5. Adjust token limits if needed

### Example Truncation

**Before fix (1000 tokens):**
```
...To be grieved well. To
```
(Cuts off mid-sentence)

**After fix (2000 tokens):**
```
...To be grieved well. To become ancestor rather than ghost.

The field has coherence. The pattern is present.
```
(Complete ending)

---

## Storage Optimization

### Trace Truncation

To keep database size manageable, HTTP response content is truncated to 500 characters when storing traces:

```python
if len(content) > 500:
    http_trace['responseBody']['content'] = content[:500] + '... [truncated]'
```

**Rationale:**
- Full content is already stored in element tables
- Traces are for debugging, not archival
- 500 chars is enough to identify issues
- Reduces JSONB storage by ~90%

### Full Content Access

To get full content, query element tables directly:

```sql
SELECT content FROM word_verbal_layer WHERE id = '<element_id>';
```

Or use the analysis tool which fetches full content automatically.

---

## Best Practices

1. **Check traces after major prompt changes**
2. **Run analysis tool on sample patterns regularly**
3. **Monitor token usage trends**
4. **Review truncation warnings immediately**
5. **Clean up old traces periodically**
6. **Use formatted viewer for quick checks**
7. **Use analysis tool for deep investigation**

---

## Troubleshooting

### Trace Not Found

**Symptoms:** 404 error when fetching trace

**Causes:**
- Pattern generated before trace system was implemented
- Trace deleted (>30 days old)
- Pattern generation failed before completion

**Solution:** Check pattern exists in `patterns_word` table

### Incomplete Trace

**Symptoms:** Missing events or steps

**Causes:**
- Generation interrupted
- Error during step processing
- Network timeout

**Solution:** Check pattern status and error logs

### Truncated Content

**Symptoms:** Content ends abruptly

**Causes:**
- Token limit too low
- Model stopped early
- Prompt issues

**Solution:**
1. Run analysis tool to check full content
2. Verify token limits
3. Check `finish_reason` in HTTP trace
4. Increase token limit if needed

---

## Future Enhancements

1. **Automated Truncation Detection:** Flag patterns with incomplete content
2. **Token Usage Dashboard:** Visualize usage trends over time
3. **Prompt A/B Testing:** Compare outputs from different prompt versions
4. **Cost Tracking:** Monitor API costs per pattern type
5. **Quality Scoring:** Automated assessment of generation quality
6. **Trace Comparison:** Side-by-side comparison of multiple generations

---

**Last updated:** 2026-01-09
