import { CompileTemplateMetadata, isLoweredSymbol } from '@angular/compiler';
import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef, EventEmitter, Output, HostListener } from '@angular/core';
import { LoadedSvgComponent, SubscriberOxDirective } from 'micro-lesson-components';
import { HorizontalWord, HorizontalWordText, WordAnswer, WordPosition, WordSelectedEmitValues, WordText } from 'src/app/shared/types/types';
import { AnswerService, SoundOxService, GameActionsService, FeedbackOxService } from 'micro-lesson-core';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { AcrosticHintService } from 'src/app/shared/services/acrostic-hint.service';
import { HintService } from 'micro-lesson-core';
import { arrayAsSet, CorrectablePart, duplicateWithJSON, equalArrays, isEven, PartCorrectness, PartFormat, ScreenTypeOx, UserAnswer } from 'ox-types';
import anime from 'animejs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Observable, timer } from 'rxjs';
import { ActivationStart } from '@angular/router';

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



  @Output() componentInitEmit = new EventEmitter();
  @Input() exerciseWordArray!: string[];
  @Input() mainLetter!: string
  @Input() answerWord!: WordAnswer;
  @Input() init!: boolean;
  @Input() set currentId(value: string) {
    this.currentIdParsed = parseFloat(value);
    if (this.answerWord !== undefined && this.currentIdParsed !== this.answerWord.id && !this.answerWord.isCorrect) {
      this.containerOn = false;
      const answerComplete = this.firstHalfAnswer.concat(this.secondHalfAnswer);
      const indexFixedHint = answerComplete.map((letter, i) => i).filter(x => !answerComplete[x].fixed)
      indexFixedHint.forEach(i => this.wordOxTextArray[i].element.nativeElement.style.backgroundColor = "#FFFFFF")
    }
  }

  @Input() componentInit!: {
    state: boolean
  };
  @Input() correctionWithAccent!: boolean;
  @Input() answerLargerThan6!: boolean;
  @Input() hintQuantity!: {
    quantity: number
  }
  public answerWordArray!: string[];
  public beforeFirstHalfQuantity!: string[];
  public afterFirstHalfQuantity!: string[];
  public spaceToAddLeft!: number[];
  public spaceToAddRight!: number[];
  public wordOxTextArray!: any[];
  public wordInputArray!: any[];
  public containerOn!: boolean;
  public firstHalfAnswer!: WordText[];
  public secondHalfAnswer!: WordText[];
  private currentIdParsed: number = parseFloat(this.currentId);
  public alphabetArray: string[] = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMÑOPQRSTUVWXYZáéóíúÁÉÍÚÓ´".split('');
  public completeWordText!: WordText[];
  // 



  constructor(private answerService: AnswerService, private cdr: ChangeDetectorRef, private challengeService: AcrosticChallengeService
    , private soundService: SoundOxService,
    private feedbackService: FeedbackOxService, 
    public gameActions: GameActionsService<any>, public elementRef: ElementRef, private hintService: HintService) {
    super();

    this.addSubscription(this.gameActions.checkedAnswer, x => {
      if (this.containerOn && !this.answerWord.isCorrect) {
          this.answerCorrection()
      }
    })
    this.containerOn = false;
  }




  ngOnInit(): void {
    this.answerWordArray = this.answerWord.word.text.split('');
    this.beforeFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter, true);
    this.afterFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter, false);
    this.spaceToAddLeft = Array.from({ length: 6 - this.beforeFirstHalfQuantity.length }, (v, i) => i);
    this.spaceToAddRight = Array.from({ length: 6 - this.afterFirstHalfQuantity.length }, (v, i) => i);
    this.firstHalfAnswer = Array.from({ length: this.beforeFirstHalfQuantity.length }, x => { return { txt: '', isHint: false, fixed: false } });
    this.secondHalfAnswer = Array.from({ length: this.afterFirstHalfQuantity.length }, x => { return { txt: '', isHint: false, fixed: false } });
    this.completeWordText = this.firstHalfAnswer.concat(this.secondHalfAnswer);
  }





  ngAfterViewInit(): void {
    this.wordOxTextArray = this.wordOxTex.toArray();
    this.wordInputArray = this.wordInput.toArray();
    if (this.answerWord.id === 1) {
      this.updateFocus(0);
      this.containerOn = true;
    }
    this.init = false;
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




  private removeAccents(word: string): string[] {
    const answerStringNoAccent = word.normalize('NFD').replace(/[^\w]/g, '');;
    return answerStringNoAccent.split('');
  }




  private answerIsCorrect(arr1: string[], arr2: string[]): void {
    if (equalArrays(arr1, arr2)) {
      this.correctAnswerAnimation(() => this.feedbackService.endFeedback.emit());
    } else {
      this.wrongAnswerAnimation();
    }
  }




  answerCorrection() {
    if (this.answerWord.isComplete && !this.answerWord.isCorrect) {
      const concatAnswer: string[] = this.firstHalfAnswer.map(z => z.txt).concat(this.mainLetter).concat(this.secondHalfAnswer.map(y => y.txt));
      if (!this.correctionWithAccent) {
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
      this.gameActions.actionToAnswer.emit();
    } else {
      this.answerWord.isComplete = false;
      this.gameActions.actionToAnswer.emit()
    }
  }




  public updateFocus(toIndex: number) {
    if (!this.answerWord.isCorrect && !this.completeWordText[toIndex].fixed) {
      this.focusRestore(toIndex);
      this.containerOn = true;
      this.letterToCorrectablePart();
      if (!this.init) {
        this.soundService.playSoundEffect('sounds/selectedInput.mp3', ScreenTypeOx.Game)
      }
    } else {
      this.soundService.playSoundEffect('sounds/cantClick.mp3', ScreenTypeOx.Game);
    }
  }




  public updateFocusPart2(toIndex: number) {
    this.soundService.playSoundEffect('sounds/keypressOk.mp3', ScreenTypeOx.Game)
    if (toIndex !== this.wordInputArray.length || this.completeWordText[toIndex].txt !== "") {
      const squareToFocus = this.wordInputArray.slice(toIndex + 1);
      const adjustVariable = squareToFocus.findIndex(z => z.nativeElement.value === '');
      if (adjustVariable !== -1 && this.wordInputArray[toIndex].nativeElement.value !== '´') {
        const indexToFocus = this.wordInputArray.length - squareToFocus.length + adjustVariable;
        this.focusRestore(indexToFocus);
      } else {
        this.focusRestore(toIndex);
      }
    }
  }





  private focusRestore(i: number) {
    this.challengeService.wordHasBeenSelected.emit(this.answerWord);
    const fixedHints = this.completeWordText.map(letter => letter.fixed);
    this.wordOxTextArray.forEach((word, t) => {
      if (!fixedHints[t]) {
        word.element.nativeElement.style.backgroundColor = "#FFFFFF"
      }
    })
    if(!fixedHints[i]) {
      this.wordOxTextArray[i].element.nativeElement.style.backgroundColor = '#FAFA33';
      this.wordInputArray[i].nativeElement.focus();
    } else {
      this.soundService.playSoundEffect('sounds/cantClick.mp3', ScreenTypeOx.Game);
      return
    }
  }




  public letterToCorrectablePart(): void {
    const concatInputAnswer = duplicateWithJSON(this.answerWordArray);
    concatInputAnswer.splice(this.firstHalfAnswer.length, 1);
    const correctablePart = concatInputAnswer.map((word, i) => {
      return {
        correctness: word === this.wordInputArray[i].nativeElement.value ? 'correct' : 'wrong',
        parts: [
          {
            format: 'word-text' as PartFormat,
            value: this.wordInputArray[i].nativeElement.value as string
          }]
      }
    })
   
    this.answerService.currentAnswer = {
      parts: correctablePart as CorrectablePart[]
    }

    this.wordIsCompleteCheck();
    this.challengeService.wordHasBeenSelected.emit(this.answerWord);

  }





  //CAMBIAR CHANGING RULES
  public write(event: InputEvent, i: number, stringArray: WordText[]): void {
    const inputIsAvaiable = this.alphabetArray.find(z => z === event.data);
    if (inputIsAvaiable) {
      if (stringArray[i].txt !== '' && stringArray[i].txt !== '´') {
        stringArray[i].txt = '';
      }
    }
    else if (event.data === null) {
      stringArray[i].txt = '';
      this.soundService.playSoundEffect('sounds/keypressOk.mp3', ScreenTypeOx.Game)
    } else {
      event.stopPropagation();
      event.preventDefault();
    }
  }



  //CAMBIAR CHANGING RULES

  correctAnswerAnimation(gameAction: () => void) {
    this.soundService.playSoundEffect('sounds/rightAnswer.mp3', ScreenTypeOx.Game);
    this.answerWord.isCorrect = true
    this.answerWord.isComplete = false
    const restoreAnimation = {
      scale: '1',
      translateY: '0vh',
      easing: 'easeOutExpo'
    }
    const keyframesSquare = [{
      scale: '1.08',
      translateY: '-1.5vh',
      easing: 'easeOutExpo'
    },
      restoreAnimation
    ]
    const keyframes = [{
      scale: '1.08',
      translateY: '-1.5vh',
      translateX: '-0.5vh',
      easing: 'easeOutExpo'
    },
      restoreAnimation
    ]
    anime({
      targets: [this.wordOxTextArray.map(oxText => oxText.element.nativeElement)],
      delay: anime.stagger(150, { start: 300 }),
      backgroundColor: '#0FFF50',
      keyframes
    })
    anime({
      targets: [this.squareImage0.map(square => square.elementRef.nativeElement), this.squareImage2.map(square => square.elementRef.nativeElement)],
      delay: anime.stagger(150, { start: 300 }),
      keyframesSquare,
      complete: () => {
      gameAction(); 
      }
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
        duration: 550,
        loop:2,
        direction:'alternate',
        keyframes: [{
          backgroundColor: '#FF2D00'
        }],
        easing: 'linear',
        complete: () => {
          this.selectInputAfterAnimation()
          this.feedbackService.endFeedback.emit()
        }
      })
  }


  private selectInputAfterAnimation():void {
    const indexToFocus = this.wordOxTextArray.findIndex(oxText => oxText.element.nativeElement.style.backgroundColor === 'rgb(250, 250, 51)');
    if(indexToFocus !== -1) {
      this.wordInputArray[indexToFocus].nativeElement.focus();
    }
  }



  public hintAppearence() {
    this.soundService.playSoundEffect('sounds/hint.mp3', ScreenTypeOx.Game)
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
      targets: this.wordOxTextArray[indexToAnimate].element.nativeElement,
      backgroundColor: ['#FFF', '#0FFF50'],
      duration: 1500,
      easing: 'linear',
      complete: () => {
        (this.firstHalfAnswer as any).concat(this.secondHalfAnswer as any).find((word: { isHint: boolean; }) => word.isHint).fixed = true;
        this.firstHalfAnswer.forEach(letter => letter.isHint = false);
        this.secondHalfAnswer.forEach(letter => letter.isHint = false);
        this.letterToCorrectablePart();
        this.selectInputAfterAnimation();
      }
    })

  }



  findIndexForAnimation(array: WordText[]): number | undefined {
    return array.findIndex(a => a.isHint) === -1 ? undefined : array.findIndex(letter => letter.isHint)
  }



}
