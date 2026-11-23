import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Detalhes } from './detalhes';

describe('Detalhes', () => {
  let component: Detalhes;
  let fixture: ComponentFixture<Detalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detalhes],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Detalhes);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '612');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
