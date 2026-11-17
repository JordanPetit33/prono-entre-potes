import { inject, InjectionToken } from '@angular/core';

/** Requête au modèle : des instructions fixes et un texte de données, toujours séparés. */
export interface LanguageModelRequest {
  instructions: string;
  input: string;
  signal: AbortSignal;
}

/** Seule fonction d'appel à un modèle de langage dans l'application. Renvoie le texte de la réponse. */
export type LanguageModel = (request: LanguageModelRequest) => Promise<string>;

/** Adresse et nom du modèle Ollama local. Aucune clé : le modèle tourne sur la machine. */
export interface LanguageModelConfig {
  url: string;
  model: string;
}

/** Configuration du modèle, fournie dans app.config.ts. Null : aucune fonctionnalité IA. */
export const LANGUAGE_MODEL_CONFIG = new InjectionToken<LanguageModelConfig | null>('LANGUAGE_MODEL_CONFIG', {
  providedIn: 'root',
  factory: () => null,
});

/** Fonction d'appel au modèle. Remplacée par un faux modèle dans les tests ; null sans configuration. */
export const LANGUAGE_MODEL = new InjectionToken<LanguageModel | null>('LANGUAGE_MODEL', {
  providedIn: 'root',
  factory: () => {
    const config = inject(LANGUAGE_MODEL_CONFIG);
    return config ? ollamaModel(config) : null;
  },
});

/** Appel à l'API de discussion d'Ollama, en une seule réponse au format JSON. */
export function ollamaModel(config: LanguageModelConfig, fetchFn: typeof fetch = (...args) => fetch(...args)): LanguageModel {
  const endpoint = `${config.url.replace(/\/+$/, '')}/api/chat`;
  return async ({ instructions, input, signal }) => {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: instructions },
          { role: 'user', content: input },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama a répondu ${response.status}.`);
    }
    const body: unknown = await response.json();
    const content = (body as { message?: { content?: unknown } } | null)?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('Réponse d’Ollama sans texte.');
    }
    return content;
  };
}
