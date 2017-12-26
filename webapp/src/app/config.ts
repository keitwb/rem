import { Injectable, InjectionToken } from '@angular/core';
import {environment} from 'environments/environment';

export const APP_CONFIG = new InjectionToken<string>('config');
export const ConfigProvider = { provide: APP_CONFIG, useValue: environment };

export interface AppConfig {
  dbURL: string;
  updateStreamURL: string;
  searchURL: string;
  production: boolean;
}

