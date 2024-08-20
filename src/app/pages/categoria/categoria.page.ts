import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';

@Component({
  selector: 'app-categoria',
  templateUrl: 'categoria.page.html',
  styleUrls: ['categoria.page.scss']
})
export class CategoriaPage  implements OnInit{

  public categoryList:Category[] =[];

  constructor(private categoryProvider: CategoryProvider) {}

  ngOnInit() {
    this.loadCategories();
  }
  
  loadCategories() {
    this.categoryProvider.get().pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return of([]);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.categoryList = apiData.Items; 
      },
      error: (apiError: any) => {
        console.log('Unhandled error:', apiError);
      }
    });
  }
}
