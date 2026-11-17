import { ollamaModel } from './language-model';

describe('ollamaModel', () => {
  const config = { url: 'http://localhost:11434', model: 'llama3.2' };

  function fakeFetch(response: Response) {
    return vi.fn<typeof fetch>().mockResolvedValue(response);
  }

  it('risque 7 : appelle l’adresse et le modèle de la configuration, sans clé', async () => {
    const fetchFn = fakeFetch(Response.json({ message: { content: '{"doublon": null}' } }));
    const signal = new AbortController().signal;

    const answer = await ollamaModel(config, fetchFn)({ instructions: 'consignes', input: 'données', signal });

    expect(answer).toBe('{"doublon": null}');
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('http://localhost:11434/api/chat');
    expect(init?.method).toBe('POST');
    expect(init?.signal).toBe(signal);
    expect(new Headers(init?.headers).has('Authorization')).toBe(false);
    expect(JSON.parse(String(init?.body))).toEqual({
      model: 'llama3.2',
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: 'consignes' },
        { role: 'user', content: 'données' },
      ],
    });
  });

  it('accepte une adresse terminée par une barre oblique', async () => {
    const fetchFn = fakeFetch(Response.json({ message: { content: '{}' } }));
    await ollamaModel({ ...config, url: 'http://localhost:11434/' }, fetchFn)({
      instructions: '',
      input: '',
      signal: new AbortController().signal,
    });
    expect(fetchFn.mock.calls[0][0]).toBe('http://localhost:11434/api/chat');
  });

  it('lève une erreur quand Ollama répond par une erreur HTTP', async () => {
    const fetchFn = fakeFetch(new Response('modèle introuvable', { status: 404 }));
    await expect(
      ollamaModel(config, fetchFn)({ instructions: '', input: '', signal: new AbortController().signal }),
    ).rejects.toThrow();
  });

  it('lève une erreur quand la réponse n’a pas de texte', async () => {
    const fetchFn = fakeFetch(Response.json({ done: true }));
    await expect(
      ollamaModel(config, fetchFn)({ instructions: '', input: '', signal: new AbortController().signal }),
    ).rejects.toThrow();
  });
});
