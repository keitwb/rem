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
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppRoutingModule }       from './app-routing.module';
import { reducers, initialState } from './store/reducers';
import * as effects               from './store/effects';
import * as components            from './components';
import * as containers            from './containers';
import * as directives            from './directives';
import { Logger, LogHandlersProvider, MongoClient, SearchClient, SuggestorService, StoreSyncer, WatcherService }  from './services';
import { ConfigProvider }         from './config';

@NgModule({
  declarations: [
    components.EditableComponent,
    components.EditableSingleValueComponent,
    components.SelectComponent,
    components.SelectListComponent,
    components.SetInputComponent,
    components.SuggestorComponent,
    components.PropertyComponent,
    components.PropertyCreateComponent,
    components.PropertyListComponent,
    components.PropertyToolbarComponent,
    components.SearchBarComponent,
    components.MediaListComponent,
    components.SearchResultListComponent,
    containers.AppComponent,
    containers.PropertiesComponent,
    containers.PropertyPageComponent,
    containers.SearchComponent,
    containers.NewPropertyComponent,
    directives.FocusDirective,
    directives.TextDirective,
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
    InfiniteScrollModule,
  ],
  providers: [
    Logger,
    LogHandlersProvider, 
    MongoClient,
    SearchClient,
    SuggestorService,
    StoreSyncer,
    ConfigProvider,
    WatcherService,
  ],
  bootstrap: [containers.AppComponent]
})
export class AppModule { }
