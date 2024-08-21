import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  async saveData(key: string, data: any) {
    await this.storage.set(key, data);
  }

  async getData(key: string) {
    return await this.storage.get(key);
  }

  async removeData(key: string) {
    await this.storage.remove(key);
  }
}