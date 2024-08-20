import { Injectable } from "@angular/core";
import { GenericRequest } from "../genericRequest/generic.request";
import { HttpClient } from "@angular/common/http";
import { Category } from "src/app/models/category.model";

@Injectable({
    providedIn: 'root'
})
export class CategoryProvider extends GenericRequest<Category> {
    constructor(http: HttpClient){
        super(http,'Category');
    }
}