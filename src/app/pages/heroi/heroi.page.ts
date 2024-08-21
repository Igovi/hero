import { Hero } from 'src/app/models/hero.model';
import { HeroProvider } from '../../services/request/providers/hero.provider';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { DataService } from 'src/app/services/storage/data.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-heroi',
  templateUrl: 'heroi.page.html',
  styleUrls: ['heroi.page.scss'],
})
export class HeroiPage{
  constructor() {}

  
}
