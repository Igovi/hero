import { Component, OnInit } from '@angular/core';

import { SyncService } from './services/network/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private syncService: SyncService) {}

  ngOnInit() {
    this.syncService.networkCheck();
  }
}
