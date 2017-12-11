import { Component } from '@angular/core';

@Component({
  selector: 'rem-app',
  template: `
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-between" id="navbar">
          <div class="navbar-nav">
            <a class="nav-item nav-link" routerLink="/properties">Properties</a>
            <a class="nav-item nav-link" routerLink="/contacts">Contacts</a>
            <rem-search></rem-search>
          </div>
          <div class="navbar-nav">
            <a class="nav-item nav-link" routerLink="/logout">Logout</a>
          </div>
        </div> 
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
  `]
})
export class AppComponent {
}
