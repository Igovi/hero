import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { catchError, of, Subscription, throwError } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { Hero } from 'src/app/models/hero.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { ToastService } from 'src/app/services/communication/toast.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';
import { DataService } from 'src/app/services/storage/data.service';


@Component({
  selector: 'app-edit',
  templateUrl: 'edit.page.html',
  styleUrls: ['edit.page.scss']
})
export class EditPage implements OnInit {

  isCategoryEdit: boolean = false;

  hero: Hero = {
    Name: '',
    Category: {
      Id: 1,
      Name: ''
    },
    Active: true,
    Id: 0
  }
  oldHero: Hero = {
    Name: '',
    Category: {
      Id: 1,
      Name: ''
    },
    Active: true,
    Id: 0
  }

  category: Category = {
    Name: '',
    Id: 0
  }

  pendingEditCategoryList: any[] = [];

  pendingEditHeroList: any[] = [];

  heroName = '';

  categoryList: Category[] = []

  categoryListLocal: any[] = [];

  heroListLocal: any[] = [];


  id: number = -1;

  public isOnline: boolean = true;

  private networkStatusSubscription: Subscription;



  constructor(private networkService: NetworkService, private dataService: DataService, private route: ActivatedRoute, private heroProvider: HeroProvider, private categoryProvider: CategoryProvider, private router: Router, private eventEmitterService: EventEmitterService, private toastService: ToastService, private loadingController: LoadingController, private modalController: ModalController) { }

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(this.router.url);

