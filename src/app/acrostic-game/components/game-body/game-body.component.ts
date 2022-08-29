import { Component, OnInit, ViewChildren, AfterViewInit, QueryList, ViewChild, ElementRef } from '@angular/core';
import {
  EndGameService,
  FeedbackOxService,
  GameActionsService,
  HintService,
  MicroLessonMetricsService,
  SoundOxService
} from 'micro-lesson-core';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { ExerciseOx } from 'ox-core';
import { anyElement, duplicateWithJSON, ExerciseData, MultipleChoiceSchemaData, OptionShowable, OxImageInfo, ScreenTypeOx, Showable } from 'ox-types';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticHintService } from 'src/app/shared/services/acrostic-hint.service';
import { AcrosticExercise, HintInfo, HorizontalWord, WordAnswer, WordText } from 'src/app/shared/types/types';
import { FooterComponent, SubscriberOxDirective } from 'micro-lesson-components';
import { MainLetterComponent } from '../main-letter/main-letter.component';
import anime from 'animejs';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { timer } from 'rxjs';


@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})
export class GameBodyComponent extends SubscriberOxDirective implements OnInit {

  @ViewChildren(MainLetterComponent) mainLetterComponent!: QueryList<MainLetterComponent>;
  @ViewChild(FooterComponent) footer!: FooterComponent;


  public exerciseWord!: string;
  public exerciseWordArray!: string[];
  public horizontalWords: WordAnswer[] = [];

  wordIsComplete: boolean = false;
  public currentWordId!: string;
  public currentWordDefinition!: string;
  public inputInteractable!: boolean;
  private mainLetterComponentArray!: any[];
  public countDownImageInfo: OxImageInfo | undefined;
  public exercise!: AcrosticExercise;
  public hintAvaible!: boolean;
  public currentDescriptionAudio:string = '';
  public hintInfo: HintInfo = {
    index: 0,
    isComplete: false
  }
  public componentsInit: {
    state: boolean
  }[] = [];
  public hintQuantity: {
    quantity: number
  }[] = [];
  public correctionWithAccent!: boolean;
  public answerLargerThan6!: boolean;
  public init: boolean = true;
  
