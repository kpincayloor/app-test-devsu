import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AddProductComponent } from './add-product.component';
import { ProductService } from '../../services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let productService: ProductService;
  let httpMock: HttpTestingController;
  let routerMock: jest.Mocked<Router>;
  let activatedRouteMock: jest.Mocked<ActivatedRoute>;

  const releaseDate = new Date();
  const revisionDate = new Date(releaseDate);
  revisionDate.setFullYear(revisionDate.getFullYear() + 1);

  const mockProduct = {
    id: '12345',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: releaseDate.toISOString(),
    date_revision: revisionDate.toISOString().split('T')[0],
  };

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(undefined),
        },
      },
    } as unknown as jest.Mocked<ActivatedRoute>;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        AddProductComponent,
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    component = TestBed.inject(AddProductComponent);
    productService = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    component.ngOnInit();
    expect(component.productForm).toBeDefined();
    expect(component.productForm.get('id')).not.toBeNull();
    expect(component.productForm.get('name')).not.toBeNull();
  });

  it('should load product for editing if ID is provided', () => {
    jest.spyOn(activatedRouteMock.snapshot.paramMap, 'get').mockReturnValue('12345');

  const productServiceSpy = jest
    .spyOn(productService, 'getProductById')
    .mockReturnValue(of(mockProduct));

  component.ngOnInit();

  expect(component.isEditMode).toBe(true);
  expect(productServiceSpy).toHaveBeenCalledWith('12345');
  });

  it('should update the revision date when release date changes', () => {
    component.ngOnInit();
    const releaseDateControl = component.productForm.get('date_release');
    const revisionDateControl = component.productForm.get('date_revision');

    releaseDateControl?.setValue('2023-12-01');

    expect(revisionDateControl?.value).toBe('2024-12-01');
  });

  it('should reset the form on reset', () => {
    component.ngOnInit();
    jest.spyOn(component, 'loadProduct').mockImplementation();
    component.isEditMode = false;

    component.onReset();

    expect(component.productForm.pristine).toBe(true);
    expect(component.productForm.untouched).toBe(true);
  });

  it('should validate the date correctly', () => {
    const control = { value: '2024-12-01' } as AbstractControl;
    component.ngOnInit();
    const result = component.dateValidator(control);

    expect(result).toBeNull();

    const invalidControl = { value: '2020-01-01' } as AbstractControl;
    const invalidResult = component.dateValidator(invalidControl);

    expect(invalidResult).toEqual({ invalidDate: true });
  });

  it('should call createProduct on valid form submission in add mode', () => {
    component.ngOnInit();
    const createSpy = jest.spyOn(productService, 'createProduct').mockReturnValue(of(mockProduct));
    jest.spyOn(productService, 'verifyIdentifier').mockReturnValue(of(false));

    component.isEditMode = false;

    component.productForm.patchValue({
      id: mockProduct.id,
      name: mockProduct.name,
      description: mockProduct.description,
      logo: mockProduct.logo,
      date_release: mockProduct.date_release,
    });

    component.productForm.get('date_release')?.setValue(mockProduct.date_release);
    expect(component.productForm.valid).toBe(true);

    component.onSubmit();

    expect(createSpy).toHaveBeenCalledWith({
      id: '12345',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'test-logo.png',
      date_release: releaseDate.toISOString(),
      date_revision: revisionDate.toISOString().split('T')[0],
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should call updateProduct on valid form submission in edit mode', () => {
    component.ngOnInit()
    const updateSpy = jest.spyOn(productService, 'updateProduct').mockReturnValue(of(mockProduct));
    component.isEditMode = true;
    component.productForm.patchValue(mockProduct);

    component.onSubmit();

    expect(updateSpy).toHaveBeenCalledWith(mockProduct);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should show error if product ID already exists', () => {
    component.ngOnInit()
    jest.spyOn(productService, 'verifyIdentifier').mockReturnValue(of(true));
    component.productForm.patchValue(mockProduct);
    const idControl = component.productForm.get('id');
    component.isEditMode = false;

    component.onSubmit();

    expect(idControl?.hasError('idExists')).toBe(true);
  });

  it('should handle form errors correctly', () => {
    component.ngOnInit();
    const errorMessage = component.getErrorMessage('id');
    expect(errorMessage).toBe('Este campo es requerido');
  });
});
