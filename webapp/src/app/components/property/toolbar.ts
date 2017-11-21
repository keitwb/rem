import { Component } from '@angular/core';

@Component({
  selector: 'rem-property-toolbar',
  template: `
    <a routerLink="/properties/create" class="btn btn-primary">+ Add Property</a>
  `,
  styles: [`
  `]
})
export class PropertyToolbarComponent {
}
