import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, HeaderComponent],
  providers: [ProductService],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    const productId: number | string | null = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(productId);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', [Validators.required]],
      date_release: ['', [Validators.required, this.dateValidator]],
      date_revision: [{ value: '', disabled: true }, [Validators.required]]
    });

    this.productForm.get('date_release')?.valueChanges.subscribe((date) => {
      this.updateDateRevision(date);
    });
  }

  loadProduct(productId: number | string): void {
    this.productService.getProductById(productId).subscribe((product) => {
      this.productForm.patchValue(product);
      this.productForm.get('id')?.disable();
    });
  }

  updateDateRevision(date: string): void {
    if (date) {
      const releaseDate = new Date(date);
      const revisionDate = new Date(releaseDate);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      this.productForm.get('date_revision')?.setValue(revisionDate.toISOString().split('T')[0]);
    } else {
      this.productForm.get('date_revision')?.setValue('');
    }
  }

  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const controlValue = control.value;

    if (!controlValue) {
      return null;
    }

    const selectedDate = Date.UTC(
      new Date(controlValue).getUTCFullYear(),
      new Date(controlValue).getUTCMonth(),
      new Date(controlValue).getUTCDate()
    );

    const today = Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    );

    return selectedDate >= today ? null : { invalidDate: true };
  }

  getErrorMessage(field: string): string {
    const control = this.productForm.get(field);
    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('minlength')) return `Debe tener al menos ${control.errors?.["minlength"].requiredLength} caracteres`;
    if (control?.hasError('maxlength')) return `Debe tener máximo ${control.errors?.["maxlength"].requiredLength} caracteres`;
    if (control?.hasError('pattern')) return 'Debe ser una URL válida';
    if (control?.hasError('invalidDate')) return 'La fecha debe ser hoy o posterior';
    if (control?.hasError('idExists')) return 'Este ID ya existe';
    return '';
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadProduct(this.productForm.get('id')?.value);
    } else {
      this.productForm.reset();
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData: Product = this.productForm.getRawValue();
      if (!this.isEditMode) {
        this.productService.verifyIdentifier(productData.id).subscribe(
          (exists) => {
            if (exists) {
              this.productForm.get('id')?.setErrors({ idExists: true });
            } else {
              this.productService.createProduct(productData).subscribe(() => this.router.navigate(['/products']));
            }
          },
          (error) => {
            console.error('Error al verificar el ID:', error);
          }
        );
      } else {
        this.productService.updateProduct(productData).subscribe(() => this.router.navigate(['/products']));
      }
    }
  }
}
