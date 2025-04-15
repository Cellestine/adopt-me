import { Component } from '@angular/core';
import { AdoptMeComponent } from './adopt-me/adopt-me.component';

@Component({
  selector: 'app-root',
  imports: [AdoptMeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
