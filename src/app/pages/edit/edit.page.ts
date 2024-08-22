import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Subscription, throwError } from 'rxjs';
import { Category } from 'src/app/models/category.model';
import { Hero } from 'src/app/models/hero.model';
import { EventEmitterService } from 'src/app/services/communication/event-emmiter.service';
import { CategoryProvider } from 'src/app/services/request/providers/category.provider';
import { HeroProvider } from 'src/app/services/request/providers/hero.provider';


@Component({
  selector: 'app-edit',
  templateUrl: 'edit.page.html',
  styleUrls: ['edit.page.scss']
})
export class EditPage implements OnInit {

  isCategoryEdit:boolean = false;

  hero: Hero = {
    Name: '',
    Category: {
      Id: 1,
      Name: ''
    },
    Active: true,
    Id: 0
  }
  oldHero: Hero = {
    Name: '',
    Category: {
      Id: 1,
      Name: ''
    },
    Active: true,
    Id: 0
  }

  category:Category = {
    Name: '',
    Id:0
  }

  heroName = '';

  categoryList: Category[] = []

  id:number = -1;

  public isOnline: boolean = true;

  private networkStatusSubscription: Subscription;



  constructor(private route: ActivatedRoute, private heroProvider: HeroProvider, private categoryProvider: CategoryProvider, private router: Router, private eventEmitterService: EventEmitterService) { }

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(this.router.url);
    if(this.router.url.includes('categoria')){
      this.isCategoryEdit = true
      this.searchCategoryById(this.id)
    }else{
      this.isCategoryEdit = false;
      this.searchHeroById(this.id);
      this.loadCategories();
    }    
  }
  searchHeroById(id: number) {
    this.heroProvider.getById(id).pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return throwError(() => apiError);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.hero = apiData;
      },
      error: (apiError: any) => {
        console.log('Unhandled Error', apiError)
      }
    })

  }

  searchCategoryById(id: number) {
    this.categoryProvider.getById(id).pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return throwError(() => apiError);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.category = apiData;
      },
      error: (apiError: any) => {
        console.log('Unhandled Error', apiError)
      }
    })

  }

  async loadCategories() {
    this.categoryProvider
      .get(0, 50)
      .pipe(
        catchError((apiError: any) => {
          console.log('Ocorreu um erro: ', apiError);
          return of([]);
        })
      )
      .subscribe({
        next: (apiData: any) => {
          this.categoryList = apiData.Items;
        },
        error: (apiError: any) => {
          console.log('Unhandled error:', apiError);
        },
      });
  }

  onEditHero(form: any) {
    if (form.valid && this.isOnline) {
      this.sendHeroData(form, false);
      // this.eventEmitterService.hasNewHeroes.emit(true);
    } else {
      // this.isOnline
      //   ? console.log('Formulário inválido!')
      //   : this.storeHeroData(form);
    }
  }
  sendHeroData(form: any, isStored: boolean) {
    let data = {
      Name: this.hero.Name,
      CategoryId: this.hero.Category.Id,
      Active: this.hero.Active,
    };

    this.heroProvider
      .put(this.hero.Id, isStored ? form : data)
      .pipe(
        catchError((apiError: any) => {

          console.log('Ocorreu um erro: ', apiError);
          return of([]);
        })
      )
      .subscribe({
        next: async (apiData: any) => {

          form.reset();
          this.eventEmitterService.hasNewHeroes.emit(true);
          this.router.navigate([`heroi`]);
        },
        error: (apiError: any) => {

          console.log('Unhandled error:', apiError);
        },
      });
  }

  onEditCategory(form:any){
    if (form.valid && this.isOnline) {
      this.sendCategoryData(form, false);
      // this.eventEmitterService.hasNewHeroes.emit(true);
    } else {
      // this.isOnline
      //   ? console.log('Formulário inválido!')
      //   : this.storeHeroData(form);
    }

  }

  sendCategoryData(form: any, isStored: boolean) {
    let data = {
      Name: this.category.Name,
    };

    this.categoryProvider
      .put(this.category.Id, isStored ? form : data)
      .pipe(
        catchError((apiError: any) => {

          console.log('Ocorreu um erro: ', apiError);
          return of([]);
        })
      )
      .subscribe({
        next: async (apiData: any) => {

          form.reset();
          this.eventEmitterService.hasNewCategories.emit(true);
          this.router.navigate([`categoria`]);
        },
        error: (apiError: any) => {

          console.log('Unhandled error:', apiError);
        },
      });
  }


}