  constructor(private challengeService: AcrosticChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private endService: EndGameService,
    private feedbackService: FeedbackOxService,
    private answerService: AcrosticAnswerService,
  ) {
    super()
    this.feedbackService.playFeedBackSounds = false;
    this.hintService.usesPerChallenge = 0;
    this.addSubscription(this.feedbackService.endFeedback.pipe(withLatestFrom(this.gameActions.checkedAnswer)), params => {
      if (params[1].correctness === 'correct') {
        console.log('Sending show next challange')
        timer(100).subscribe(z => {
          if (!endService.gameIsEnded())
            this.gameActions.showNextChallenge.emit();
        });
      }
    });
    this.addSubscription(this.challengeService.wordHasBeenSelected, info => {
      this.currentWordId = info.id + '';
      this.currentWordDefinition = info.description.text;
      this.currentDescriptionAudio = info.description.audio;
      console.log(this.currentDescriptionAudio)
      this.hintService.usesPerChallenge = this.hintQuantity[info.id - 1].quantity + this.hintService.currentUses;
      this.hintService.checkHintAvailable();
    })
    this.addSubscription(this.gameActions.surrender, surr => {
      this.surrender();
    })
    this.hintService.checkValueOnShowNextChallenge = false;
    this.addSubscription(this.challengeService.currentExercise.pipe(filter(x => x !== undefined)),
      (exercise: ExerciseOx<AcrosticExercise>) => {
        if (this.metricsService.currentMetrics.expandableInfo?.exercisesData.length as number > 0) {
          // this.restartAnimation();
          // this.hintService.hintAvailable.next(false);
          return;
        }
        console.log('OTRO EJERCICIOS  ');
        this.addMetric();
        this.exercise = exercise.exerciseData;
        this.exerciseWord = exercise.exerciseData.verticalWord.text;
        this.exerciseWordArray = this.exerciseWord.split('');
        this.horizontalWordGenerator();
        this.hintService.usesPerChallenge = exercise.exerciseData.hintQuantity;
        this.hintQuantity = [];
        this.exerciseWordArray.forEach((word, i) => {
          this.hintQuantity.push({
            quantity: +exercise.exerciseData.hintQuantity
          })
          this.componentsInit.push({
            state:false
          })
        }
        );
        this.correctionWithAccent = exercise.exerciseData.correctionWithAccent;
        this.currentWordId = 1 + '';
        this.currentWordDefinition = this.horizontalWords[0].description.text;
        this.answerLargerThan6 = this.exerciseWordArray.length > 6 ? true : false;
        this.mainLetterComponent.forEach(comp => {
         comp.answerWord.isComplete = false;
         comp.answerWord.isCorrect = false;
         comp.firstHalfAnswer.forEach(word => {
           word.txt = '';
           word.fixed = false;
           word.isHint = false;
          })
          comp.secondHalfAnswer.forEach(word => {
            word.txt = '';
            word.fixed = false;
            word.isHint = false;
           })
           comp.wordOxTextArray.forEach(oxText => {
             oxText.element.nativeElement.style.backgroundColor = '#FFFFFF';
           })
        })
        this.restoreDomElements();
        this.startGame();
      
      });
    this.addSubscription(this.gameActions.showHint, x => {
      this.showHint();
    })
    this.addSubscription(this.challengeService.nextWordSelection, id => {
      if(id) {
        this.mainLetterComponentArray[id].containerOn = true;
        const inputToSelect = this.mainLetterComponentArray[id].firstHalfAnswer.concat(this.mainLetterComponentArray[id].secondHalfAnswer).findIndex((letter: { txt: string; }) => letter.txt === '');
        this.mainLetterComponentArray[id].updateFocus(inputToSelect);
        this.footer.forceNoNextButton = true;
        this.footer.tryVisible = true;
      } 
    })
    this.addSubscription(this.challengeService.horizontalWordToArray, x => {
      this.mainLetterComponentArray = this.mainLetterComponent.toArray();
    } )
  }



  ngOnInit(): void {
  }



  ngAfterViewInit(): void {
   
  }



  startGame() {
    anime({
      targets: '.button-menu',
      duration: 1000,
      easing: 'easeInOutExpo',
      translateY: ['0', '-14vh'],
      complete: () => anime({
        targets: this.mainLetterComponent.map(comp => comp.elementRef.nativeElement),
        delay: anime.stagger(250),
        scale: [0, 1],
        begin: () => anime({
          targets: ['.indicator-container', '.explanation-container'],
          delay: 250 * (this.exerciseWordArray.length + 1),
          duration: 1000,
          translateY: ['-18vh', '0'],
          complete: () => {
           this.challengeService.horizontalWordToArray.emit();
          }
        })
      })
    });
  }




  restoreDomElements() {
    anime({
      targets: '.button-menu',
      duration: 0,
      translateY: ['-14vh', '0'],
    });
    anime({
      targets: this.mainLetterComponent.map(comp => comp.elementRef.nativeElement),
      duration: 0,
      scale: [1, 0]
    });
    anime({
      targets: ['.indicator-container', '.explanation-container'],
      duration: 0,
      translateY: [ '0vh', '-18vh']
    })
  }




  public tryAnswer() {
    this.answerService.tryAnswer.emit();
  }



  public mainLetterCompToArray() {
    if (this.componentsInit.every(comp => comp.state)) {
    }
  }



  public playLoadedSound(sound: string) {
    this.soundService.playSoundEffect(sound, ScreenTypeOx.Game);
  }




  horizontalWordGenerator(): void {
    this.exercise?.horizontalWord.word.forEach((word, i) => {
      this.horizontalWords.push({
        id: i + 1,
        word: this.exercise.horizontalWord.word[i],
        isComplete: false,
        isCorrect: false,
        description: this.exercise.horizontalWord.description[i]
      })
    })
  }



