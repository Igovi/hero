import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeroRegisterComponent } from './hero-register/hero-register..component';
import { HeaderComponent } from './header/header.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { SearchBarComponent } from './search-bar/search-bar.component';


@NgModule({
  declarations: [HeroRegisterComponent, HeaderComponent,HeroListComponent,CategoryListComponent,SearchBarComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [HeroRegisterComponent, HeaderComponent,HeroListComponent,CategoryListComponent,SearchBarComponent],
})
export class ComponentsModule {}
