import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

//import { PropertyCreateComponent } from './property/property-create.component';
import { PropertyComponent, PropertyListComponent } from './components';
import { PropertyService } from './property-service';

const routes: Routes = [
  { path: 'properties/:id', component: PropertyComponent },
  { path: 'properties',     component: PropertyListComponent },
  //{ path: 'properties/new', component: PropertyCreateComponent },
  { path: '', redirectTo: '/properties', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    //PropertyCreateComponent,
    PropertyListComponent,
    PropertyComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forChild(routes),
  ],
  providers: [ PropertyService ],
})
export class PropertyModule { }
