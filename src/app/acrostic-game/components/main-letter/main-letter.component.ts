import { CompileTemplateMetadata, isLoweredSymbol } from '@angular/compiler';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { LoadedSvgComponent, SubscriberOxDirective } from 'micro-lesson-components';
import { HorizontalWord, HorizontalWordText, WordAnswer, WordPosition, WordSelectedEmitValues } from 'src/app/shared/types/types';
import { AnswerService, SoundOxService, GameActionsService } from 'micro-lesson-core';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { duplicateWithJSON, equalArrays, isEven, ScreenTypeOx } from 'ox-types';
import anime from 'animejs';


@Component({
  selector: 'app-main-letter',
  templateUrl: './main-letter.component.html',
  styleUrls: ['./main-letter.component.scss']
})
export class MainLetterComponent extends SubscriberOxDirective implements OnInit, AfterViewInit {

  @ViewChildren('wordInput')
  wordInput!: QueryList<ElementRef>;

  @ViewChildren('squareImage0')
  squareImage0!: QueryList<LoadedSvgComponent>;

  @ViewChildren('squareImage1')
  squareImage1!: QueryList<LoadedSvgComponent>;

  @ViewChildren('squareImage2')
  squareImage2!: QueryList<LoadedSvgComponent>;

  @Output() erraseAllSelectedInput = new EventEmitter()
  @Input() exerciseWordArray!:string[];
  @Input() mainLetter!: string
  @Input() answerWord!: WordAnswer;
  public answerWordArray!: string[];
  public beforeFirstHalfQuantity!: string[];
  public afterFirstHalfQuantity!: string[];
  public spaceToAddLeft!: number[]; 
  public spaceToAddRight!: number[];
  public wordInputArray!: any[];
  public isCorrect!: boolean;
  public containerOn!:boolean;
  public answerLargerThan6!:boolean; 
  // 

  constructor(private answerService: AcrosticAnswerService, private cdr: ChangeDetectorRef, private challengeService: AcrosticChallengeService
    , private soundService: SoundOxService, public gameActions:GameActionsService<any>,public elementRef:ElementRef) {
    super();

    this.addSubscription(this.answerService.answerForCorrection, x => {
      if(this.answerWord.isComplete && this.containerOn) {
        this.answerCorrection()
      }
    })
    this.containerOn = false;

  }

  ngOnInit(): void {
    this.answerWordArray = this.answerWord.word.text.split('');
    this.beforeFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter, true);
    this.afterFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter, false);
    this.spaceToAddLeft = Array.from({ length: 5 - this.beforeFirstHalfQuantity.length }, (v, i) => i);
    this.spaceToAddRight = Array.from({ length: 5 - this.afterFirstHalfQuantity.length }, (v, i) => i);
    this.answerLargerThan6 = this.exerciseWordArray.length > 6 ? true : false;
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
    let positionsArray: WordPosition[] = [];
    let currentDiffPositionValue: number = 1000;
    let wordQuantity: number = 1;
    wordArray.forEach((word, i) => {
      if (word === wordSearched) {
        positionsArray.push({
          position: wordArray.indexOf(word, wordQuantity),
          lastHalf: wordArray.length - wordArray.indexOf(word, wordQuantity),
          isSelected: false
        });
        wordQuantity++;
      }
    })
    positionsArray.forEach(el => {
      if (Math.abs(el.position - el.lastHalf) < currentDiffPositionValue) {
        positionsArray.forEach(el => el.isSelected = false)
        el.isSelected = true;
        currentDiffPositionValue = Math.abs(el.position - el.lastHalf)
      }
    })
    const positionToReturn = positionsArray.filter(el => el.isSelected);
    return positionToReturn[0].position;
  }




  answerCorrection() {
    if (this.answerWord.isComplete && !this.answerWord.isCorrect) {
      const wordInputArrayForAnswer = duplicateWithJSON(this.wordInputArray.map(z => z.nativeElement.value));
      const firstHalfInputs = wordInputArrayForAnswer.splice(0, this.beforeFirstHalfQuantity.length);
      const secondHalfInputs = wordInputArrayForAnswer.splice(0, this.afterFirstHalfQuantity.length);
      const concatAnswer: string[] = firstHalfInputs.concat(this.mainLetter).concat(secondHalfInputs);
      if (equalArrays(concatAnswer, this.answerWordArray)) {
        this.correctAnswerAnimation();
        this.answerWord.isCorrect = true;
        this.answerWord.isComplete = false;
        this.gameActions.checkedAnswer.emit({
          correctness:'correct',
          answer:{
            parts:[]
          }
        })
      } else {
        this.wrongAnswerAnimation();
        this.gameActions.checkedAnswer.emit({
          correctness:'wrong',
          answer:{
            parts:[]
          }
        })
      }}}




  public textComplete(i:number) {
    this.focusToTheRight(i);
    if (this.wordInputArray.every(wordView => wordView.nativeElement.value !== '')) {
      this.answerWord.isComplete = true;
    } else {
      this.answerWord.isComplete = false;
    }
    this.answerService.answerWordComplete.emit();
  }


  public focusToTheRight(i:number) {
    if(this.wordInputArray[i + this.beforeFirstHalfQuantity.length].nativeElement.style.backgroundColor !== '#FAFA33') {
      this.focusInput(i+1);
    } else {
      this.focusInput(i);
    }
  }


  public focusInput(i:number) {
  if(!this.answerWord.isCorrect) {
    this.erraseAllSelectedInput.emit();
    this.challengeService.wordHasBeenSelected.emit({ id: this.answerWord.id, definition: this.answerWord.description.text });
    this.wordInputArray[i].nativeElement.style.backgroundColor = '#FAFA33';
    this.containerOn = true;
  } }
  



  correctAnswerAnimation() {
    this.soundService.playSoundEffect('sounds/rightAnswer.mp3', ScreenTypeOx.Game);
    const keyframes = [{
      scale: '1.08',
      translateY: '-1.5vh',
      easing: 'easeOutExpo'
    }, {
      scale: '1',
      translateY: '0',
      easing: 'easeOutExpo'
    }]
    anime({
      targets: [this.wordInput.map(input => input.nativeElement)],
      delay: anime.stagger(150, { start: 300 }),
      backgroundColor: '#0FFF50',
      keyframes
    })
    anime({
      targets:[this.squareImage0.map(square => square.elementRef.nativeElement), this.squareImage2.map(square=> square.elementRef.nativeElement)],
      delay: anime.stagger(150, { start: 300 }),
      keyframes
    })

  }




  wrongAnswerAnimation() {
    this.soundService.playSoundEffect('sounds/wrongAnswer.mp3', ScreenTypeOx.Game)
    const rotate = Array.from(Array(8).keys()).map((z, i) => {
      return { value: isEven(i) ? 2 : -2, duration: 50 };
    }).concat([{ value: 0, duration: 50 }]);
    anime({
      targets: [this.squareImage0.map(z => z.elementRef.nativeElement), this.squareImage1.map(z => z.elementRef.nativeElement), this.squareImage2.map(z => z.elementRef.nativeElement)],
      rotate,
    }),
      anime({
        targets: this.wordInput.map(input => input.nativeElement),
        duration: 1100,
        keyframes: [{
          backgroundColor: '#FF2D00'
        }, {
          backgroundColor: '#FFFFFF'
        }],
        easing: 'linear',
      })
  }


}
