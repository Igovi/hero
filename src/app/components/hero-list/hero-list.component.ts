import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, InfiniteScrollCustomEvent, IonInfiniteScroll } from '@ionic/angular';
import { catchError, of, throwError } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { Hero } from 'src/app/models/hero.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';
import { DataService } from 'src/app/services/storage/data.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/communication/toast.service';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
})
export class HeroListComponent implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;

  public heroList: Hero[] = [];
  public isOnline: boolean = false;
  private networkStatusSubscription: Subscription;



  total: number = 0;
  skip: number = 0;
  take: number = 3;

  public hasNewHeroes: Subscription;

  public isSyncEvent: Subscription;

  public isSync: boolean = false;

  pendingDelete: any[] = [];

  public searchHero: Subscription;

  enableLoad: boolean = false;


  constructor(
    private heroProvider: HeroProvider,
    private dataService: DataService,
    private networkService: NetworkService,
    private eventEmitterService: EventEmitterService,
    private router: Router,
    private toastService: ToastService,
    private alertController: AlertController
  ) { }
  ngOnInit() {
    this.initSubscriptions();
    this.loadHeroes();
    this.networkCheck();
  }

  initSubscriptions() {
    this.isSyncEvent = this.eventEmitterService.isSync.subscribe(
      (eventRes) => {
        this.isSync = eventRes;
        if (this.isSync == false) {
          this.skip = 0;
          this.infiniteScroll.disabled ? this.take = this.total : this.take = 3;
          this.loadHeroes();
        }
      },
      (eventError) => {
        console.log(eventError);
      }
    )

    this.hasNewHeroes = this.eventEmitterService.hasNewHeroes.subscribe(
      (eventRes) => {

        if (this.infiniteScroll.disabled) {
          this.total += 1;
          this.skip = 0
          this.take = this.total;
        }
        else {
          this.take = this.skip
          this.skip = 0;
        }

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
    this.searchHero = this.eventEmitterService.currentSearchInputHero.subscribe(
      (eventRes) => {
        this.enableLoad = false;
        if (String(eventRes) === '') {
          if (this.infiniteScroll === undefined) {
            this.take = this.skip
            this.skip = 0;
          }
          else if (this.infiniteScroll.disabled) {
            this.take = this.total
            this.skip = 0;
          } else {
            this.take = this.skip
            this.skip = 0;
          }
          this.loadHeroes()
        } else {
          this.searchHeroById(eventRes);
        }
      },
      (eventError) => {
        console.log(eventError);
      }
    );
  }

  loadHeroes() {
    this.enableLoad = true;
    this.heroProvider
      .get(this.skip, this.take)
      .pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast('Ocorreu um erro ao carregar os Herois.', 'danger');
          return throwError(() => apiError);
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
          console.log('Error:', apiError);
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
        if (!this.isOnline) {
          this.loadStoredHeroes();
        }else{
          if(this.pendingDelete.length !== 0){
                this.pendingDelete.forEach(async (hero: any) => {
                  await this.deleteHero(hero);
                });
                this.pendingDelete = [];
          }
          this.skip = 0;
        }
      });
  }

  editHero(hero: any) {
    this.router.navigate([`heroi/${hero.Id}`]);
  }

  deleteHero(hero: any) {
    if (this.isOnline) {
      this.heroProvider.delete(hero.Id).pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast('Ocorreu um erro ao Deletar o Herois.', 'danger');
          return throwError(() => apiError);
        }
        )).subscribe({
          next: (apiData: any) => {
            const index = this.heroList.findIndex(el => el.Id === hero.Id);

            if (index !== -1) {
              this.heroList.splice(index, 1);
            }

            this.dataService.saveData('heroList', this.heroList);
            this.toastService.presentToast('Herói deletado com sucesso', 'success');
            this.eventEmitterService.hasNewCategories.emit();
          },
          error: (apiError: any) => {
            console.log('Error:', apiError);
          },
        })
    } else {
      const index = this.heroList.findIndex(el => el.Id === hero.Id);

      if (index !== -1) {
        this.heroList.splice(index, 1);
      }

      this.dataService.saveData('heroList', this.heroList);
      this.pendingDelete.push(hero);
    }

  }

  searchHeroById(id: number) {
    this.heroProvider.getById(id).pipe(
      catchError((apiError: any) => {
        this.toastService.presentToast('Erro ao buscar herói', 'danger');
        return throwError(() => apiError);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.heroList.length = 0;
        this.heroList.push(apiData);
      },
      error: (apiError: any) => {
        console.log('Error', apiError)
      }
    })

  }

  loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isOnline) {
      this.heroProvider
        .get(this.skip, this.take)
        .pipe(
          catchError((apiError: any) => {
            this.toastService.presentToast('Erro ao buscar mais heróis', 'danger');
            return throwError(() => apiError);
          })
        )
        .subscribe({
          next: (apiData: any) => {
            this.heroList = [...this.heroList, ...apiData.Items];
            this.skip += this.take;
            this.dataService.saveData('heroList', this.heroList);
            if (this.heroList.length >= this.total || this.skip > this.total) {
              event.target.disabled = true;
            }
            event.target.complete();
          },
          error: (apiError: any) => {

            console.log('Error:', apiError);
          },
        });
    } else {
      this.toastService.presentToast('Você está offline. Conecte-se à internet para carregar mais heróis.', 'danger');
      event.target.complete()
    }
  }

  



}
