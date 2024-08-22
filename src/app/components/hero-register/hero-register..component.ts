import { Component, OnInit, OnDestroy } from '@angular/core';
import { catchError, of, Subscription, throwError } from 'rxjs';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import {
  ToastController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';
import { NetworkService } from 'src/app/services/network/network.service';
import { DataService } from 'src/app/services/storage/data.service';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { ToastService } from 'src/app/services/communication/toast.service';

@Component({
  selector: 'app-hero-register',
  templateUrl: './hero-register.component.html',
  styleUrls: ['./hero-register.component.scss'],
})
export class HeroRegisterComponent implements OnInit, OnDestroy {
  public isOnline: boolean = false;
  private networkStatusSubscription: Subscription;

  hero = {
    name: '',
    category: '',
    active: true,
  };

  categories: any[] = [];

  pendingHeroList: any[] = [];
  heroList: any[] = [];

  constructor(
    private categoryProvider: CategoryProvider,
    private loadingController: LoadingController,
    private heroProvider: HeroProvider,
    private networkService: NetworkService,
    private dataService: DataService,
    private eventEmitterService: EventEmitterService,
    private modalController: ModalController,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    this.pendingHeroList = await this.dataService.getData('pendingHeroList');
    this.dataService.getData('heroList').then((storedHeroList) => {
      this.heroList = storedHeroList;
    });
    this.dataService.getData('fullCategoryList').then((storedFullCategoryList) => {
      this.categories = storedFullCategoryList;
    });
    this.pendingHeroList === null ? (this.pendingHeroList = []) : null;
    this.networkCheck();
    this.isOnline ? this.loadCategories() : null
  }

  networkCheck() {
    this.networkStatusSubscription =
      this.networkService.networkStatus$.subscribe((isOnline) => {
        this.isOnline = isOnline;
        if (this.isOnline && this.pendingHeroList.length !== 0) {
          this.syncStoredData();
        }
      });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  private async syncStoredData() {
    const pendingData = await this.dataService.getData('pendingHeroList');
    pendingData.forEach(async (hero: any) => {
      await this.sendHeroData(hero, true);
    });
    this.dataService.removeData('pendingHeroList');
  }

  async loadCategories() {
    const loading = await this.loadingController.create({
      message: 'Carregando categorias...',
      spinner: 'circles',
    });
    await loading.present();

    this.categoryProvider
      .get(0, 50)
      .pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast(
            'Ocorreu um erro ao carregar as categorias.',
            'danger'
          );
          loading.dismiss();
          return throwError(() => apiError);
        })
      )
      .subscribe({
        next: (apiData: any) => {
          this.categories = apiData.Items;
          this.dataService.saveData('fullCategoryList',this.categories);
          loading.dismiss();
        },
        error: (apiError: any) => {
          console.log('Error:', apiError);
          loading.dismiss();
        },
      });
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.isOnline) {
        this.sendHeroData(form, false);
        
      } else {
        this.storeHeroData(form);
        form.reset();
        this.modalController.dismiss();
      }
    } else {
      console.log('Formulário inválido!');
    }
  }

  async storeHeroData(form: any) {
    let dataPost = {
      Name: this.hero.name,
      CategoryId: this.hero.category,
      Active: this.hero.active,
    };

    let dataGet = {
      Name: this.hero.name,
      Category: this.categories.find(
        (categorie) => categorie.Id === this.hero.category
      ),
      Active: this.hero.active,
    };
    this.pendingHeroList.push(dataPost);
    this.heroList.push(dataGet);
    this.dataService.saveData('pendingHeroList', this.pendingHeroList);
    await this.dataService.saveData('heroList', this.heroList);
    this.eventEmitterService.hasNewHeroes.emit(true);
  }

  sendHeroData(form: any, isStored: boolean) {
    let data = {
      Name: this.hero.name,
      CategoryId: this.hero.category,
      Active: this.hero.active,
    };

    this.heroProvider
      .post(isStored ? form : data)
      .pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast(
            'Ocorreu um erro ao enviar o herói',
            'danger'
          );
          console.log('Ocorreu um erro: ', apiError);
          return throwError(() => apiError);
        })
      )
      .subscribe({
        next: async (apiData: any) => {
          this.toastService.presentToast(
            'Herói enviado com sucesso.',
            'success'
          );
          form.reset();
          this.modalController.dismiss();
          this.eventEmitterService.hasNewHeroes.emit(true);
        },
        error: (apiError: any) => {
          console.log('Error:', apiError);
        },
      });
  }

  ngOnDestroy() {
    if (this.networkStatusSubscription) {
      this.networkStatusSubscription.unsubscribe();
    }
  }
}
