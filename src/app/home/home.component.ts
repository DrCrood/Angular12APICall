import { Component, OnInit } from '@angular/core';
import { Observer, throwError } from 'rxjs';
import { HttpResponse} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Product, ProductService} from '../services/Product.service';
import { AbstractControl, FormControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UpdateProductDialogComponent} from '../UpdateProductDialog/UpdateProductDialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loading: boolean = false;
  products: Product[] = [];
  baseURL: string = 'https://localhost:5001/api/v1/';
  dataSource = new MatTableDataSource<Product>();
  
  NewProductFormGroup = this.fb.group({
    ProductId: new FormControl("", [
      Validators.required,
      Validators.min(1),
      Validators.max(1E10),
      this.IdExistsValidator()
    ]),
    ProductName: new FormControl("", [Validators.required, Validators.minLength(2), this.NameValidator()]),
    ProductInventory: new FormControl("", [Validators.required, Validators.min(0)]),
    ProductPrice: new FormControl("", [Validators.required, Validators.min(0.01)])
  });

  getObserver = {
    next: (data) => {
      this.products = data.body;
      this.dataSource.data = this.products;
      this.loading = false;
    },
    error: (err: Error) => {
      console.error('Observer got an error: ' + err);
      this.loading = false;
    },
    complete: () => {
      console.log('Observer got a complete notification');
      this.loading = false;
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

    this.productService.DeleteProductById(id).subscribe(deleteObserver);

  }

  public PostNewProduct()
  {
    console.warn(this.NewProductFormGroup.value);

    console.log(this.NewProductFormGroup.errors);

    if( this.NewProductFormGroup.invalid )
    {
      return;
    }
    
    const ID = this.NewProductFormGroup.value.ProductId;
    const NAME = this.NewProductFormGroup.value.ProductName;
    const INVENTORY = this.NewProductFormGroup.value.ProductInventory;
    const PRICE = this.NewProductFormGroup.value.ProductPrice;
    const p : Product = { id: ID, name: NAME, inventory: INVENTORY, price: PRICE};

    const url = this.baseURL + "product/";

    let product : any;
    let header : any;
    let status : any;
    let error : any;
    const postObserver = {
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


    this.productService.PostProduct(p).subscribe(postObserver);
    
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

    this.productService.UpdateProduct( product ).subscribe(updateObserver);
  }

  public IdExistsValidator(): ValidatorFn 
  {
    return (control: AbstractControl): ValidationErrors | null => {
      const index = this.products.findIndex(x => x.id == this.NewProductFormGroup.get("ProductId")?.value);
      return index < 0 ? null : {error: " id exists"}};
  }

  public NameValidator(): ValidatorFn 
  {
    return (control: AbstractControl): ValidationErrors | null => {
      let name = control.value as string;
      if( name.match(/^\d/) )
      {
        return {error: "Started with number"};
      } 
      return null;
  }
}

  public getIdErrorMessage()
  {
    if(this.NewProductFormGroup.valid)
    {
      return ;
    }

    if(this.NewProductFormGroup.controls.ProductId.hasError('required'))
    {
      return "Id required.";
    }

    if(this.NewProductFormGroup.controls.ProductId.hasError('min'))
    {
      return "Must be > 0.";
    }

    if(this.NewProductFormGroup.controls.ProductId.hasError('max'))
    {
      return "Must be < 1E10.";
    }

    let err = this.NewProductFormGroup.controls.ProductId.errors as ValidationErrors;

     return err["error"];

  }

  public getNameErrorMessage()
  {
    if(this.NewProductFormGroup.valid)
    {
      return;
    }
    if(this.NewProductFormGroup.controls.ProductName.hasError('required'))
    {
      return "Name required.";
    }
    if(this.NewProductFormGroup.controls.ProductName.hasError('minlength'))
    {
      return "length min 2.";
    }

    return (this.NewProductFormGroup.controls.ProductName.errors as ValidationErrors)["error"];
  }

  public getInventoryErrorMessage()
  {
    if(this.NewProductFormGroup.valid)
    {
      return;
    }
    if(this.NewProductFormGroup.controls.ProductInventory.hasError('required'))
    {
      return "required.";
    }
    if(this.NewProductFormGroup.controls.ProductInventory.hasError('min'))
    {
      return "min 1";
    }

    return "error";
  }

  public getPriceErrorMessage()
  {
    if(this.NewProductFormGroup.valid)
    {
      return;
    }
    if(this.NewProductFormGroup.controls.ProductPrice.hasError('required'))
    {
      return "required.";
    }
    if(this.NewProductFormGroup.controls.ProductPrice.hasError('min'))
    {
      return "min 0.01";
    }
    return "error";

  }


}
