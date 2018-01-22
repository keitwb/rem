import { Component, Input } from '@angular/core';

@Component({
  selector: 'rem-property-toolbar',
  template: `
    <div class="d-flex justify-content-between align-items-center">
      <span>{{totalCount}} properties</span>
      <a routerLink="/properties/create" class="btn btn-outline-primary">+ Add Property</a>
    </div>
  `,
  styles: [`
  `]
})
export class PropertyToolbarComponent {
  @Input() totalCount: number;
}
