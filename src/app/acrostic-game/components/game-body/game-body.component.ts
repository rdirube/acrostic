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

@Component({
  selector: 'app-game-body',
  templateUrl: './game-body.component.html',
  styleUrls: ['./game-body.component.scss']
})
export class GameBodyComponent implements OnInit {

  public testWord:string = 'hola';
  public testWordArray:string[] = this.testWord.split('');
  public answerWordTest:string[] = ['rechazo', 'jocoso', 'melena','lampara'];


  constructor(private challengeService: AcrosticChallengeService,
    private metricsService: MicroLessonMetricsService<any>,
    private gameActions: GameActionsService<any>,
    private hintService: HintService,
    private soundService: SoundOxService,
    private feedbackService: FeedbackOxService,
    private answerService:AcrosticAnswerService) { 
      console.log(this.testWordArray);
    }

  ngOnInit(): void {
  }



}
