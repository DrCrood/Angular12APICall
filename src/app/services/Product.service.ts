import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Product
{
  id: number;
  name: string;
  inventory: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  baseURL: string = 'https://localhost:5001/api/v1/';

constructor(private httpClient: HttpClient) { }

public GetProductList()
{
  const url = this.baseURL + "product/";
  return this.httpClient.get<Product>( url, {observe : 'response'});
}

public GetProductById(id: number)
{
  const url = this.baseURL + "product/" + id;
  return this.httpClient.get(url, {observe : 'response'});
}

public DeleteProductById(id: number)
{
  const url = this.baseURL + "product/" + id;
  return this.httpClient.delete(url, {observe : 'response'});
}

public PostProduct(product: Product)
{
  const url = this.baseURL + "product/";
  return this.httpClient.post(url, product, {observe: 'response'});
}

public UpdateProduct(product: Product)
{
  const url = this.baseURL + "product/" + product.id;
  return this.httpClient.put(url, product, {observe: 'response'});
}


}
