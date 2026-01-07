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

export async function testPrompt(type: 'text' | 'image', data: any) {
  const res = await fetch(`${API_BASE_URL}/playground/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...data }),
  });
  if (!res.ok) throw new Error('Failed to test prompt');
  return res.json();
}
