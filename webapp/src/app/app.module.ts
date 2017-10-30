import { BrowserModule }        from '@angular/platform-browser';
import { NgModule }             from '@angular/core';
import { EffectsModule }        from '@ngrx/effects';
import { StoreModule }          from "@ngrx/store";
import { StoreDevtoolsModule }  from '@ngrx/store-devtools';
import { CommonModule }         from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';
import { HttpModule }           from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule }            from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';

import { AppRoutingModule }       from './app-routing.module';
import { reducers, initialState } from './store/reducers';
import * as effects               from './store/effects';
import * as components            from './components';
import * as containers            from './containers';
import { MongoVersioningClient }  from './services';
import { AppConfig }              from './config';

@NgModule({
  declarations: [
    components.EditableTextComponent,
    components.PropertyListComponent,
    components.PropertyComponent,
    containers.AppComponent,
    containers.PropertyPageComponent,
  ],
  imports: [
    StoreModule.forRoot(reducers, {initialState: initialState}),
    StoreDevtoolsModule.instrument({
      maxAge: 25 //  Retains last 25 states
    }),
    EffectsModule.forRoot([effects.DBEffects]),
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    HttpModule,
    NgbModule.forRoot(),
    ClickOutsideModule,
  ],
  providers: [ AppConfig, MongoVersioningClient ],
  bootstrap: [containers.AppComponent]
})
export class AppModule { }
