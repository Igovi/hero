import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Hero } from "src/app/models/hero.model";
import { GenericRequest } from "../genericRequest/generic.request";

@Injectable({
    providedIn: 'root'
})
export class HeroProvider extends GenericRequest<Hero> {
    constructor(http: HttpClient){
        super(http,'Heroes');
    }
}