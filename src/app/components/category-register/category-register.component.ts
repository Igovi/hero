import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { catchError, of, throwError } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { ToastService } from 'src/app/services/communication/toast.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';

@Component({
  selector: 'app-category-register',
  templateUrl: './category-register.component.html',
  styleUrls: ['./category-register.component.scss'],
})
export class CategoryRegisterComponent   {
  isOnline: boolean = true
  category:Category = {
    Name: '',
    Id:0
  }

  constructor(private eventEmitterService: EventEmitterService,
    private modalController: ModalController,
    private categoryProvider: CategoryProvider,
    private networkService: NetworkService,
    private toastService:ToastService) { }

  

  closeModal() {
    this.modalController.dismiss();
  }

  onSubmit(form: any) {
    if (form.valid && this.isOnline) {
      this.sendCategoryData(form, false);
    } else {
      // this.isOnline
      //   ? console.log('Formulário inválido!')
      //   : this.sendCategoryData(form,false);
    }
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

}
