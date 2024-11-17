import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Product } from '../../models/product.model';
import { environment } from '../../../environments/environment';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let productService: ProductService;
  let httpMock: HttpTestingController;
  let routerMock: jest.Mocked<Router>;
  const apiUrl = environment.apiUrlProduct;

  const mockProducts: Product[] = [
    { id: '1', name: 'Product 1', description: 'Description 1', logo: 'logo1.png', date_release: '2023-01-01', date_revision: '2024-01-01' },
    { id: '2', name: 'Product 2', description: 'Description 2', logo: 'logo2.png', date_release: '2023-02-01', date_revision: '2024-02-01' },
  ];

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductListComponent,
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
    component = TestBed.inject(ProductListComponent);
    productService = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on initialization', () => {
    component.ngOnInit();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockProducts });

    expect(component.originalProducts.length).toBe(mockProducts.length);
    expect(component.products.length).toBe(mockProducts.length);
  });

  it('should handle HTTP errors gracefully', () => {
    component.ngOnInit();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const req = httpMock.expectOne(apiUrl);
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.originalProducts.length).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar productos', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should filter products based on search query', () => {
    component.originalProducts = mockProducts;
    component.searchQuery = 'Product 1';
    component.applyFilters();

    expect(component.products.length).toBe(1);
    expect(component.products[0].name).toBe('Product 1');
  });

  it('should navigate to the add product page', () => {
    component.navigateToAdd();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products/add']);
  });

  it('should navigate to the edit product page', () => {
    component.navigateToEdit('1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products/edit', '1']);
  });

  it('should open and close the modal', () => {
    const product = mockProducts[0];
    component.openModal(product);

    expect(component.showModal).toBe(true);
    expect(component.selectedProduct).toBe(product.name);

    component.closeModal();

    expect(component.showModal).toBe(false);
    expect(component.selectedProduct).toBe('');
  });

  it('should delete a product and reload products', () => {
    const product = mockProducts[0];
    const deleteSpy = jest.spyOn(productService, 'deleteProduct').mockReturnValue(of({ message: 'Deleted' }));
    const loadSpy = jest.spyOn(component, 'loadProducts').mockImplementation();

    component.openModal(product);
    component.deleteProduct();

    expect(deleteSpy).toHaveBeenCalledWith(product.id);
    expect(component.showModal).toBe(false);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should handle pagination correctly', () => {
    component.originalProducts = mockProducts;
    component.limit = 1;
    component.applyFilters();

    expect(component.totalPages).toBe(2);
    expect(component.products.length).toBe(1);

    component.nextPage();
    expect(component.currentPage).toBe(2);

    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should toggle dropdown visibility for a product', () => {
    component.toggleDropdown('1');
    expect(component.dropdownVisible['1']).toBe(true);
  });

  it('should hide dropdowns when clicking outside', () => {
    const mockEvent = new MouseEvent('click', { bubbles: true });
    document.dispatchEvent(mockEvent);

    expect(component.dropdownVisible).toEqual({});
  });
});
