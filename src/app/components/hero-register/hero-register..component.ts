import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { ToastController, LoadingController } from '@ionic/angular';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';
import { NetworkService } from 'src/app/services/network/network.service';
import { DataService } from 'src/app/services/storage/data.service';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';

@Component({
  selector: 'app-hero-register',
  templateUrl: './hero-register.component.html',
  styleUrls: ['./hero-register.component.scss'],
})
export class HeroRegisterComponent implements OnInit  {

  public isOnline: boolean = false;
  private networkStatusSubscription: Subscription;
  
  hero = {
    name: '',
    category: '',
  };

  categories: any[] = [];

  pendingHeroList: any[] = [];

  heroList: any[] = [];

  constructor(
    private categoryProvider: CategoryProvider,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private heroProvider: HeroProvider,
    private networkService: NetworkService,
    private dataService: DataService,
    private eventEmitterService:EventEmitterService
  ) {}

  async ngOnInit() {
    this.pendingHeroList = await this.dataService.getData('pendingHeroList');
    this.dataService.getData('heroList').then(storedHeroList=>{
      this.heroList = storedHeroList;
    })
    this.pendingHeroList === null ? this.pendingHeroList = [] : null;
    this.networkCheck();
    this.loadCategories();
  }
 

  networkCheck(){
    this.networkStatusSubscription = this.networkService.networkStatus$.subscribe(isOnline => {
      this.isOnline = isOnline;
      if(this.isOnline && this.pendingHeroList.length !== 0){
        this.syncStoredData();
      }
    });
  }
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

      private async syncStoredData() {
    const pendingData = await this.dataService.getData('pendingHeroList');
    pendingData.forEach( async (hero: any) => {
      
      await this.sendHeroData(hero,true);
      this.eventEmitterService.hasNewHeroes.emit(true);
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
      .get(0,50)
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
      this.sendHeroData(form,false);
      this.eventEmitterService.hasNewHeroes.emit(true);
    } else {
      this.isOnline ? console.log('Formulário inválido!') : this.storeHeroData(form);
    }
  }

  async storeHeroData(form:any){
    let data = {
      Name: this.hero.name,
      CategoryId: this.hero.category,
      Active: true,
    };
    this.pendingHeroList.push(data);
    this.heroList.push(data);
    this.dataService.saveData('pendingHeroList', this.pendingHeroList);
    await this.dataService.saveData('heroList' , this.heroList);
    this.eventEmitterService.hasNewHeroes.emit(true);
  }

  sendHeroData(form: any,isStored: boolean) {
    
    let data = {
      Name: this.hero.name,
      CategoryId: this.hero.category,
      Active: true,
    };

    this.heroProvider
      .post(isStored ? form : data)
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
