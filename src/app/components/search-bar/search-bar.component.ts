import { Component, Input, OnInit } from '@angular/core';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {

  @Input() heroPage: boolean = false;

  public inputValue: number;

  constructor(private eventEmitterService:EventEmitterService) { }

  

  onInput(event:any) {
    this.inputValue = event.target.value;
    console.log(this.inputValue)
    console.log(this.heroPage)
    this.heroPage ?  this.eventEmitterService.currentSearchInputHero.emit(this.inputValue): this.eventEmitterService.currentSearchInputCategory.emit(this.inputValue);
}
}
