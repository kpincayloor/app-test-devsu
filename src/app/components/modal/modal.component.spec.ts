import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import { By } from '@angular/platform-browser';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct product title', () => {
    const productTitle = 'Test Product';
    component.productTitle = productTitle;

    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.modal-title')).nativeElement;
    expect(titleElement.textContent).toContain(`¿Estás seguro de eliminar el producto ${productTitle}?`);
  });

  it('should emit confirmDelete event on confirm button click', () => {
    jest.spyOn(component.confirmDelete, 'emit');

    const confirmButton = fixture.debugElement.query(By.css('.btn-primary')).nativeElement;
    confirmButton.click();

    expect(component.confirmDelete.emit).toHaveBeenCalled();
  });

  it('should emit cancelDelete event on cancel button click', () => {
    jest.spyOn(component.cancelDelete, 'emit');

    const cancelButton = fixture.debugElement.query(By.css('.btn-secondary')).nativeElement;
    cancelButton.click();

    expect(component.cancelDelete.emit).toHaveBeenCalled();
  });
});
