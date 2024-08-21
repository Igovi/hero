import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoriaPageRoutingModule } from './categoria-routing.module';
import { CategoriaPage } from './categoria.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CategoriaPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CategoriaPage]
})
export class CategoriaPageModule {}
