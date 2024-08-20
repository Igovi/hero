import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroiPage } from './heroi.page';

const routes: Routes = [
  {
    path: '',
    component: HeroiPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroiPageRoutingModule {}
