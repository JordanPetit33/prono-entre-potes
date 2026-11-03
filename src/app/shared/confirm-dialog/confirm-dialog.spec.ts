import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

@Component({
  imports: [ConfirmDialog],
  template: `
    <app-confirm-dialog
      [open]="open()"
      message="Supprimer Karim ?"
      confirmLabel="Supprimer"
      (confirmed)="events.push('confirmé')"
      (cancelled)="events.push('annulé')"
    />
  `,
})
class Host {
  readonly open = signal(false);
  readonly events: string[] = [];
}

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  function dialog(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog');
  }

  function button(label: string): HTMLButtonElement {
    const found = Array.from(dialog().querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
    if (!found) throw new Error(`Bouton « ${label} » introuvable`);
    return found;
  }

  async function openDialog(): Promise<void> {
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
  }

  it('est fermé tant que open vaut false', () => {
    expect(dialog().open).toBe(false);
  });

  it('s’ouvre quand open passe à true', async () => {
    await openDialog();
    expect(dialog().open).toBe(true);
  });

  it('affiche le message reçu', async () => {
    await openDialog();
    expect(dialog().textContent).toContain('Supprimer Karim ?');
  });

  it('émet « confirmé » au clic sur le bouton de confirmation', async () => {
    await openDialog();
    button('Supprimer').click();
    expect(fixture.componentInstance.events).toEqual(['confirmé']);
  });

  it('émet « annulé » au clic sur « Annuler »', async () => {
    await openDialog();
    button('Annuler').click();
    expect(fixture.componentInstance.events).toEqual(['annulé']);
  });

  it('émet « annulé » quand on appuie sur Échap', async () => {
    await openDialog();
    dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(fixture.componentInstance.events).toEqual(['annulé']);
  });

  it('relie le message à la boîte par un identifiant unique', async () => {
    const other = TestBed.createComponent(Host);
    await other.whenStable();
    const ids = [fixture, other].map((f) => {
      const d = f.nativeElement.querySelector('dialog') as HTMLDialogElement;
      const id = d.getAttribute('aria-labelledby')!;
      expect(d.querySelector(`#${id}`)?.textContent).toContain('Supprimer Karim ?');
      return id;
    });
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('se referme quand open repasse à false', async () => {
    await openDialog();
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(dialog().open).toBe(false);
  });
});
