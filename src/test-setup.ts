// jsdom n'implémente pas showModal() ni close() sur <dialog> : on les simule pour les tests.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    }
  };
}

// Chaque test part d'un localStorage vide.
beforeEach(() => {
  window.localStorage.clear();
});

// Aucun test n'appelle le réseau (CHARTE-IA.md) : un faux modèle ou un faux fetch remplace le vrai.
// L'appel est refusé, et le test échoue même si le code avale l'erreur.
let networkCalls: string[] = [];
beforeEach(() => {
  networkCalls = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
    networkCalls.push(String(input instanceof Request ? input.url : input));
    return Promise.reject(new Error('Réseau interdit dans les tests : utilisez un faux modèle.'));
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  if (networkCalls.length > 0) {
    throw new Error(`Réseau interdit dans les tests, appel bloqué vers : ${networkCalls.join(', ')}`);
  }
});
