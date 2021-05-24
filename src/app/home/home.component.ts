import { Component, OnInit } from '@angular/core';
import { Observer, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpResponse} from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

export interface Product
{
  id: number;
  name: string;
  inventory: number;
  price: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products: Product[] = [];
  baseURL: string = 'https://localhost:5001/api/v1/';
  dataSource = new MatTableDataSource<Product>();
  
  NewProductId: number = 0;
  NewProductName: string = '';
  NewProductInventory: number = 0;
  NewProductPrice: number = 0;

   myObserver = {
    next: (data) => {
      this.products = data.body;
      this.dataSource.data = this.products;
    },
    error: (err: Error) => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  } as Observer<any>;

  displayedColumnNames: string[] = ['Product ID','Name','Inventory','Unit Price', 'Action'];

  constructor(private httpClient: HttpClient ) { }

  ngOnInit() {
  }

  getProductList_REST() {
    return this.httpClient.get<Product>( this.baseURL + "product", {observe : 'response'});
  }


  public GetProductList()
  {
    this.getProductList_REST().subscribe(this.myObserver);
  }

  public DeleteProductById(id:number)
  {
    let product : any;
    let header : any;
    let status : any;
    let error : any;
    const deleteObserver = {
      next: (response : HttpResponse<any>) => {
         header = response.headers;
         status = response.status;
         product  = response.body;
         if(status == 200)
         {
          const index = this.products.findIndex( p => p.id == id);
          this.products.splice(index, 1);
          this.dataSource.data = this.products;
         }
        },
      error: (err: Error) => {
         console.error('Observer got an error: ' + err.message);
         error = err;
      },
      complete: () => console.log('Observer got a complete notification'),
    } as Observer<any>;

    const url = this.baseURL + "product/" + id;
    this.httpClient.delete(url, {observe : 'response'}).subscribe(deleteObserver);

  }

  public AddNewProduct()
  {

    if(this.NewProductId < 1 || this.NewProductName.length < 1 )
    {
      return;
    }

    const p : Product = { id: this.NewProductId, name: this.NewProductName, inventory: this.NewProductInventory, price: this.NewProductPrice};

    const url = this.baseURL + "product/";

    let product : any;
    let header : any;
    let status : any;
    let error : any;
    const addObserver = {
      next: (response : HttpResponse<any>) => {
         header = response.headers;
         status = response.status;
         product  = response.body;
         if(status == 200)
         {
          this.products.push(product);
          this.dataSource.data = this.products;
         }
        },
      error: (err: Error) => {
         console.error('Observer got an error: ' + err.message);
         error = err;
      },
      complete: () => console.log('Observer got a complete notification'),
    } as Observer<any>;


    this.httpClient.post(url, p, {observe: 'response'}).subscribe(addObserver);
    
  }


  public UpdateProduct()
  {

    if(this.NewProductId < 1 || this.NewProductName.length < 1 )
    {
      return;
    }

    const p : Product = { id: this.NewProductId, name: this.NewProductName, inventory: this.NewProductInventory, price: this.NewProductPrice};

    const index = this.products.findIndex( pd => pd.id == p.id);
    if(index < 0)
    {
      return;
    }

    const url = this.baseURL + "product/" + p.id;

    let product : any;
    let header : any;
    let status : any;
    let error : any;
    const updateObserver = {
      next: (response : HttpResponse<any>) => {
         header = response.headers;
         status = response.status;
         product  = response.body;
         if(status == 200)
         {
          const index = this.products.findIndex( p => p.id == product.id);
          this.products.splice(index, 1, product);
          this.dataSource.data = this.products;
         }
        },
      error: (err: Error) => {
         console.error('Observer got an error: ' + err.message);
         error = err;
      },
      complete: () => console.log('Observer got a complete notification'),
    } as Observer<any>;


    this.httpClient.put(url, p, {observe: 'response'}).subscribe(updateObserver);
    
  }

  public CheckIDNumber()
  {

  }


}
