import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoriaPageRoutingModule } from './categoria-routing.module';
import { CategoriaPage } from './categoria.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CategoriaPageRoutingModule
  ],
  declarations: [CategoriaPage]
})
export class CategoriaPageModule {}
