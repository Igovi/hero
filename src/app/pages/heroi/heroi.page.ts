import { Hero } from 'src/app/models/hero.model';
import { HeroProvider } from '../../services/request/providers/hero.provider';
import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-heroi',
  templateUrl: 'heroi.page.html',
  styleUrls: ['heroi.page.scss']
})
export class HeroiPage implements OnInit {

  public heroList:Hero[] = [];

  constructor(private heroProvider: HeroProvider) {
    
  }
  ngOnInit() {
      this.loadHeroes();
  }

  loadHeroes() {
    this.heroProvider.get().pipe(
      catchError((apiError: any) => {
        console.log('Ocorreu um erro: ', apiError);
        return of([]);
      })
    ).subscribe({
      next: (apiData: any) => {
        this.heroList = apiData.Items; 
      },
      error: (apiError: any) => {
        console.log('Unhandled error:', apiError);
      }
    });
  }

}