    if (this.router.url.includes('categoria')) {
      this.isCategoryEdit = true
      this.pendingEditCategoryList = await this.dataService.getData('pendingEditCategoryList');
      await this.dataService.getData('categoryList').then((storedCategoryList) => {
        this.categoryListLocal = storedCategoryList;
      });
      this.pendingEditCategoryList === null ? (this.pendingEditCategoryList = []) : null;
      this.networkCheck();
      this.isOnline ? this.searchCategoryById(this.id) : this.searchCategoryByIdLocal(this.id)
    } else {
      this.isCategoryEdit = false;
      await this.dataService.getData('heroList').then((storedHeroList) => {
        this.heroListLocal = storedHeroList;
      });
      this.pendingEditHeroList = await this.dataService.getData('pendingEditHeroList');
      this.pendingEditHeroList === null ? (this.pendingEditHeroList = []) : null;
      this.networkCheck();
      if (!this.isOnline) {
        this.searchHeroByIdLocal(this.id);
        await this.dataService.getData('fullCategoryList').then((storedCategoryList) => {
          this.categoryList = storedCategoryList;
        })
      } else {
        this.searchHeroById(this.id);
        this.loadCategories();
      }





    }
  }
  networkCheck() {
    this.networkStatusSubscription =
      this.networkService.networkStatus$.subscribe((isOnline) => {
        this.isOnline = isOnline;
        if (this.isCategoryEdit) {
          if (this.isOnline && this.pendingEditCategoryList.length !== 0) {
            this.syncStoredData();
          }
        } else {
          if (this.isOnline && this.pendingEditHeroList.length !== 0) {
            this.syncStoredData();
          }
        }

      });
  }

  private async syncStoredData() {
    this.eventEmitterService.isSync.emit(true);
    if (this.isCategoryEdit) {
      const pendingData = await this.dataService.getData('pendingEditCategoryList');
      pendingData.forEach(async (category: any) => {
        let data = {
          Name: category.Name,
        };
        await this.sendCategoryData(data, category.Id);
      });
      this.dataService.removeData('pendingEditCategoryList');
    }else{
      const pendingData = await this.dataService.getData('pendingEditHeroList');
      pendingData.forEach(async (hero: any) => {
        let data = {
          Name: hero.Name,
          CategoryId: hero.CategoryId,
          Active: hero.Active
        };
        await this.sendHeroData(data, hero.Id);
      });
      this.dataService.removeData('pendingEditHeroList');
    }

    this.eventEmitterService.isSync.emit(false);

  }

  searchHeroById(id: number) {
    this.heroProvider.getById(id).pipe(
      catchError((apiError: any) => {
        this.toastService.presentToast('Erro ao buscar heroi', 'danger');

        return throwError(() => apiError);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.hero = apiData;
      },
      error: (apiError: any) => {
        console.log('Error', apiError)
      }
    })

  }

  searchCategoryById(id: number) {
    this.categoryProvider.getById(id).pipe(
      catchError((apiError: any) => {
        this.toastService.presentToast('Erro ao buscar categoria', 'danger');
        return throwError(() => apiError);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.category = apiData;
      },
      error: (apiError: any) => {
        console.log('Error', apiError)
      }
    })
  }

  searchCategoryByIdLocal(id: number): void {
    this.category = this.categoryListLocal.find(
      (category) => category.Id === id
    )!;
  }

  searchHeroByIdLocal(id: number): void {
    this.hero = this.heroListLocal.find(
      (hero) => hero.Id === id
    )!;
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
          this.toastService.presentToast('Erro ao buscar a lista de categorias', 'danger');
          loading.dismiss();
          return throwError(() => apiError);
        })
      )
      .subscribe({
        next: (apiData: any) => {
          this.categoryList = apiData.Items;
          loading.dismiss();
        },
        error: (apiError: any) => {
          console.log('Error:', apiError);
        },
      });
  }

  onEditHero(form:any){
    if (form.valid) {
      if (this.isOnline) {
        this.sendHeroData(form);

      } else {
        this.storeHeroData(form);
        form.reset();
        this.modalController.dismiss();
      }
    } else {
      console.log('Formulário inválido!');
    }

  }
  sendHeroData(form: any,id?:number) {
    let data = {
      Name: this.hero.Name,
      CategoryId: this.hero.Category.Id,
      Active: this.hero.Active,
    };

    if(data.Name == null){
      data = form
    }

    this.heroProvider
      .put(id? id: this.hero.Id,data)
      .pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast('Erro ao editar heroi', 'danger');
          return throwError(() => apiError);
        })
      )
      .subscribe({
        next: async (apiData: any) => {

          form.reset();
          this.eventEmitterService.hasNewHeroes.emit(true);
          this.toastService.presentToast('Heroi editado com sucesso', 'success');
          this.router.navigate([`heroi`]);
        },
        error: (apiError: any) => {
          console.log('Error:', apiError);
        },
      });
  }

  onEditCategory(form: any) {
    if (form.valid) {
      if (this.isOnline) {
        this.sendCategoryData(form);

      } else {
        this.storeCategoryData(form);
        form.reset();
        this.modalController.dismiss();
      }
    } else {
      console.log('Formulário inválido!');
    }

  }
  async storeHeroData(form: any) {
    let data = {
      Id: this.hero.Id,
      Name: this.hero.Name,
      CategoryId: this.hero.Category.Id,
      Active: this.hero.Active,
    };
    let dataToShow = {
      Id: this.hero.Id,
      Name: this.hero.Name,
      Category: this.hero.Category,
      Active: this.hero.Active,
    };
    console.log(this.heroListLocal)
    this.heroListLocal = this.heroListLocal.map(hero =>
      hero.Id === dataToShow.Id ? { ...dataToShow } : hero
    );
    this.pendingEditHeroList.push(data);
    await this.dataService.saveData('pendingEditHeroList', this.pendingEditHeroList);
    await this.dataService.saveData('heroList', this.heroListLocal).then(() => {
      this.eventEmitterService.hasNewHeroes.emit(true);
      this.router.navigate([`heroi`]);
    });
  }

  async storeCategoryData(form: any) {
    let data = {
      Id: this.category.Id,
      Name: this.category.Name,
    };
    this.categoryListLocal = this.categoryListLocal.map(category =>
      category.Id === data.Id ? { ...category, Name: data.Name } : category
    );
    this.pendingEditCategoryList.push(data);
    await this.dataService.saveData('pendingEditCategoryList', this.pendingEditCategoryList);
    await this.dataService.saveData('categoryList', this.categoryListLocal).then(() => {
      this.eventEmitterService.hasNewCategories.emit(true);
      this.router.navigate([`categoria`]);
    });
  }

  sendCategoryData(form: any, id?: number) {
    let data = {
      name: this.category.Name,
    };

    if (data.name == null) {
      data = form;
    }

    this.categoryProvider
      .put(id ? id : this.id, data)
      .pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast('Erro ao editar categoria', 'danger');
          return throwError(() => apiError);
        })
      )
      .subscribe({
        next: async (apiData: any) => {

          form.reset();
          this.eventEmitterService.hasNewCategories.emit(true);
          this.toastService.presentToast('Categoria editada com sucesso', 'success');
          this.router.navigate([`categoria`]);
        },
        error: (apiError: any) => {

          console.log('Error:', apiError);
        },
      });
  }


}