  public showHint() {
    const selectedWord = this.mainLetterComponent.find(word => word.containerOn && !word.answerWord.isCorrect);
    const wordIndex = this.exercise.horizontalWord.word.findIndex(word => word.text === selectedWord?.answerWord.word.text);
    const wordOptionsArray = selectedWord?.firstHalfAnswer.concat(selectedWord.secondHalfAnswer) as WordText[];
    const wordAnswerArrayDuplicate = duplicateWithJSON(selectedWord?.answerWordArray);
    (wordAnswerArrayDuplicate as string[]).splice((selectedWord as any).firstHalfAnswer.length, 1) as string[];
    let indexToAdd = 0;
    const emptyIndex = wordOptionsArray.map((x, i) => i).filter(index => wordOptionsArray[index].txt === "");
    indexToAdd = emptyIndex?.length !== 0 ? anyElement(emptyIndex as any) : anyElement(wordOptionsArray.map((x, i) => i).filter(index => !wordOptionsArray[index].fixed) as number[]);
    console.log(indexToAdd);
    if (this.hintQuantity[wordIndex].quantity > 0) {
      this.hintQuantity[wordIndex].quantity--;
      if (indexToAdd as number < (selectedWord as any).firstHalfAnswer.length) {
        (selectedWord as any).firstHalfAnswer[indexToAdd as number].txt = (wordAnswerArrayDuplicate as string[])[indexToAdd as number];
        (selectedWord as any).firstHalfAnswer[indexToAdd as number].isHint = true;
      } else {
        (selectedWord as any).secondHalfAnswer[indexToAdd as number - (selectedWord as any).firstHalfAnswer.length].txt = (wordAnswerArrayDuplicate as string[])[indexToAdd as number];
        (selectedWord as any).secondHalfAnswer[indexToAdd as number - (selectedWord as any).firstHalfAnswer.length].isHint = true;
      }
      selectedWord?.hintAppearence();
    }
  }



  private surrender() {
    const selectedWord = this.mainLetterComponent.find(word => word.containerOn && !word.answerWord.isCorrect);
    const firstPartAns = selectedWord?.answerWordArray.slice(0, selectedWord.firstHalfAnswer.length);
    const secondPartAns = selectedWord?.answerWordArray.slice(selectedWord.firstHalfAnswer.length + 1, selectedWord.answerWordArray.length);
    selectedWord?.firstHalfAnswer.map((letter, i) => letter.txt = (firstPartAns as string[])[i]);
    selectedWord?.secondHalfAnswer.map((letter, i) => letter.txt = (secondPartAns as string[])[i]);
    selectedWord?.correctAnswerAnimation(() => this.feedbackService.surrenderEnd.emit());
  }





  onCountDownTimeUpdated() {
    this.soundService.playSoundEffect('sounds/bubble01.mp3', ScreenTypeOx.Game);
  }


  private addMetric(): void {
    const myMetric: ExerciseData = {
      schemaType: 'multiple-choice',
      schemaData: {

      } as MultipleChoiceSchemaData,
      userInput: {
        answers: [],
        requestedHints: 0,
        surrendered: false
      },
      finalStatus: 'to-answer',
      maxHints: 1,
      secondsInExercise: 0,
      initialTime: new Date(),
      finishTime: undefined as any,
      firstInteractionTime: undefined as any
    };
    this.addSubscription(this.gameActions.actionToAnswer.pipe(take(1)), z => {
      myMetric.firstInteractionTime = new Date();
    });
    this.addSubscription(this.gameActions.checkedAnswer.pipe(take(1)),
      z => {
        myMetric.finishTime = new Date();
        console.log('Finish time');
      });
    this.metricsService.addMetric(myMetric as ExerciseData);
    // this.metricsService.currentMetrics.exercises++;
  }
}
