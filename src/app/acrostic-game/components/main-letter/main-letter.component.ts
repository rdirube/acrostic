import { CompileTemplateMetadata, isLoweredSymbol } from '@angular/compiler';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { LoadedSvgComponent, SubscriberOxDirective } from 'micro-lesson-components';
import { WordAnswer, WordPosition, WordSelectedEmitValues } from 'src/app/shared/types/types';
import { AnswerService } from 'micro-lesson-core';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { duplicateWithJSON, equalArrays, isEven } from 'ox-types';
import anime from 'animejs';


@Component({
  selector: 'app-main-letter',
  templateUrl: './main-letter.component.html',
  styleUrls: ['./main-letter.component.scss']
})
export class MainLetterComponent extends SubscriberOxDirective implements OnInit, AfterViewInit {

  @ViewChildren('wordInput')
  wordInput!: QueryList<ElementRef>;
  
  @ViewChildren('squareImage')
  squareImage!: QueryList<LoadedSvgComponent>;

  @Input() mainWord!: string
  @Input() answerWord!: WordAnswer;
  public answerWordArray!: string[];
  public beforeFirstHalfQuantity!: string[];
  public afterFirstHalfQuantity!: string[];
  public spaceToAddLeft!: number[];
  public spaceToAddRight!: number[];
  public wordInputArray!:any[];
  public isCorrect!:boolean;

  constructor(private answerService:AcrosticAnswerService, private cdr:ChangeDetectorRef, private challengeService:AcrosticChallengeService) {
    super();
    // this.addSubscription(this.wordInput.changes, x => {
    //   if(this.wordInputArray.every((wordView => wordView.nativeElement.nodeValue !== null))) {
    //      this.answerService.answerWordComplete.emit();
    //   }})
    this.addSubscription(this.answerService.checkedAnswer, x => {
      this.answerCorrection()
    })

  }

  ngOnInit():void 
  {
      this.answerWordArray = this.answerWord.word.split('');
      this.beforeFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainWord, true);
      this.afterFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainWord, false);
      this.spaceToAddLeft = Array.from({ length: 5 - this.beforeFirstHalfQuantity.length }, (v, i) => i);
      this.spaceToAddRight = Array.from({ length: 5 - this.afterFirstHalfQuantity.length }, (v, i) => i);
  }




  ngAfterViewInit(): void {
    this.wordInputArray = this.wordInput.toArray();
  }





  public answerWordPositionCalculator(wordArray: string[], wordSearched: string, beforeFirstHalf: boolean): string[] {
    const wordAnswerArrayCalc = duplicateWithJSON(wordArray);
    const wordPosition = this.middlePositionCalculator(wordAnswerArrayCalc, wordSearched);
    let wordSplited: string[] = [];
    if (beforeFirstHalf) {
      wordSplited = wordAnswerArrayCalc.splice(0, wordPosition);
      return wordSplited
    } else {
      wordSplited = wordAnswerArrayCalc.splice(wordPosition + 1, wordAnswerArrayCalc.length);
      return wordSplited
    }
  }




  public middlePositionCalculator(wordArray: string[], wordSearched: string): number {
    let positionArray: WordPosition[] = [];
    let positionToReturn: number = 10;
    let wordQuantity: number = 1;
    wordArray.forEach((word, i) => {
      if (word === wordSearched) {
        positionArray.push({
          position: wordArray.indexOf(word, wordQuantity),
          lastHalf: wordArray.length - wordArray.indexOf(word, wordQuantity),
          isSelected: false
        });
        wordQuantity++;
      }
    })
    positionArray.forEach(el => {
      if (Math.abs(el.position - el.lastHalf) < positionToReturn) {
        positionArray.forEach(el => el.isSelected = false)
        el.isSelected = true;
        positionToReturn = Math.abs(el.position - el.lastHalf)
      }
    })
    const positionSelected = positionArray.filter(el => el.isSelected);
    return positionSelected[0].position;
  }



 
  answerCorrection() {
  if(this.answerWord.isComplete && !this.answerWord.isCorrect){
    const firstHalfInputs = this.wordInputArray.splice(0,this.beforeFirstHalfQuantity.length).map(z => z.nativeElement.value);
    const secondHalfInputs = this.wordInputArray.splice(0,this.afterFirstHalfQuantity.length).map(z => z.nativeElement.value);
    const concatAnswer:string[] = firstHalfInputs.concat(this.mainWord).concat(secondHalfInputs);
    if(equalArrays(concatAnswer, this.answerWordArray)) {
      this.correctAnswerAnimation();
      this.answerService.answerWordIncomplete.emit();
    } else {
    this.wrongAnswerAnimetion();
    }
  }
  }

 

 public textComplete() {
    if(this.wordInputArray.every(wordView => wordView.nativeElement.value !== '')) {
         this.answerService.answerWordComplete.emit();
         this.answerWord.isComplete = true;
   } else {
    this.answerService.answerWordIncomplete.emit();}
  }
   

  public wordSelection() {
    this.challengeService.wordHasBeenSelected.emit({id:this.answerWord.id, definition: this.answerWord.definition})
  }
 

 
 correctAnswerAnimation() {
   anime({
     targets:[this.squareImage.map(z => z.elementRef.nativeElement), this.wordInput.map(z=> z.nativeElement)],
     delay:anime.stagger(120,{start:300}),
     backgroundColor: '#0FFF50',
     keyframes:[{
       translateY:'-2vh',
       easing:'easeOutExpo'
     },{
       translateY:'0',
       easing:'easeOutExpo'
     }],
   })
 }



 wrongAnswerAnimetion() {
  const rotate = Array.from(Array(8).keys()).map((z, i) => {
    return { value: isEven(i) ? 2 : -2, duration: 50 };
  }).concat([{ value: 0, duration: 50 }]);
   anime({
    targets:this.squareImage.map(z => z.elementRef.nativeElement),
    rotate,
    backgroundColor:'red'
   })
 }


}
