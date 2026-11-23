import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ListaDesejos } from './lista-desejos';

describe('ListaDesejos', () => {
  let component: ListaDesejos;
  let fixture: ComponentFixture<ListaDesejos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDesejos],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaDesejos);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
