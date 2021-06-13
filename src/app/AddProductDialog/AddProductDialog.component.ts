import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../services/Product.service';
import { FormControl, FormBuilder, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-AddProductDialog',
  templateUrl: './AddProductDialog.component.html',
  styleUrls: ['./AddProductDialog.component.css']
})
export class AddProductDialogComponent implements OnInit {

  title: string = "Add new product";
  product: Product;

  constructor( private fb: FormBuilder,
    private  dialogRef: MatDialogRef<AddProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: readonly Product[]) {
      this.product = {id: 0, name: "", inventory: 0, price: 0};
    }

  ngOnInit() {
    this.ProductFormGroup.controls.ProductId.setValue(this.product.id);
    this.ProductFormGroup.controls.ProductName.setValue(this.product.name);
    this.ProductFormGroup.controls.ProductInventory.setValue(this.product.inventory);
    this.ProductFormGroup.controls.ProductPrice.setValue(this.product.price);
  }

  ProductFormGroup = this.fb.group({
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


  public TrySubmitProduct()
  {
    this.product.id = this.ProductFormGroup.controls.ProductId.value;
    this.product.name = this.ProductFormGroup.controls.ProductName.value;
    this.product.inventory = this.ProductFormGroup.controls.ProductInventory.value;
    this.product.price = this.ProductFormGroup.controls.ProductPrice.value;

    if(this.ProductFormGroup.valid)
    {
      this.dialogRef.close(this.product);
    }
  }

  public IdExistsValidator(): ValidatorFn 
  {
    return (control: AbstractControl): ValidationErrors | null => {
      const index = this.data.findIndex(x => x.id == control.value);
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
  if(this.ProductFormGroup.valid)
  {
    return ;
  }

  if(this.ProductFormGroup.controls.ProductId.hasError('required'))
  {
    return "Id required.";
  }

  if(this.ProductFormGroup.controls.ProductId.hasError('min'))
  {
    return "Must be > 0.";
  }

  if(this.ProductFormGroup.controls.ProductId.hasError('max'))
  {
    return "Must be < 1E10.";
  }

  let err = this.ProductFormGroup.controls.ProductId.errors as ValidationErrors;

   return err["error"];
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

    return (this.ProductFormGroup.controls.ProductName.errors as ValidationErrors)["error"];
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
