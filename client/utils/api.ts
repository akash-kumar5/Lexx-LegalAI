export async function askLLM(prompt: string) {
  const res = await fetch('http://localhost:8000/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  return data.response;
}
