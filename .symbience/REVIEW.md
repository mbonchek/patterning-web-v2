# REVIEW Protocol

**Code review standards and best practices**

---

## General Principles

### Code Quality
- Write clear, readable code that explains its intent
- Prefer explicit over clever
- Use TypeScript types properly (avoid `any` when possible)
- Handle errors gracefully with user-friendly messages

### Consistency
- Follow existing patterns in the codebase
- Match naming conventions (camelCase for variables, PascalCase for components)
- Maintain consistent file structure
- Use established UI patterns (colors, icons, layouts)

### Performance
- Avoid unnecessary re-renders in React
- Use proper dependency arrays in useEffect
- Debounce expensive operations (search, API calls)
- Minimize database queries (use joins, not N+1)

---

## React/TypeScript Standards

### Component Structure
```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';

// 2. Types/Interfaces
interface Props {
  word: string;
  onComplete: (result: string) => void;
}

// 3. Component
export function Component({ word, onComplete }: Props) {
  // 4. State
  const [loading, setLoading] = useState(false);
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, [dependencies]);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### State Management
- Use `useState` for local component state
- Use `useEffect` for side effects (API calls, subscriptions)
- Keep state as close to where it's used as possible
- Lift state only when necessary for sharing

### Error Handling
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Request failed');
  const data = await response.json();
  // ...
} catch (error: any) {
  setError(error.message);
  console.error('Error:', error);
}
```

---

## API Design Standards

### Endpoint Structure
- Use RESTful conventions
- Return consistent JSON structures
- Include proper HTTP status codes (200, 400, 404, 500)
- Handle errors gracefully

### Response Format
```python
# Success
return jsonify({"data": result}), 200

# Error
return jsonify({"error": "Description"}), 400
```

### Streaming Responses
```python
def generate():
    yield f"data: {json.dumps(event)}\n\n"

return Response(stream_with_context(generate()), 
                mimetype='text/event-stream')
```

---

## Database Patterns

### Query Optimization
- Use joins instead of separate queries
- Limit results appropriately
- Order by relevant fields (usually created_at DESC)
- Handle missing data gracefully (LEFT JOIN)

### Schema Design
- Foreign keys for relationships
- Timestamps for audit trail (created_at, updated_at)
- Nullable fields for optional data
- Consistent naming conventions

---

## UI/UX Standards

### Color Usage
- **Verbal components:** Blue (`text-blue-500`, `bg-blue-500`)
- **Visual components:** Green (`text-green-500`, `bg-green-500`)
- **System/Admin:** Purple, Teal
- **Errors:** Red (`text-red-500`, `bg-red-900/20`)
- **Neutral:** Slate grays

### Icon Usage
- Use Lucide React icons consistently
- Size: 16-20px for inline, 24px for standalone
- Color: Match component type (blue/green) or neutral

### Loading States
```typescript
{loading && <div className="animate-pulse">Loading...</div>}
{error && <div className="text-red-500">{error}</div>}
{data && <div>{/* render data */}</div>}
```

### Responsive Design
- Use Tailwind responsive prefixes (sm:, md:, lg:)
- Test on different screen sizes
- Ensure mobile usability

---

## Testing Checklist

### Before Committing
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] UI renders correctly
- [ ] Interactions work as expected
- [ ] Error states handled gracefully

### After Deployment
- [ ] Hard refresh to clear cache
- [ ] Test main user flows
- [ ] Check browser console for errors
- [ ] Verify API responses

---

## Common Pitfalls

### React
- Forgetting dependency arrays in useEffect
- Mutating state directly instead of using setState
- Not handling loading/error states
- Excessive re-renders from improper memoization

### TypeScript
- Using `any` instead of proper types
- Not handling null/undefined cases
- Ignoring type errors with `@ts-ignore`

### API
- Not handling errors properly
- Returning inconsistent data structures
- Missing status codes
- Not validating input

### Database
- N+1 query problems
- Not handling missing data (NULL values)
- Inefficient queries (missing indexes)
- Not using transactions for multi-step operations

---

**Last updated:** 2026-01-08
