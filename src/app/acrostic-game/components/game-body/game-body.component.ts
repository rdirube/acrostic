import { Component, OnInit, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import {
  FeedbackOxService,
  GameActionsService,
  HintService,
  MicroLessonMetricsService,
  SoundOxService
} from 'micro-lesson-core';
import { AcrosticChallengeService } from 'src/app/shared/services/acrostic-challenge.service';
import {ExerciseOx} from 'ox-core';
import {ExerciseData, MultipleChoiceSchemaData, OptionShowable, ScreenTypeOx, Showable} from 'ox-types';
import { AcrosticAnswerService } from 'src/app/shared/services/acrostic-answer.service';
import { WordAnswer } from 'src/app/shared/types/types';
import { SubscriberOxDirective } from 'micro-lesson-components';
import { MainLetterComponent } from '../main-letter/main-letter.component';
import { CompileReflector } from '@angular/compiler';

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})
export class GameBodyComponent extends SubscriberOxDirective implements OnInit {

  @ViewChildren(MainLetterComponent) mainLetterComponent!: QueryList <MainLetterComponent> ;


  public exerciseWord:string = 'celular';
  public exerciseWordArray:string[] = this.exerciseWord.split('');
  public answerWordTest:WordAnswer[] = [{id:1, word:'masticar', isComplete:false,isSelected:false,isCorrect:false, definition:'Aplastar o triturar algo en la boca con los dientes para extraer su jugo o sabor o para ser tragado.'}, {id:2,word:'mesa', isComplete:false,isSelected:false,isCorrect:false, definition:'Mueble formado por un tablero horizontal, sostenido por uno o varios pies, con la altura conveniente para poder realizar alguna actividad sobre ella o dejar cosas encima'},{ id:3,word:'sillon', isComplete:false,isSelected:false, isCorrect:false,definition:'Asiento individual con brazos y respaldo que suele ser mullido, bastante grande y generalmente cómodo'}
   ,{ id:4,
    word:'enchufe', isComplete:false, isSelected:false, isCorrect:false,definition:'Pieza de material aislante con dos o tres salientes metálicos que sirve para conectar un aparato a la red eléctrica'
  }, {id:5, word:'melon',isComplete:false, isSelected:false, isCorrect:false, definition:'Planta de tallos trepadores y rastreros, hojas lobuladas, flores solitarias, de color amarillo y fruto grande y comestible'},{id:6, word:'pared',isComplete:false,isSelected:false,isCorrect:false, definition:'Construcción de superficie continua, levantada perpendicular al suelo, con las dimensiones adecuadas para cerrar o dividir un espacio, sostener una techumbre o proteger una zona'}, {id:7, word:'morado',isComplete:false,isSelected:false,isCorrect:false, definition:'Color violeta oscuro, como el del jugo de las moras o como la piel de las berenjenas'},{id:8, word:'morado',isComplete:false,isSelected:false,isCorrect:false, definition:'Color violeta oscuro, como el del jugo de las moras o como la piel de las berenjenas'}];
  public wordIsComplete:boolean = false;
  public currentWordId!:string;
  public currentWordDefinition!:string;
  public inputInteractable!:boolean;
  private mainLetterComponentArray!:any[];


  constructor(private challengeService: AcrosticChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private feedbackService: FeedbackOxService,
    private answerService:AcrosticAnswerService) { 
      super()
      this.addSubscription(this.answerService.answerWordComplete, x => {
        if(this.mainLetterComponentArray.some(comp => comp.answerWord.isComplete)) {
          this.wordIsComplete = true;
        } else {
          this.wordIsComplete = false;
        }
      })
      this.addSubscription(this.challengeService.wordHasBeenSelected, d => {
        this.currentWordId = d.id + '';
        this.currentWordDefinition = d.definition;
      })
    }




  ngOnInit(): void {
    this.answerWordTest[0].isSelected = true;
    this.currentWordId = 1 + '';
    this.currentWordDefinition = this.answerWordTest[0].definition;
  }


  ngAfterViewInit(): void {
    this.mainLetterComponentArray = this.mainLetterComponent.toArray();
    this.mainLetterComponentArray[0].focusInput(0);
  }



  public tryAnswer() {
    this.answerService.checkedAnswer.emit();
  }
 

  public erraseAllSelectedInput() {
   const incompleteAnswers = this.mainLetterComponent.filter(comp => !comp.answerWord.isCorrect);
   incompleteAnswers.forEach(ans => ans.wordInputArray.forEach(input => input.nativeElement.style.backgroundColor = '#FFFFFF'));
   incompleteAnswers.forEach(ans => ans.containerOn = false);
  }


}
