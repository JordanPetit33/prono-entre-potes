import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createEmptyAppData } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { DATA_KEY } from '../core/storage/storage-repository';
import { PlayersPage } from './players-page';

describe('PlayersPage', () => {
  let fixture: ComponentFixture<PlayersPage>;
  let store: AppStore;

  beforeEach(async () => {
    store = TestBed.inject(AppStore);
    store.addPlayer('Karim');
    store.addPlayer('Léa');
    fixture = TestBed.createComponent(PlayersPage);
    await fixture.whenStable();
  });

  const el = (): HTMLElement => fixture.nativeElement;

  function names(): string[] {
    return Array.from(el().querySelectorAll('[data-testid="player-name"]')).map((n) => n.textContent?.trim() ?? '');
  }

  function buttonByLabel(label: string): HTMLButtonElement {
    const found = Array.from(el().querySelectorAll('button')).find(
      (b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label,
    );
    if (!found) throw new Error(`Bouton « ${label} » introuvable`);
    return found;
  }

  async function type(input: HTMLInputElement, value: string): Promise<void> {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(form: HTMLFormElement): Promise<void> {
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  async function click(button: HTMLButtonElement): Promise<void> {
    button.click();
    await fixture.whenStable();
  }

  it('affiche le titre « Joueurs »', () => {
    expect(el().querySelector('h2')?.textContent?.trim()).toBe('Joueurs');
  });

  it('liste les joueurs', () => {
    expect(names()).toEqual(['Karim', 'Léa']);
  });

  describe('ajout', () => {
    const addInput = (): HTMLInputElement => el().querySelector('#new-player-name')!;
    const addForm = (): HTMLFormElement => addInput().closest('form')!;

    it('le champ a un libellé « Nom du joueur »', () => {
      expect(el().querySelector('label[for="new-player-name"]')?.textContent?.trim()).toBe('Nom du joueur');
    });

    it('ajoute un joueur valide et vide le champ', async () => {
      await type(addInput(), 'Tom');
      await submit(addForm());
      expect(names()).toEqual(['Karim', 'Léa', 'Tom']);
      expect(addInput().value).toBe('');
    });

    it('affiche le message d’erreur sous le champ quand le nom est refusé', async () => {
      await type(addInput(), 'lea');
      await submit(addForm());
      const error = el().querySelector('#new-player-name-error');
      expect(error?.textContent?.trim()).toBe('Ce nom est déjà utilisé.');
      expect(addInput().getAttribute('aria-invalid')).toBe('true');
      expect(addInput().getAttribute('aria-describedby')).toBe('new-player-name-error');
      expect(names()).toEqual(['Karim', 'Léa']);
    });

    it('efface le message d’erreur après un ajout réussi', async () => {
      await type(addInput(), '');
      await submit(addForm());
      await type(addInput(), 'Tom');
      await submit(addForm());
      expect(el().querySelector('#new-player-name-error')).toBeNull();
    });
  });

  describe('renommage', () => {
    const renameInput = (): HTMLInputElement => el().querySelector('#rename-player-name')!;

    it('« Renommer Karim » ouvre un champ prérempli', async () => {
      await click(buttonByLabel('Renommer Karim'));
      expect(renameInput().value).toBe('Karim');
    });

    it('enregistre le nouveau nom', async () => {
      await click(buttonByLabel('Renommer Karim'));
      await type(renameInput(), 'Karim B');
      await submit(renameInput().closest('form')!);
      expect(names()).toEqual(['Karim B', 'Léa']);
      expect(el().querySelector('#rename-player-name')).toBeNull();
    });

    it('affiche l’erreur et garde l’ancien nom quand le nom est refusé', async () => {
      await click(buttonByLabel('Renommer Karim'));
      await type(renameInput(), 'Léa');
      await submit(renameInput().closest('form')!);
      expect(el().querySelector('#rename-player-name-error')?.textContent?.trim()).toBe('Ce nom est déjà utilisé.');
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });

    it('« Annuler » referme le champ sans rien changer', async () => {
      await click(buttonByLabel('Renommer Karim'));
      await type(renameInput(), 'Autre');
      await click(buttonByLabel('Annuler le renommage'));
      expect(el().querySelector('#rename-player-name')).toBeNull();
      expect(names()).toEqual(['Karim', 'Léa']);
    });
  });

  describe('lecture seule', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      window.localStorage.setItem(
        DATA_KEY,
        JSON.stringify({
          ...createEmptyAppData(),
          schemaVersion: 2,
          players: [{ id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' }],
        }),
      );
      fixture = TestBed.createComponent(PlayersPage);
      await fixture.whenStable();
    });

    it('désactive le formulaire d’ajout', () => {
      expect(el().querySelector<HTMLInputElement>('#new-player-name')?.disabled).toBe(true);
      expect(buttonByLabel('Ajouter').disabled).toBe(true);
    });

    it('désactive le renommage et la suppression', () => {
      expect(buttonByLabel('Renommer Karim').disabled).toBe(true);
      expect(buttonByLabel('Supprimer Karim').disabled).toBe(true);
    });
  });

  describe('suppression', () => {
    const dialog = (): HTMLDialogElement => el().querySelector('dialog')!;

    function dialogButton(label: string): HTMLButtonElement {
      const found = Array.from(dialog().querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
      if (!found) throw new Error(`Bouton « ${label} » introuvable dans la confirmation`);
      return found;
    }

    it('demande une confirmation qui précise que les pronostics seront supprimés', async () => {
      await click(buttonByLabel('Supprimer Karim'));
      expect(dialog().open).toBe(true);
      expect(dialog().textContent).toContain('Karim');
      expect(dialog().textContent).toContain('pronostics');
    });

    it('annuler ne supprime rien', async () => {
      await click(buttonByLabel('Supprimer Karim'));
      await click(dialogButton('Annuler'));
      expect(dialog().open).toBe(false);
      expect(names()).toEqual(['Karim', 'Léa']);
    });

    it('confirmer supprime le joueur', async () => {
      await click(buttonByLabel('Supprimer Karim'));
      await click(dialogButton('Supprimer'));
      expect(dialog().open).toBe(false);
      expect(names()).toEqual(['Léa']);
    });
  });
});
