import { Directive, ElementRef, Input } from '@angular/core';
import * as _ from 'lodash';

@Directive({ selector: '[remFocus]' })
export class FocusDirective {
  constructor(private el: ElementRef) { }

  focus() {
    _.defer(() => this.el.nativeElement.focus());
  }
}
