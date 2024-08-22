import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { catchError, of, Subscription } from 'rxjs';
import { CategoryRegisterComponent } from 'src/app/components/category-register/category-register.component';
import { Category } from 'src/app/models/category.model';
import { NetworkService } from 'src/app/services/network/network.service';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { DataService } from 'src/app/services/storage/data.service';

@Component({
  selector: 'app-categoria',
  templateUrl: 'categoria.page.html',
  styleUrls: ['categoria.page.scss']
})
export class CategoriaPage  {

  
  constructor(private modalController: ModalController) {}

  async openRegisterModal() {
    const modal = await this.modalController.create({
      component: CategoryRegisterComponent,
      cssClass: 'modal'
    });
    return await modal.present();
  }
  
}
