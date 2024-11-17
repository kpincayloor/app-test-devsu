import { Component, OnInit, HostListener } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { Router } from '@angular/router';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, AddProductComponent, ModalComponent],
  providers: [ProductService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  originalProducts: Product[] = [];
  filteredProducts: Product[] = [];
  totalResults = 0;
  searchQuery = '';
  limit = 5;
  limitOptions = [5, 10, 20];
  currentPage = 1;
  totalPages = 1;
  dropdownVisible: { [key: string]: boolean } = {};
  showModal = false;
  selectedProduct = '';
  productRemoved!: Product;


  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (data: any) => {
        this.originalProducts = data.data;
        this.applyFilters();
      },
      error => {
        console.error('Error al cargar productos', error);
      }
    );
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onLimitChange(event: Event): void {
    this.limit = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.originalProducts.filter(product =>
      product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    this.totalResults = this.filteredProducts.length;
    this.totalPages = Math.ceil(this.totalResults / this.limit);

    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    this.products = this.filteredProducts.slice(start, end);

    this.totalResults = this.products.length;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  toggleDropdown(productId: number | string): void {
    this.dropdownVisible = {};
    this.dropdownVisible[productId] = !this.dropdownVisible[productId];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.dropdownVisible = {};
    }
  }

  navigateToAdd(): void {
    this.router.navigate(['/products/add']);
  }

  navigateToEdit(productId: number | string): void {
    this.router.navigate(['/products/edit', productId]);
  }

  openModal(product: Product) {
    this.selectedProduct = product.name;
    this.productRemoved = product;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = '';
    this.productRemoved = {} as Product;
  }

  deleteProduct() {
    this.productService.deleteProduct(this.productRemoved.id).subscribe(() => {
      this.closeModal();
      this.loadProducts();
    });
  }
}
