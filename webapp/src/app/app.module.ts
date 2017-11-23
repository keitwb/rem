import { BrowserModule }        from '@angular/platform-browser';
import { NgModule }             from '@angular/core';
import { EffectsModule }        from '@ngrx/effects';
import { StoreModule }          from "@ngrx/store";
import { StoreDevtoolsModule }  from '@ngrx/store-devtools';
import { CommonModule }         from '@angular/common';
import { ReactiveFormsModule, FormsModule }  from '@angular/forms';
import { HttpModule }           from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { ClickOutsideModule } from 'ng-click-outside';

import { AppRoutingModule }       from './app-routing.module';
import { reducers, initialState } from './store/reducers';
import * as effects               from './store/effects';
import * as components            from './components';
import * as containers            from './containers';
import * as directives            from './directives';
import { MongoClient, SearchClient, SuggestorService }  from './services';
import { AppConfig }              from './config';

@NgModule({
  declarations: [
    components.EditableTextComponent,
    components.EditableSingleValueComponent,
    components.SelectComponent,
    components.PropertyComponent,
    components.PropertyCreateComponent,
    components.PropertyListComponent,
    components.PropertyToolbarComponent,
    components.SearchBarComponent,
    containers.AppComponent,
    containers.PropertiesComponent,
    containers.PropertyPageComponent,
    containers.SearchComponent,
    containers.NewPropertyComponent,
    directives.AlwaysFocusDirective,
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
    FormsModule,
    HttpModule,
    ClickOutsideModule,
  ],
  providers: [
    AppConfig,
    MongoClient,
    SearchClient,
    SuggestorService,
  ],
  bootstrap: [containers.AppComponent]
})
export class AppModule { }
