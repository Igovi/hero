import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeroiPage } from './heroi.page';
import { HeroiPageRoutingModule } from './heroi-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeroiPageRoutingModule
  ],
  declarations: [HeroiPage]
})
export class HeroiPageModule {}
