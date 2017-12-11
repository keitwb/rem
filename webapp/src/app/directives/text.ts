import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[remText]'
})
export class TextDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  textNode: any;

  setText(text: any) {
    if (this.el) {
      if (this.textNode) {
        this.renderer.removeChild(this.el.nativeElement, this.textNode);
      }
      this.textNode = this.renderer.createText(String(text));
      this.renderer.appendChild(this.el.nativeElement, this.textNode);
    }
  }

  get width() {
    return this.el.nativeElement.offsetWidth;
  }
}
