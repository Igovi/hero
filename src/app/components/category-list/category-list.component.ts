import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonInfiniteScroll } from '@ionic/angular';
import { catchError, of, Subscription, throwError } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { NetworkService } from 'src/app/services/network/network.service';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { DataService } from 'src/app/services/storage/data.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent  implements OnInit {

  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll: IonInfiniteScroll;


  public categoryList:Category[] =[];

  total:number = 0;
  skip:number = 0;
  take:number = 3;

  public isOnline: boolean = false;

  private networkStatusSubscription: Subscription;

  public hasNewCategories: Subscription;

  public searchCategory:Subscription;

  enableLoad:boolean = false;
  
  constructor(private router: Router,private categoryProvider: CategoryProvider,private networkService: NetworkService, private dataService: DataService,private eventEmitterService:EventEmitterService) {}

  ngOnInit() {
    this.initSubscriptions();
    this.networkCheck();
  }
  
  initSubscriptions() {
    this.hasNewCategories = this.eventEmitterService.hasNewCategories.subscribe(
      (eventRes) => {
        if(this.infiniteScroll.disabled){
          this.total += 1;
          this.take = this.total
          this.skip = 0;
        }else{
          this.take = this.skip
          this.skip = 0;
        }
        if (this.isOnline) {
          this.loadCategories();
        } else {
          this.loadStoredCategories();
        }
      },
      (eventError) => {
        console.log(eventError);
      }
    );
     this.searchCategory = this.eventEmitterService.currentSearchInputCategory.subscribe(
      (eventRes) => {
        this.enableLoad = false;
        if(String(eventRes) === ''){
          if(this.infiniteScroll === undefined){
            this.take = this.skip
            this.skip = 0;
          }
          else if(this.infiniteScroll.disabled){
            this.take = this.total
            this.skip = 0;
          }else{
            this.take = this.skip
            this.skip = 0;
          }
          this.loadCategories()
        }else{
          this.searchCategoryById(eventRes);
        }
           
        
      },
      (eventError) => {
        console.log(eventError);
      }
    );
  }

  loadCategories() {
    this.enableLoad = true;
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

  loadMore(event: InfiniteScrollCustomEvent): void {
    this.categoryProvider.get(this.skip, this.take).pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return of([]);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.categoryList = [...this.categoryList, ...apiData.Items];
        this.skip += this.take;
        this.dataService.saveData('categoryList', this.categoryList);
        if (this.categoryList.length === this.total) {
          event.target.disabled = true;
        }
        event.target.complete();
      },
      error: (apiError: any) => {
        console.log('Unhandled error:', apiError);
      }
    });
  }
  editCategory(category: any) {
    console.log('Editar herói:', category);
    this.router.navigate([`categoria/${category.Id}`]);
  }

  deleteCategory(category: any) {
    if (this.isOnline) {
      this.categoryProvider.delete(category.Id).pipe(
        catchError((apiError: any) => {
          console.log('Ocorreu um erro: ', apiError);
          return throwError(() => apiError);
        }
        )).subscribe({
          next: (apiData: any) => {
            const index = this.categoryList.findIndex(el => el.Id === category.Id);

            if (index !== -1) {
              this.categoryList.splice(index, 1);
            }

            this.dataService.saveData('categoryList', this.categoryList);
          },
          error: (apiError: any) => {
            console.log('Unhandled error:', apiError);
          },
        })
    } else {
      const index = this.categoryList.findIndex(el => el.Id === category.Id);

      if (index !== -1) {
        this.categoryList.splice(index, 1);
      }

      this.dataService.saveData('categoryList', this.categoryList);
    }
  }

  searchCategoryById(id: number) {
    this.categoryProvider.getById(id).pipe(
      catchError((apiError:any) => {
        console.log('Ocorreu um erro: ', apiError);
        return throwError(() => apiError);
      })
    ).subscribe({
      next: (apiData:any) => {
        this.categoryList.length = 0;
        this.categoryList.push(apiData);
      },
      error:(apiError:any) => {
        console.log('Unhandled Error', apiError)
      }
    })

  }
}
