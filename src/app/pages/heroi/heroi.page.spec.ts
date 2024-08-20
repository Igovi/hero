import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HeroiPage } from './heroi.page';



describe('HeroiPage', () => {
  let component: HeroiPage;
  let fixture: ComponentFixture<HeroiPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeroiPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
