import { Component, Input } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() hasArrow: boolean = true; // Input para habilitar/desabilitar a seta

  constructor(private navCtrl: NavController) {}

  goBack() {
    if (this.hasArrow) {
      this.navCtrl.back(); // Navega de volta para a página anterior se habilitado
    }
  }
}
