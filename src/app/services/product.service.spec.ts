import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrlProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all products', () => {
    const mockProducts: Product[] = [
      { id: '1', name: 'Product 1', description: 'Description 1', logo: 'logo1.png', date_release: '2023-01-01', date_revision: '2024-01-01' },
      { id: '2', name: 'Product 2', description: 'Description 2', logo: 'logo2.png', date_release: '2023-06-01', date_revision: '2024-06-01' },
    ];

    service.getProducts().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should fetch a product by id', () => {
    const mockProduct: Product = { id: '1', name: 'Product 1', description: 'Description 1', logo: 'https://logo1.png', date_release: '2023-01-01', date_revision: '2024-01-01' };

    service.getProductById('1').subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should verify an identifier', () => {
    service.verifyIdentifier('123').subscribe((exists) => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/verification/123`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should verify an identifier', () => {
    service.verifyIdentifier('123').subscribe((exists) => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/verification/123`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should update a product', () => {
    const updatedProduct: Product = { id: '1', name: 'Updated Product', description: 'Updated Description', logo: 'updated-logo.png', date_release: '2023-01-01', date_revision: '2024-01-01' };

    service.updateProduct(updatedProduct).subscribe((product) => {
      expect(product).toEqual(updatedProduct);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush(updatedProduct);
  });

  it('should delete a product', () => {
    const mockResponse = { message: 'Product deleted successfully' };

    service.deleteProduct('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should handle HTTP errors correctly', () => {
    service.getProducts().subscribe(
      () => fail('Expected an error, not products'),
      (error) => {
        expect(error.message).toContain('Resource Not Found');
      }
    );

    const req = httpMock.expectOne(apiUrl);
    req.flush({ message: 'Resource Not Found' }, { status: 404, statusText: 'Not Found' });
  });
});
