import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptMeComponent } from './adopt-me.component';

describe('AdoptMeComponent', () => {
  let component: AdoptMeComponent;
  let fixture: ComponentFixture<AdoptMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdoptMeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdoptMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
