import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class EventEmitterService {

    @Output() currentSearchInputHero = new EventEmitter<number>();
    @Output() currentSearchInputCategory = new EventEmitter<number>();


    @Output() hasNewHeroes = new EventEmitter<boolean>();
    @Output() hasNewCategories = new EventEmitter<boolean>();

    @Output() isSync = new EventEmitter<boolean>();

}
