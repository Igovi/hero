import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { catchError, of, Subscription, throwError } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { ToastService } from 'src/app/services/communication/toast.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { DataService } from 'src/app/services/storage/data.service';

@Component({
  selector: 'app-category-register',
  templateUrl: './category-register.component.html',
  styleUrls: ['./category-register.component.scss'],
})
export class CategoryRegisterComponent implements OnInit, OnDestroy   {
  private networkStatusSubscription: Subscription;
  isOnline: boolean = true
  category:Category = {
    Name: '',
    Id:0
  }
  pendingCategoryList: any[] = [];

  categoryList: any[] = [];

  constructor(private eventEmitterService: EventEmitterService,
    private modalController: ModalController,
    private categoryProvider: CategoryProvider,
    private networkService: NetworkService,
    private toastService:ToastService,
    private dataService: DataService,) { }

  

  closeModal() {
    this.modalController.dismiss();
  }

  async ngOnInit() {
    this.pendingCategoryList = await this.dataService.getData('pendingCategoryList');
    this.dataService.getData('categoryList').then((storedCategoryList) => {
      this.categoryList = storedCategoryList;
    });
    this.pendingCategoryList === null ? (this.pendingCategoryList = []) : null;
    this.networkCheck();
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.isOnline) {
        this.sendCategoryData(form, false);
        
      } else {
        this.storeCategoryData(form);
        form.reset();
        this.modalController.dismiss();
      }
    } else {
      console.log('Formulário inválido!');
    }
  }

  async storeCategoryData(form: any) {
    let data = {
      Name: this.category.Name,
    };
    this.pendingCategoryList.push(data);
    this.categoryList.push(data);
    this.dataService.saveData('pendingCategoryList', this.pendingCategoryList);
    await this.dataService.saveData('categoryList', this.categoryList);
    this.eventEmitterService.hasNewCategories.emit(true);
  }

  sendCategoryData(form: any, isStored: boolean) {
    let data = {
      name: this.category.Name,
    };
    this.categoryProvider
      .post(isStored ? form : data)
      .pipe(
        catchError((apiError: any) => {
          this.toastService.presentToast('Erro ao cadastrar categoria','danger');
          return throwError(() => apiError);
        })
      )
      .subscribe({
        next: async (apiData: any) => {
          form.reset();
          this.eventEmitterService.hasNewCategories.emit(true);
          this.toastService.presentToast('Sucesso ao cadastrar categoria','success');
          this.modalController.dismiss();
        },
        error: (apiError: any) => {
          console.log('Error:', apiError);
        },
      });
  }

  networkCheck() {
    
    this.networkStatusSubscription =
      this.networkService.networkStatus$.subscribe((isOnline) => {
        this.isOnline = isOnline;
        if (this.isOnline && this.pendingCategoryList.length !== 0) {
          this.syncStoredData();
        }
      });
  }

  private async syncStoredData() {
    this.eventEmitterService.isSync.emit(true);
    const pendingData = await this.dataService.getData('pendingCategoryList');
    pendingData.forEach(async (category: any) => {
      await this.sendCategoryData(category, true);
    });
    this.dataService.removeData('pendingCategoryList');
    this.eventEmitterService.isSync.emit(false);
  }
  ngOnDestroy() {
    if (this.networkStatusSubscription) {
      this.networkStatusSubscription.unsubscribe();
    }
  }


  
}
