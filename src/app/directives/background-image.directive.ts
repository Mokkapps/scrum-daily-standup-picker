import {
  Directive,
  ElementRef,
  Input,
  OnChanges
} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[background-image]'
})
export class BackgroundImageDirective implements OnChanges {
  // tslint:disable-next-line:no-input-rename
  @Input('background-image') backgroundImage: string;

  private el: HTMLElement;

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  ngOnChanges() {
    this.el.style.backgroundImage = 'url(' + this.backgroundImage + ')';
  }
}
