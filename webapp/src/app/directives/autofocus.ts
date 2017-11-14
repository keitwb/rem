import { Directive, ElementRef, Input } from '@angular/core';

@Directive({ selector: '[alwaysfocus]' })
export class AlwaysFocusDirective {
  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.el.nativeElement.focus();
  }
}
