import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CadastrarPage } from './cadastrar.page';
import { CadastrarPageRoutingModule } from './cadastrar-routing.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CadastrarPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CadastrarPage]
})
export class CadastrarPageModule {}
