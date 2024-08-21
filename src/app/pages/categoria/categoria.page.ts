import { Component, OnInit } from '@angular/core';
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
export class CategoriaPage  implements OnInit{

  public categoryList:Category[] =[];

  total:number = 0;
  skip:number = 0;
  take:number = 3;

  public isOnline: boolean = false;

  private networkStatusSubscription: Subscription;
  
  constructor(private categoryProvider: CategoryProvider,private networkService: NetworkService, private dataService: DataService) {}

  ngOnInit() {
    this.networkCheck();
  }
  
  loadCategories() {
    this.categoryProvider.get(this.skip,this.take).pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return of([]);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.categoryList = apiData.Items; 
        this.total= apiData.Total
        this.skip = this.take
        this.dataService.saveData('categoryList', this.categoryList);

      },
      error: (apiError: any) => {
        console.log('Unhandled error:', apiError);
      }
    });
  }

  loadStoredCategories(){
    this.dataService.getData('categoryList').then(storedCategoryList => {
      if (storedCategoryList) {
        this.categoryList = storedCategoryList;
      }
    });
  }

  networkCheck(){
    this.networkStatusSubscription = this.networkService.networkStatus$.subscribe(isOnline => {
      this.isOnline = isOnline;
      console.log('Network status updated:', this.isOnline);
      if (this.isOnline) {
        this.loadCategories();
      } else {
        this.loadStoredCategories();
      }
    });
  }
}
