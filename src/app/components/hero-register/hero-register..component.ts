import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { ToastController, LoadingController } from '@ionic/angular';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';
import { NetworkService } from 'src/app/services/network/network.service';
import { DataService } from 'src/app/services/storage/data.service';

@Component({
  selector: 'app-hero-register',
  templateUrl: './hero-register.component.html',
  styleUrls: ['./hero-register.component.scss'],
})
export class HeroRegisterComponent implements OnInit  , OnDestroy {

  public isOnline: boolean = false;
  private networkStatusSubscription: Subscription;
  
  hero = {
    name: '',
    category: '',
  };

  categories: any[] = [];

  pendingHeroList: any[] = [];

  constructor(
    private categoryProvider: CategoryProvider,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private heroProvider: HeroProvider,
    private networkService: NetworkService,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    this.pendingHeroList = await this.dataService.getData('pendingHeroList');
    this.pendingHeroList === null ? this.pendingHeroList = [] : null;
    this.networkCheck();
    this.loadCategories();
  }
  ngOnDestroy() {
    if (this.networkStatusSubscription) {
      this.networkStatusSubscription.unsubscribe();
    }
  }

  networkCheck(){
    this.networkStatusSubscription = this.networkService.networkStatus$.subscribe(isOnline => {
      this.isOnline = isOnline;
      if(this.isOnline && this.pendingHeroList.length !== 0){
        this.syncStoredData();
      }
    });
  }



      private async syncStoredData() {
    const pendingData = await this.dataService.getData('pendingHeroList');
    pendingData.forEach( async (hero: any) => {
      
      await this.sendHeroData(hero);
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
      .get()
      .pipe(
        catchError((apiError: any) => {
          this.presentToast('Ocorreu um erro ao carregar as categorias.');
          console.log('Ocorreu um erro: ', apiError);
          loading.dismiss();
          return of([]);
        })
      )
      .subscribe({
        next: (apiData: any) => {
          this.categories = apiData.Items;
          loading.dismiss();
        },
        error: (apiError: any) => {
          this.presentToast('Ocorreu um erro inesperado.');
          console.log('Unhandled error:', apiError);
          loading.dismiss();
        },
      });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  onSubmit(form: any) {
    if (form.valid && this.isOnline) {
      this.sendHeroData(form);
    } else {
      this.isOnline ? console.log('Formulário inválido!') : this.storeHeroData(form);
    }
  }

  storeHeroData(form:any){
    let data = {
      Name: this.hero.name,
      CategoryId: this.hero.category,
      Active: true,
    };
    this.pendingHeroList.push(data);
    this.dataService.saveData('pendingHeroList', this.pendingHeroList);
  }

  sendHeroData(form: any) {
    let data = {
      Name: this.hero.name,
      CategoryId: this.hero.category,
      Active: true,
    };

    this.heroProvider
      .post(data)
      .pipe(
        catchError((apiError: any) => {
          this.presentToast('Ocorreu um erro ao enviar o herói.');
          console.log('Ocorreu um erro: ', apiError);
          return of([]);
        })
      )
      .subscribe({
        next: async (apiData: any) => {
          this.presentToast('Herói enviado com sucesso.');
          form.reset(); // Limpa o formulário após o envio com sucesso
        },
        error: (apiError: any) => {
          this.presentToast('Ocorreu um erro inesperado.');
          console.log('Unhandled error:', apiError);
        },
      });
  }
}
