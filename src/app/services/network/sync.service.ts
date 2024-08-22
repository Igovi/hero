import { Injectable } from '@angular/core';
import { NetworkService } from '../network/network.service';
import { Subscription } from 'rxjs';
import { DataService } from '../storage/data.service';
import { HeroProvider } from '../request/providers/hero.provider';
import { CategoryProvider } from '../request/providers/category.provider';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private networkStatusSubscription: Subscription;
  isOnline: boolean = false;

  constructor(
    private networkService: NetworkService,
    private dataService: DataService,
    private heroProvider: HeroProvider,
    private categoryprovider: CategoryProvider
  ) {}

  async networkCheck() {
    this.networkStatusSubscription =
      this.networkService.networkStatus$.subscribe(async (isOnline) => {
        this.isOnline = isOnline;
        console.log('Network status updated:', this.isOnline);
        if (this.isOnline) {
          await this.verifySinc();
        }
      });
  }

  private async verifySinc() {
    let heroesToSync = await this.dataService.getData('pendingHeroList');
    let categoriesToSync = await this.dataService.getData(
      'pendingCategoryList'
    );
    if (heroesToSync == null) this.dataService.saveData('pendingHeroList', []);
    if (categoriesToSync == null)
      this.dataService.saveData('pendingCategoryList', []);

    let heroesToSyncError: any[] = [];
    let categoriesToSyncError: any[] = [];
    if (heroesToSync.length != 0) {
      heroesToSync.forEach((hero: any) =>
        this.heroProvider.post(hero).subscribe(
          (res) => {},
          (err) => {
            heroesToSyncError.push(hero);
          }
        )
      );
      this.dataService.removeData('pendingHeroList');
      this.dataService.saveData('pendingHeroList', heroesToSyncError);
    }

    if (categoriesToSync.length != 0) {
      categoriesToSync.forEach((category: any) =>
        this.categoryprovider.post(category).subscribe(
          (res) => {},
          (err) => {
            categoriesToSyncError.push(category);
          }
        )
      );
      this.dataService.removeData('pendingCategoryList');
      this.dataService.saveData('pendingCategoryList', categoriesToSyncError);
    }
  }
}
