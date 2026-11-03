import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from './shared/bottom-nav/bottom-nav';

@Component({
  imports: [RouterOutlet, BottomNav],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'Prono entre potes';
}
