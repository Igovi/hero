import { Injectable } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

    private networkStatusSubject = new BehaviorSubject<boolean>(true);
  networkStatus$ = this.networkStatusSubject.asObservable();

  constructor() {
    this.initializeNetworkListeners();
  }

  private async initializeNetworkListeners(): Promise<void> {
    const status = await Network.getStatus();
    this.networkStatusSubject.next(status.connected);

    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.networkStatusSubject.next(status.connected);
    });
  }

  async getNetworkStatus(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }
}
