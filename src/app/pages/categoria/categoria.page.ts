import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { catchError, of, Subscription } from 'rxjs';
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

  
  constructor() {}

  
  
}
