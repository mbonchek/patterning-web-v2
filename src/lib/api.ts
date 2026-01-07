const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function fetchHistory() {
  const res = await fetch(`${API_BASE_URL}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function generateWord(word: string) {
  const res = await fetch(`${API_BASE_URL}/word/${word}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate word');
  return res.json();
}

export async function streamWordGeneration(
  word: string,
  onUpdate: (data: any) => void,
  onComplete: () => void,
  onError: (error: string) => void
) {
  try {
    const response = await fetch(`${API_BASE_URL}/word/${word}/stream`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onUpdate(data);

            if (data.status === 'error') {
              onError(data.message || 'Unknown error occurred');
              return;
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to generate pattern');
  }
}

export async function listPrompts() {
  const res = await fetch(`${API_BASE_URL}/prompts`);
  if (!res.ok) throw new Error('Failed to list prompts');
  return res.json();
}

export async function getPrompt(slug: string) {
  const res = await fetch(`${API_BASE_URL}/prompts/${slug}`);
  if (!res.ok) throw new Error('Failed to get prompt');
  return res.json();
}

export async function updatePrompt(slug: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/prompts/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update prompt');
  return res.json();
}

export async function testPrompt(type: 'text' | 'image', data: any) {
  const res = await fetch(`${API_BASE_URL}/playground/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...data }),
  });
  if (!res.ok) throw new Error('Failed to test prompt');
  return res.json();
}
