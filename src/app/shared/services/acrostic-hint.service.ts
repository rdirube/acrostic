import { EventEmitter, Injectable } from '@angular/core';
import { HintService } from 'micro-lesson-core';

@Injectable({
  providedIn: 'root'
})
export class AcrosticHintService {

  hintsAvaiable = new EventEmitter<{index:number,isComplete:boolean}>();

  constructor() {
   
   }
}
