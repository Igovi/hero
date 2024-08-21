import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeroiPage } from './heroi.page';
import { HeroiPageRoutingModule } from './heroi-routing.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeroiPageRoutingModule,
    ComponentsModule
  ],
  declarations: [HeroiPage]
})
export class HeroiPageModule {}
