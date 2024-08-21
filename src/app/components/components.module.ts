import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeroRegisterComponent } from './hero-register/hero-register..component';
import { HeaderComponent } from './header/header.component';


@NgModule({
  declarations: [HeroRegisterComponent, HeaderComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [HeroRegisterComponent, HeaderComponent],
})
export class ComponentsModule {}
