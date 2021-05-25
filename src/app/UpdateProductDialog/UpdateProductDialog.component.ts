import { ProductService } from './../services/Product.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../services/Product.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-UpdateProductDialog',
  templateUrl: './UpdateProductDialog.component.html',
  styleUrls: ['./UpdateProductDialog.component.css']
})
export class UpdateProductDialogComponent implements OnInit {

  title: string = "";
  product: Product;

  constructor( private fb: FormBuilder,
    private  dialogRef: MatDialogRef<UpdateProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {item: Product, list: readonly Product[]}) {
      //the data object passed here is a reference
      this.product = JSON.parse(JSON.stringify(this.data.item));
    }

  ngOnInit() {
    this.title = this.product.name;
    this.ProductFormGroup.controls.ProductId.setValue(this.product.id);
    this.ProductFormGroup.controls.ProductName.setValue(this.product.name);
    this.ProductFormGroup.controls.ProductInventory.setValue(this.product.inventory);
    this.ProductFormGroup.controls.ProductPrice.setValue(this.product.price);
  }

  ProductFormGroup = this.fb.group({
    ProductId: new FormControl("", [
      Validators.required,
      Validators.min(1),
      Validators.max(1E10)
    ]),
    ProductName: new FormControl("", [Validators.required, Validators.minLength(2)]),
    ProductInventory: new FormControl("", [Validators.required, Validators.min(0)]),
    ProductPrice: new FormControl("", [Validators.required, Validators.min(0.01)])
  });


  public GetUpdatedProduct() : Product
  {
    this.product.name = this.ProductFormGroup.controls.ProductName.value;
    this.product.inventory = this.ProductFormGroup.controls.ProductInventory.value;
    this.product.price = this.ProductFormGroup.controls.ProductPrice.value;

    return this.product;
  }

  public getNameErrorMessage()
  {
    if(this.ProductFormGroup.valid)
    {
      return;
    }
    if(this.ProductFormGroup.controls.ProductName.hasError('required'))
    {
      return "Name required.";
    }
    if(this.ProductFormGroup.controls.ProductName.hasError('minlength'))
    {
      return "length min 2.";
    }

    return "error";
  }

  public getInventoryErrorMessage()
  {
    if(this.ProductFormGroup.valid)
    {
      return;
    }
    if(this.ProductFormGroup.controls.ProductInventory.hasError('required'))
    {
      return "required.";
    }
    if(this.ProductFormGroup.controls.ProductInventory.hasError('min'))
    {
      return "min 1";
    }

    return "error";
  }

  public getPriceErrorMessage()
  {
    if(this.ProductFormGroup.valid)
    {
      return;
    }
    if(this.ProductFormGroup.controls.ProductPrice.hasError('required'))
    {
      return "required.";
    }
    if(this.ProductFormGroup.controls.ProductPrice.hasError('min'))
    {
      return "min 0.01";
    }
    return "error";

  }

}
