import { CompileTemplateMetadata, isLoweredSymbol } from '@angular/compiler';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef, EventEmitter, Output, HostListener } from '@angular/core';
import { LoadedSvgComponent, SubscriberOxDirective } from 'micro-lesson-components';
import { HorizontalWord, HorizontalWordText, WordAnswer, WordPosition, WordSelectedEmitValues, WordText } from 'src/app/shared/types/types';
import { AnswerService, SoundOxService, GameActionsService } from 'micro-lesson-core';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { duplicateWithJSON, equalArrays, isEven, ScreenTypeOx } from 'ox-types';
import anime from 'animejs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Observable, timer } from 'rxjs';

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



  @Output() erraseAllSelectedInput = new EventEmitter();
  @Output() componentInitEmit = new EventEmitter();
  @Input() exerciseWordArray!: string[];
  @Input() mainLetter!: string
  @Input() answerWord!: WordAnswer;
  @Input() set currentId(value: string) {
    this.currentIdParsed = parseFloat(value);
    if (this.answerWord !== undefined && this.currentIdParsed !== this.answerWord.id) {
      this.containerOn = false;
      this.wordOxTextArray.forEach(word => word.element.nativeElement.style.backgroundColor = "#FFFFFF");
    }
  }
  focusPreparation = new Observable<number>();
  focusReadyToChange = new Observable<number>();

  @Input() componentInit!: {
    state: boolean
  };
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
  public firstHalfAnswer!: WordText[];
  public secondHalfAnswer!: WordText[];
  private currentIdParsed: number = parseFloat(this.currentId);
  public correctWithAccent:boolean = true;
  public alphabetArray: string[] = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMÑOPQRSTUVWXYZáéóíúÁÉÍÚÓ´".split('');
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
    this.firstHalfAnswer = Array.from({ length: this.beforeFirstHalfQuantity.length }, x => { return { txt: '', isHint: false } });
    this.secondHalfAnswer = Array.from({ length: this.afterFirstHalfQuantity.length }, x => { return { txt: '', isHint: false } });

  }




  ngAfterViewInit(): void {
    this.wordOxTextArray = this.wordOxTex.toArray();
    this.wordInputArray = this.wordInput.toArray();
    if (this.answerWord.id === 1) {
      this.updateFocus(0);
      this.containerOn = true;
    }
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


  private removeAccents(word:string): string[] {
    const answerStringNoAccent = word.normalize('NFD').replace(/[^\w]/g, '');;
    return answerStringNoAccent.split('');  
  }



  private answerIsCorrect(arr1:string[], arr2:string[]):void {
    if (equalArrays(arr1, arr2)) {
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



  answerCorrection() {
    if (this.answerWord.isComplete && !this.answerWord.isCorrect) {
      const concatAnswer: string[] = this.firstHalfAnswer.map(z => z.txt).concat(this.mainLetter).concat(this.secondHalfAnswer.map(y => y.txt));
      if(!this.correctWithAccent) {
        const answerString = concatAnswer.join('');
        const answerArrayNoAccent = this.removeAccents(answerString);
        const horizontalWordArrayNoAccent = this.removeAccents(this.answerWord.word.text);
        this.answerIsCorrect(answerArrayNoAccent, horizontalWordArrayNoAccent);
      } else {
        this.answerIsCorrect(concatAnswer, this.answerWordArray)
      }
    }
  }




  wordIsCompleteCheck() {
    if (this.wordForAnswer.every(word => word !== '')) {
      this.answerWord.isComplete = true;
      this.answerService.answerWordComplete.emit(true)
    } else {
      this.answerWord.isComplete = false;
      this.answerService.answerWordComplete.emit(false)
    }
  }



  public updateFocus(toIndex: number) {
    if (!this.answerWord.isCorrect) {
      this.wordOxTextArray.forEach(word => word.element.nativeElement.style.backgroundColor = "#FFFFFF")
      this.challengeService.wordHasBeenSelected.emit({ id: this.answerWord.id, definition: this.answerWord.description.text });
      this.containerOn = true;
      this.wordOxTextArray[toIndex].element.nativeElement.style.backgroundColor = '#FAFA33';
      this.wordInputArray[toIndex].nativeElement.focus();
      this.wordIsCompleteCheck()
    }
  }



  public updateFocusPart2(toIndex: number) {
    if (toIndex !== this.wordInputArray.length &&
      !this.answerWord.isComplete) {
      const squareToFocus = this.wordInputArray.slice(toIndex + 1);
      const adjustVariable = squareToFocus.findIndex(z => z.nativeElement.value === '');
      if (adjustVariable !== -1 && this.wordInputArray[toIndex].nativeElement.value !== '´') {
        const indexToFocus = this.wordInputArray.length - squareToFocus.length + adjustVariable;
        this.updateFocus(indexToFocus);
      } else {
        this.wordInputArray[toIndex].nativeElement.focus();
        this.wordIsCompleteCheck()
      }
    }
  }



  //CAMBIAR CHANGING RULES
  public write(event: InputEvent, i: number, stringArray: WordText[]): void {
    const inputIsAvaiable = this.alphabetArray.find(z => z === event.data);
    if (inputIsAvaiable) {
      if (stringArray[i].txt !== '') {
        stringArray[i].txt = event.data as string;
      }
    } else if (event.data === null) {
      stringArray[i].txt = '';
    } else {
      event.stopPropagation();
      event.preventDefault();
    }
  }


  public onFocus(i: number) {

  }



  //CAMBIAR CHANGING RULES



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
    return this.firstHalfAnswer.map(z => z.txt).concat(this.mainLetter).concat(this.secondHalfAnswer.map(o => o.txt));
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



  public hintAppearence() {
    const translateX = Array.from(Array(7).keys()).map((z, i) => {
      return { value: isEven(i) ? -6 : -2, duration: 200 };
    }).concat([{ value: -4, duration: 100 }]);
    const indexOfHintBeforeMain = this.findIndexForAnimation(this.firstHalfAnswer)
    const indexOfHintAfterMain = this.findIndexForAnimation(this.secondHalfAnswer);
    const indexToAnimate = indexOfHintBeforeMain !== undefined ? indexOfHintBeforeMain : (indexOfHintAfterMain as any) + this.firstHalfAnswer.length;
    anime({
      targets: this.wordOxTextArray[indexToAnimate].element.nativeElement,
      translateX,
      easing: 'easeInOutQuad'
    })
    anime({
      targets: this.wordOxTextArray[indexToAnimate].textInfo,
      color: ['#FFF', '#000'],
      duration: 1500,
      easing: 'linear',
      complete: () => {
        this.firstHalfAnswer.forEach(letter => letter.isHint = false);
        this.secondHalfAnswer.forEach(letter => letter.isHint = false)
      }
    })
  }



  findIndexForAnimation(array: WordText[]): number | undefined {
    return array.findIndex(a => a.isHint) === -1 ? undefined : array.findIndex(letter => letter.isHint)
  }


}
