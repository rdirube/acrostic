import { CompileTemplateMetadata, isLoweredSymbol } from '@angular/compiler';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef, EventEmitter, Output, HostListener } from '@angular/core';
import { LoadedSvgComponent, SubscriberOxDirective } from 'micro-lesson-components';
import { HorizontalWord, HorizontalWordText, WordAnswer, WordPosition, WordSelectedEmitValues } from 'src/app/shared/types/types';
import { AnswerService, SoundOxService, GameActionsService } from 'micro-lesson-core';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { duplicateWithJSON, equalArrays, isEven, ScreenTypeOx } from 'ox-types';
import anime from 'animejs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { timer } from 'rxjs';

@Component({
  selector: 'app-main-letter',
  templateUrl: './main-letter.component.html',
  styleUrls: ['./main-letter.component.scss']
})
export class MainLetterComponent extends SubscriberOxDirective implements OnInit, AfterViewInit {

  @ViewChildren('wordOxText')
  wordOxTex!: QueryList<ElementRef>;

  @ViewChildren('wordInput')
  wordInput!: QueryList<ElementRef>;

  @ViewChildren('squareImage0')
  squareImage0!: QueryList<LoadedSvgComponent>;

  @ViewChildren('squareImage1')
  squareImage1!: QueryList<LoadedSvgComponent>;

  @ViewChildren('squareImage2')
  squareImage2!: QueryList<LoadedSvgComponent>;

  @Output() erraseAllSelectedInput = new EventEmitter()
  @Input() exerciseWordArray!: string[];
  @Input() mainLetter!: string
  @Input() answerWord!: WordAnswer;
  public answerWordArray!: string[];
  public beforeFirstHalfQuantity!: string[];
  public afterFirstHalfQuantity!: string[];
  public spaceToAddLeft!: number[];
  public spaceToAddRight!: number[];
  public wordOxTextArray!: any[];
  public wordInputArray!: any[];
  public isCorrect!: boolean;
  public containerOn!: boolean;
  public answerLargerThan6!: boolean;
  public firstHalfAnswer!: {txt: string}[];
  public secondHalfAnswer!: {txt: string}[];

  // 



  constructor(private answerService: AcrosticAnswerService, private cdr: ChangeDetectorRef, private challengeService: AcrosticChallengeService
    , private soundService: SoundOxService, public gameActions: GameActionsService<any>, public elementRef: ElementRef) {
    super();

    this.addSubscription(this.answerService.answerForCorrection, x => {
      if (this.answerWord.isComplete && this.containerOn) {
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
    console.log("main-coomponent");
    this.firstHalfAnswer = Array.from({ length: this.beforeFirstHalfQuantity.length }, x =>  { return {txt: ''}});
    this.secondHalfAnswer = Array.from({ length: this.afterFirstHalfQuantity.length }, x => { return {txt: ''}});

  }




  ngAfterViewInit(): void {
    this.wordOxTextArray = this.wordOxTex.toArray();
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
      const concatAnswer: string[] = this.firstHalfAnswer.map( z => z.txt).concat(this.mainLetter).concat(this.secondHalfAnswer.map(y => y.txt));
      if (equalArrays(concatAnswer, this.answerWordArray)) {
        this.correctAnswerAnimation();
        this.answerWord.isCorrect = true;
        this.answerWord.isComplete = false;
        this.gameActions.checkedAnswer.emit({
          correctness: 'correct',
          answer: {
            parts: []
          }
        })
      } else {
        this.wrongAnswerAnimation();
        this.gameActions.checkedAnswer.emit({
          correctness: 'wrong',
          answer: {
            parts: []
          }
        })
      }
    }
  }



  wordIsCompleteCheck() {
    if (this.wordForAnswer.every(word => word !== '')) {
      this.answerWord.isComplete = true;
    } else {
      this.answerWord.isComplete = false;
    }
    this.answerService.answerWordComplete.emit(this.answerWord.id - 1);
  }



  public focusToTheRight(i: number) {
    const indexMod = i === this.wordInputArray.length - 1 ? i : i + 1;
    this.wordIsCompleteCheck();
    if (!this.answerWord.isComplete &&  this.wordInputArray[indexMod].nativeElement.value === '') {
      this.focusInput(i + 1);
    } else {
      this.focusInput(i);
    }
  }


  public focusInput(i: number) {
    if (!this.answerWord.isCorrect) {
      this.erraseAllSelectedInput.emit();
      this.challengeService.wordHasBeenSelected.emit({ id: this.answerWord.id, definition: this.answerWord.description.text });
      this.wordOxTextArray[i].element.nativeElement.style.backgroundColor = '#FAFA33';
      this.containerOn = true;
      this.wordInputArray[i].nativeElement.focus();
      this.wordIsCompleteCheck();
    }
  }


  public onInputChange(e: any) {
    console.log('onInputChange', e)
  }

  public onInputInput(e: any) {
    console.log('onInputInput', e)
  }

  public myMethod(e: InputEvent, index: number){ 
    this.firstHalfAnswer[index].txt = e.data as string;
  }

  public onBeforeInput(e: InputEvent) {
    console.log('onBeforeInput', e);  
    if (e.data !== (e.target as any).value && (e.target as any).value.length) {
      (e.target as any).value = e.data;
       } else {
        e.preventDefault();
        e.stopPropagation();
       
      } 
      // (e.target as any).value = e.data;

  }

  public overwriteLetter(event: Event, i: number, stringArray:{txt: string}[]): void {
    console.log(event.target);
    if (this.wordForAnswer[i] !== '') {
      // stringArray[i].txt = event.target.data as string;    
      this.focusFixed(i,stringArray)
    } else {
    this.focusFixed(i,stringArray)
    }
    // this.erraseLetter(event, i)

  }

  public focusFixed(i:number, stringArray:{txt: string}[]) {
    if(stringArray === this.secondHalfAnswer) {
      this.focusToTheRight(i + this.firstHalfAnswer.length);
      } 
      else if(stringArray === this.firstHalfAnswer && i === this.firstHalfAnswer.length - 1 && this.secondHalfAnswer[0].txt === '') {
        this.focusInput(this.firstHalfAnswer.length);
      } else {
        this.focusToTheRight(i);
      }
  }

  public erraseLetter(event: any, i: number) {
    if (event.data === 8 || event.data === 46) {
      this.wordForAnswer[i] = '';
      this.focusInput(i);
    }
  }


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
      targets: [this.wordOxTextArray.map(oxText => oxText.element.nativeElement)],
      delay: anime.stagger(150, { start: 300 }),
      backgroundColor: '#0FFF50',
      keyframes
    })
    anime({
      targets: [this.squareImage0.map(square => square.elementRef.nativeElement), this.squareImage2.map(square => square.elementRef.nativeElement)],
      delay: anime.stagger(150, { start: 300 }),
      keyframes
    })

  }


  get wordForAnswer(): string[] {
    return this.firstHalfAnswer.map( z => z.txt).concat(this.mainLetter).concat(this.secondHalfAnswer.map(o => o.txt));
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
        targets: this.wordOxTextArray.map(oxText => oxText.element.nativeElement),
        duration: 1100,
        keyframes: [{
          backgroundColor: '#FF2D00'
        }, {
          backgroundColor: '#FFFFFF'
        }],
        easing: 'linear',
      })
  }




  // @HostListener('document:keydown', ['$event'])
  // asdasd($event: KeyboardEvent, i: number) {
  //   if ($event.key === "h" || $event.key === "w") {
  //     this.wordForAnswer.splice(i, 1, '');
  //     this.focusInput(i);
  //   }
  // }



}
