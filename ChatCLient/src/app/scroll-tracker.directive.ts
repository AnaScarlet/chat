import { Directive, Input, Output, EventEmitter, SimpleChanges  } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HostListener } from '@angular/core';

@Directive({
  selector: '[appScrollTracker]'
})
export class ScrollTrackerDirective {

  @Input() startIndx: number;
  @Output() renderMessages = new EventEmitter<{renderStartIndex:number, renderEndIndex:number}>();

  prevPositionStart: number = 0;
  private msgIndx;

  constructor(private el: ElementRef) { 
    this.msgIndx = this.startIndx;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("New start index = " + changes.startIndx.currentValue);
    this.msgIndx = changes.startIndx.currentValue;
    if (!changes.startIndx.isFirstChange() && this.msgIndx == 0){
      console.log("Need to screll back down...");
      this.el.nativeElement.scrollTop = 0;
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    let direction: string;
    let tracker = event.target;
    if (event.target.scrollTop < this.prevPositionStart) {  // More negative means scrolling to the top
      direction = "top";
    }

    let limit = -(tracker.scrollHeight - tracker.clientHeight -1);
    let renderEndIndex: number = this.msgIndx+8;

    if (tracker.scrollTop <= limit) {
      console.log("Get new messages");

      console.log("Starting at index: " + this.startIndx);
      this.renderMessages.emit({renderStartIndex: this.msgIndx, renderEndIndex: renderEndIndex});
    }

    this.prevPositionStart = event.target.scrollTop;
  }

}
