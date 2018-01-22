import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import * as components           from './components';
import * as containers           from './containers';

import * as guards from './guards';
import { Property } from 'app/models';

const appRoutes: Routes = [
  { path: 'properties/create', component: containers.NewPropertyComponent },
  { path: 'properties/:id',
    component: containers.PropertyPageComponent,
    data: {collection: Property.collection},
    canActivate: [guards.DocExistsGuard],
  },
  { path: 'properties',     component: containers.PropertiesComponent },
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
