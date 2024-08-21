import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { catchError, of } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { Hero } from 'src/app/models/hero.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';
import { DataService } from 'src/app/services/storage/data.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
})
export class HeroListComponent implements OnInit {
  public heroList: Hero[] = [];
  public isOnline: boolean = false;
  searchId: number;
  private networkStatusSubscription: Subscription;

  total: number = 0;
  skip: number = 0;
  take: number = 3;

  public hasNewHeroes: Subscription;

  constructor(
    private heroProvider: HeroProvider,
    private dataService: DataService,
    private networkService: NetworkService,
    private eventEmitterService: EventEmitterService
  ) {}
  ngOnInit() {
    this.initSubscriptions();
    this.networkCheck();
  }

  initSubscriptions() {
    this.hasNewHeroes = this.eventEmitterService.hasNewHeroes.subscribe(
      (eventRes) => {
        this.skip = 0;
        this.take = 3;
        if (this.isOnline) {
          this.loadHeroes();
        } else {
          this.loadStoredHeroes();
        }
      },
      (eventError) => {
        console.log(eventError);
      }
    );
  }

  loadHeroes() {
    this.heroProvider
      .get(this.skip, this.take)
      .pipe(
        catchError((apiError: any) => {
          console.log('Ocorreu um erro: ', apiError);
          return of([]);
        })
      )
      .subscribe({
        next: (apiData: any) => {
          this.heroList = apiData.Items;
          this.total = apiData.Total;
          this.skip = this.take;
          this.dataService.saveData('heroList', this.heroList);
        },
        error: (apiError: any) => {
          console.log('Unhandled error:', apiError);
        },
      });
  }

  loadStoredHeroes() {
    this.dataService.getData('heroList').then((storedHeroList) => {
      if (storedHeroList) {
        this.heroList = storedHeroList;
      }
    });
  }

  networkCheck() {
    this.networkStatusSubscription =
      this.networkService.networkStatus$.subscribe((isOnline) => {
        this.isOnline = isOnline;
        console.log('Network status updated:', this.isOnline);
        if (this.isOnline) {
          this.loadHeroes();
        } else {
          this.loadStoredHeroes();
        }
      });
  }

  editHero(hero: any) {
    console.log('Editar herói:', hero);
  }

  deleteHero(hero: any) {
    console.log('Excluir herói:', hero);
  }

  searchHeroById(form: NgForm) {
    if (form.valid) {
      const heroId = this.searchId;
      this.heroList = this.heroList.filter((hero) => hero.Id === heroId);
    }
  }

  loadMore(event: InfiniteScrollCustomEvent): void {
    this.heroProvider
      .get(this.skip, this.take)
      .pipe(
        catchError((apiError: any) => {
          console.log('Ocorreu um erro: ', apiError);
          return of([]);
        })
      )
      .subscribe({
        next: (apiData: any) => {
          this.heroList = [...this.heroList, ...apiData.Items];
          this.skip += this.take;
          this.dataService.saveData('heroList', this.heroList);
          if (this.heroList.length === this.total) {
            event.target.disabled = true;
          }
          event.target.complete();
        },
        error: (apiError: any) => {
          console.log('Unhandled error:', apiError);
        },
      });
  }
}
