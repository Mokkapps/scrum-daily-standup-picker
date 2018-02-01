import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[background-image]'
})
export class BackgroundImageDirective implements AfterViewInit {
  // tslint:disable-next-line:no-input-rename
  @Input('background-image') backgroundImage: string;

  private el: HTMLElement;

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  ngAfterViewInit() {
    this.el.style.backgroundImage = 'url(' + this.backgroundImage + ')';
  }
}
