import { Component, OnInit, ViewChildren, AfterViewInit, QueryList, ViewChild, ElementRef } from '@angular/core';
import {
  FeedbackOxService,
  GameActionsService,
  HintService,
  MicroLessonMetricsService,
  SoundOxService,
  
} from 'micro-lesson-core';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import { ExerciseOx } from 'ox-core';
import { anyElement, ExerciseData, MultipleChoiceSchemaData, OptionShowable, OxImageInfo, ScreenTypeOx, Showable } from 'ox-types';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { AcrosticHintService } from 'src/app/shared/services/acrostic-hint.service';
import { AcrosticExercise, HintInfo, HorizontalWord, WordAnswer } from 'src/app/shared/types/types';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { MainLetterComponent } from '../main-letter/main-letter.component';
import { CompileReflector } from '@angular/compiler';
import anime from 'animejs';
import { filter, take } from 'rxjs/operators';
import { timer } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})
export class GameBodyComponent extends SubscriberOxDirective implements OnInit {

  @ViewChildren(MainLetterComponent) mainLetterComponent!: QueryList<MainLetterComponent>;

  public exerciseWord!: string;
  public exerciseWordArray!: string[];
  //
  public horizontalWords: WordAnswer[] = [];
  //= [{ id: 1, word: 'masticaropi', isComplete: false,  isCorrect: false, definition: 'Aplastar o triturar algo en la boca con los dientes para extraer su jugo o sabor o para ser tragado.' }, { id: 2, word: 'mesa', isComplete: false,  isCorrect: false, definition: 'Mueble formado por un tablero horizontal, sostenido por uno o varios pies, con la altura conveniente para poder realizar alguna actividad sobre ella o dejar cosas encima' }, { id: 3, word: 'sillon', isComplete: false,  isCorrect: false, definition: 'Asiento individual con brazos y respaldo que suele ser mullido, bastante grande y generalmente cómodo' }
  //   , {
  //   id: 4,
  //   word: 'enchufe', isComplete: false,  isCorrect: false, definition: 'Pieza de material aislante con dos o tres salientes metálicos que sirve para conectar un aparato a la red eléctrica'
  // }, { id: 5, word: 'melon', isComplete: false,  isCorrect: false, definition: 'Planta de tallos trepadores y rastreros, hojas lobuladas, flores solitarias, de color amarillo y fruto grande y comestible' }, { id: 6, word: 'pared', isComplete: false,  isCorrect: false, definition: 'Construcción de superficie continua, levantada perpendicular al suelo, con las dimensiones adecuadas para cerrar o dividir un espacio, sostener una techumbre o proteger una zona' }, { id: 7, word: 'morado', isComplete: false,  isCorrect: false, definition: 'Color violeta oscuro, como el del jugo de las moras o como la piel de las berenjenas' }, { id: 8, word: 'morado', isComplete: false,  isCorrect: false, definition: 'Color violeta oscuro, como el del jugo de las moras o como la piel de las berenjenas' }]; 
  wordIsComplete: boolean = false;
  public currentWordId!: string;
  public currentWordDefinition!: string;
  public inputInteractable!: boolean;
  private mainLetterComponentArray!: any[];
  public countDownImageInfo: OxImageInfo | undefined;
  public exercise!: AcrosticExercise;
  public hintAvaible!:boolean;
  public hintInfo:HintInfo = {
    index:0,
    isComplete:false
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
    private feedbackService: FeedbackOxService,
    private answerService: AcrosticAnswerService,
    ) {
    super()
    this.hintService.usesPerChallenge = 0;
    this.addSubscription(this.challengeService.wordHasBeenSelected, info => {
      this.currentWordId = info.id + '';
      this.currentWordDefinition = info.description.text;
      this.hintService.usesPerChallenge  =  this.hintQuantity[info.id - 1].quantity + this.hintService.currentUses;
      this.hintService.checkHintAvailable();
      // uses perhintService challenge da undefined
      console.log(this.hintService.currentUses);
      console.log(this.hintService.usesPerChallenge);
    })
    this.addSubscription(this.challengeService.currentExercise.pipe(filter(x => x !== undefined)),
      (exercise: ExerciseOx<AcrosticExercise>) => {
        console.log('OTRO EJERCICIOS  ');
        this.addMetric();
        this.exercise = exercise.exerciseData;
        this.exerciseWord = exercise.exerciseData.verticalWord.text;
        this.exerciseWordArray = this.exerciseWord.split('');
        this.horizontalWordGenerator();
        this.hintService.usesPerChallenge = exercise.exerciseData.hintQuantity;
        this.exerciseWordArray.forEach((word, i) => {
          this.componentsInit.push({
            state: false
          });
          this.hintQuantity.push({
            quantity: +exercise.exerciseData.hintQuantity
          })
        }
        );
        this.correctionWithAccent = exercise.exerciseData.correctionWithAccent;
        this.currentWordId = 1 + '';
        this.currentWordDefinition = this.horizontalWords[0].description.text;
        this.answerLargerThan6 = this.exerciseWordArray.length > 6 ? true : false;
        this.startGame();
      });
      this.addSubscription(this.gameActions.showHint, x => {
        this.showHint();
      })
      
  }



