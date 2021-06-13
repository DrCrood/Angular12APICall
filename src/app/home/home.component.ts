import { Component, OnInit } from '@angular/core';
import { Observer } from 'rxjs';
import { HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Product, ProductService} from '../services/Product.service';
import { FormControl, FormBuilder } from '@angular/forms';
import { UpdateProductDialogComponent} from '../UpdateProductDialog/UpdateProductDialog.component';
import { AddProductDialogComponent } from '../AddProductDialog/AddProductDialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loading: boolean = false;
  httpError: boolean = false;
  error : HttpErrorResponse = new HttpErrorResponse({});
  products: Product[] = [];
  baseURL: string = 'https://localhost:5001/api/v1/';
  dataSource = new MatTableDataSource<Product>();
  
  getObserver = {
    next: (data) => {
      this.products = data.body;
      this.dataSource.data = this.products;
      this.loading = false;
      this.httpError = false;
    },
    error: (err: HttpErrorResponse) => {
      this.error = err;
      this.loading = false;
      this.httpError = true;
    },
    complete: () => {
      console.log('Observer got a complete notification');
      this.loading = false;
      this.httpError = false;
    },
  } as Observer<any>;

  displayedColumnNames: string[] = ['Product ID','Name','Inventory','Unit Price', 'Update', 'Delete'];

  constructor( private productService: ProductService, private fb: FormBuilder, private dialog: MatDialog )
   {

   }

  ngOnInit() {


  }

  public GetProductList()
  {
    this.loading = true;
    //set some delay to simulate slow processing
    setTimeout(() => { this.productService.GetProductList().subscribe(this.getObserver); }, 1000);    
  }

  public DeleteProductById(id:number)
  {
    const deleteObserver = {
      next: (response : HttpResponse<any>) => {
         const product  = response.body;
         if(response.status == 200)
         {
          const index = this.products.findIndex( p => p.id == id);
          this.products.splice(index, 1);
          this.dataSource.data = this.products;
          this.httpError = false;
         }
        },
      error: (err: HttpErrorResponse) => {
         this.httpError = true;
         this.error = err;
      },
      complete: () => {
         console.log('delete request completed');
         this.httpError = false;
      }
    } as Observer<any>;

    this.productService.DeleteProductById(id).subscribe(deleteObserver);

  }

  public AddNewProduct()
  {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      panelClass: 'dialogpanel',
      width: '300px',
      height: '400px',
      backdropClass: 'winbackdropbg',
      data: this.products
    });

    dialogRef.afterClosed().subscribe( (result: any) => {
      if(result == undefined || result == null || result == ""){ return;}
      this.PostNewProduct(result);
    }); 
  }

  public PostNewProduct( product: Product)
  {
    const url = this.baseURL + "product/";

    const postObserver = {
      next: (response : HttpResponse<any>) => {
         const p  = response.body;
         if(response.status == 200)
         {
          this.products.push(p);
          this.dataSource.data = this.products;
          this.httpError = false;
         }
        },
      error: (err: HttpErrorResponse) => {
         this.httpError = true;
         this.error = err;
      },
      complete: () => {
         console.log('post completed');
         this.httpError = false;
      }
    } as Observer<any>;


    this.productService.PostProduct(product).subscribe(postObserver);
    
  }


  public UpdateProduct(product: Product)
  {
    if( product == undefined || product == null )
    {
      return;
    }

    const dialogRef = this.dialog.open(UpdateProductDialogComponent, {
      panelClass: 'dialogpanel',
      width: '280px',
      height: '340px',
      backdropClass: 'winbackdropbg',
      data: { item: product,
              list: this.products
            }
    });

    dialogRef.afterClosed().subscribe( (result: Product) => {
      if(result == undefined || result == null){ return;}
      this.UpdateProductAPI(result);
    });    
  }

  public UpdateProductAPI(product : Product)
  {
    const updateObserver = {
      next: (response : HttpResponse<any>) => {
         product  = response.body;
         if(response.status == 200)
         {
          const index = this.products.findIndex( p => p.id == product.id);
          this.products.splice(index, 1, product);
          this.dataSource.data = this.products;
          this.httpError = false;
         }
        },
      error: (err: HttpErrorResponse) => {
         this.httpError = true;
         this.error = err;
      },
      complete: () => {
         console.log('Update request completed');
         this.httpError = false;
      }
    } as Observer<any>;

    this.productService.UpdateProduct( product ).subscribe(updateObserver);
  }

}
