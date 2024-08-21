import { Hero } from 'src/app/models/hero.model';
import { HeroProvider } from '../../services/request/providers/hero.provider';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { DataService } from 'src/app/services/storage/data.service';
import { NetworkService } from 'src/app/services/network/network.service';

@Component({
  selector: 'app-heroi',
  templateUrl: 'heroi.page.html',
  styleUrls: ['heroi.page.scss']
})
export class HeroiPage implements OnInit {

  public heroList:Hero[] = [];
  public isOnline: boolean = false;
  private networkStatusSubscription: Subscription;

  constructor(private heroProvider: HeroProvider, private dataService: DataService,private networkService: NetworkService) {
    
  }
  
  ngOnInit() {
    this.networkCheck();
  }



  loadHeroes() {
    this.heroProvider.get().pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return of([]);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.heroList = apiData.Items; 
        this.dataService.saveData('heroList', this.heroList);
      },
      error: (apiError: any) => {
        console.log('Unhandled error:', apiError);
      }
    });
  }

  loadStoredHeroes(){
    this.dataService.getData('heroList').then(storedHeroList => {
      if (storedHeroList) {
        this.heroList = storedHeroList;
      }
    });
  }

  networkCheck(){
    this.networkStatusSubscription = this.networkService.networkStatus$.subscribe(isOnline => {
      this.isOnline = isOnline;
      console.log('Network status updated:', this.isOnline);
      if (this.isOnline) {
        this.loadHeroes();
      } else {
        this.loadStoredHeroes();
      }
    });
  }

}