  ngOnInit(): void {
    console.log("body-component")
  }



  ngAfterViewInit(): void {
  }



  startGame() {
    anime({
      targets: '.button-menu',
      duration: 1200,
      keyframes: [{
        translateY: '0',
      }, {
        translateY: '-14vh',
        easing: 'easeInOutExpo'
      }
      ],
      complete: () => anime({
        targets: this.mainLetterComponent.map(comp => comp.elementRef.nativeElement),
        delay: anime.stagger(250),
        scale: [0, 1],
        begin: () => anime({
          targets: ['.indicator-container', '.explanation-container'],
          delay: 250 * (this.exerciseWordArray.length - 3),
          duration: 1700,
          keyframes: [{
            translateY: '-18vh',
          },
          {
            translateY: '0vh',
          }
          ]
        })
      })
    });
    anime({
      targets: '.button-hint',
      duration: 1200,
      keyframes: [{
        translateX: '13vh',
      }, {
        translateX: '0vh',
        easing: 'easeInOutExpo'
      }
      ]
    })
    anime({
      targets: ['.game-element', '.disable-element'],
      duration: 1200,
      keyframes: [{
        translateY: '0vh',
      }, {
        translateY: '-16vh',
        easing: 'easeInOutExpo'
      }
      ]
    })
    // anime({
    //   targets: this.mainLetterComponent.map(comp => comp.elementRef.nativeElement),
    //   delay: anime.stagger(250, { start: 300 }),
    //   scale:[0,1],
    //   easing:'easeInOutExpo' 
    // }) 
  }


  public tryAnswer() {
    this.answerService.tryAnswer.emit();
  }


  public mainLetterCompToArray() {
    if (this.componentsInit.every(comp => comp.state)) {
      this.mainLetterComponentArray = this.mainLetterComponent.toArray();
    }
  }


  public updateHintIndexAndState(info:HintInfo):void {
    this.hintInfo.index = info.index;
    this.hintInfo.isComplete = info.isComplete
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
    const wordIndex = this.exercise.horizontalWord.word.findIndex(word => word === selectedWord?.answerWord.word);
    const emptyIndex = selectedWord?.answerWordArray.map((letter, i) => i).filter(index => selectedWord.wordForAnswer[index] === '');
    if(!selectedWord?.answerWord.isComplete && this.hintQuantity[wordIndex].quantity > 0) {
    this.hintQuantity[wordIndex].quantity --;
    const indexToAdd = anyElement(emptyIndex as any);
    if (indexToAdd as number <= (selectedWord as any).firstHalfAnswer.length) {
      (selectedWord as any).firstHalfAnswer[indexToAdd as number].txt = selectedWord?.answerWordArray[indexToAdd as number];
      (selectedWord as any).firstHalfAnswer[indexToAdd as number].isHint = true;
    } else {
      (selectedWord as any).secondHalfAnswer[indexToAdd as number - (selectedWord as any).firstHalfAnswer.length - 1].txt = selectedWord?.answerWordArray[indexToAdd as number];
      (selectedWord as any).secondHalfAnswer[indexToAdd as number - (selectedWord as any).firstHalfAnswer.length - 1].isHint = true;
    }
    selectedWord?.hintAppearence();

  }
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
    this.metricsService.currentMetrics.exercises++;
  }
}
