
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { EditPage } from '../pages/edit/edit.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'heroi',
        loadChildren: () => import('../pages/heroi/heroi.module').then(m => m.HeroiPageModule)
      },
      {
        path: 'heroi/:id',
        loadChildren: () => import('../pages/edit/edit.module').then(m => m.EditPageModule)
      },
      {
        path: 'categoria',
        loadChildren: () => import('../pages/categoria/categoria.module').then(m => m.CategoriaPageModule)
      },
      {
        path: 'categoria/:id',
        loadChildren: () => import('../pages/edit/edit.module').then(m => m.EditPageModule)
      },
      {
        path: 'cadastrar',
        loadChildren: () => import('../pages/cadastrar/cadastrar.module').then(m => m.CadastrarPageModule)
      },
      {
        path: '',
        redirectTo: '/heroi',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/heroi',
    pathMatch: 'full'
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
