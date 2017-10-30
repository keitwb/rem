import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import * as components           from './components';
import * as containers           from './containers';

import * as guards from './guards';

const appRoutes: Routes = [
  { path: 'properties/:id',
    component: containers.PropertyPageComponent,
    canActivate: [guards.DocExistsGuard],
  },
  { path: 'properties',     component: components.PropertyListComponent },
  //{ path: 'properties/new', component: PropertyCreateComponent },
  { path: '', redirectTo: '/properties', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [guards.DocExistsGuard],
})
export class AppRoutingModule {}
