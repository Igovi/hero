import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

const apiUrl = environment.url;
const apiKey = environment.apiKey;

@Injectable()
export class GenericRequest<T>{
    private headers = new HttpHeaders({
        'accessKey': `${apiKey}`,  
        'Content-Type': 'application/json'
    });
    constructor(
        private http: HttpClient, 
        @Inject(String) private path:string,
    ){

    }
    

    get():Observable<T[]>{
        return this.http.get<T[]>(`${apiUrl}${this.path}`,{ headers: this.headers });       
    }

    getById(genericId:number):Observable<T>{
        return this.http.get<T>(`${apiUrl}/${this.path}/${genericId}`, { headers: this.headers });       
    }

    post(data:any):Observable<T>{
        return this.http.post<T>(`${apiUrl}/${this.path}`, data, { headers: this.headers });       
    }

    put(genericId:number , data:any):Observable<T>{
        return this.http.put<T>(`${apiUrl}/${this.path}/${genericId}`, data, { headers: this.headers });       
    }

    delete(id:number):Observable<T>{
        return this.http.delete<T>(`${apiUrl}/${this.path}/${id}`, { headers: this.headers });       
    }

    

}