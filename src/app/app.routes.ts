import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AddProductComponent } from './components/add-product/add-product.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'products/add', component: AddProductComponent },
  { path: 'products/edit/:id', component: AddProductComponent },
  { path: '**', redirectTo: '' }
];
