import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecibirLlamadaPage } from './recibir-llamada.page';

describe('RecibirLlamadaPage', () => {
  let component: RecibirLlamadaPage;
  let fixture: ComponentFixture<RecibirLlamadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecibirLlamadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
