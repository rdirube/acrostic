import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})
export class GameBodyComponent extends SubscriberOxDirective implements OnInit {

  public testWord:string = 'hola';
  public testWordArray:string[] = this.testWord.split('');
  public answerWordTest:WordAnswer[] = [{id:1, word:'rechazo', isComplete:false,isSelected:false,isCorrect:false, definition:'Mostrarse [una persona] en contra de algo que se le ofrece o propone.'}, {id:2,word:'jocoso', isComplete:false,isSelected:false,isCorrect:false, definition:'Que contiene, implica o denota una mezcla de broma y burla.'},{ id:3,word:'melena', isComplete:false,isSelected:false, isCorrect:false,definition:'Cabello suelto, especialmente el que cae sobre los hombros sin recoger ni trenzar'}
   ,{ id:4,
    word:'lampara', isComplete:false, isSelected:false, isCorrect:false,definition:'Utensilio que proporciona luz artificialmente'
  }];
  public wordIsComplete:boolean = false;
  public currentWordId!:string;
  public currentWordDefinition!:string;
  public inputInteractable!:boolean;
 
  constructor(private challengeService: AcrosticChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private feedbackService: FeedbackOxService,
    private answerService:AcrosticAnswerService) { 
      super()
      console.log(this.testWordArray);
      this.addSubscription(this.answerService.answerWordComplete, x => {
        this.wordIsComplete = true;
      })
      this.addSubscription(this.answerService.answerWordIncomplete, x => {
        this.wordIsComplete = false;
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



  public tryAnswer() {
    this.answerService.checkedAnswer.emit();
  }
 


}
