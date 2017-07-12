import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { EffectsModule }    from '@ngrx/effects';
import { StoreModule }      from "@ngrx/store";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './components/app';
import { PropertyModule }   from './property.module';
import { reducer }          from './store/reducers';
import * as effects         from './store/effects';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    StoreModule.provideStore(reducer),
    EffectsModule.run(effects.DBEffects),
    PropertyModule,
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
