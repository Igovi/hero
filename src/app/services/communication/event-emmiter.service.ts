import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class EventEmitterService {

    @Output() hasNewHeroes = new EventEmitter<boolean>();

}
