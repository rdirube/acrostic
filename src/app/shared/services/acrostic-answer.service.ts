import { EventEmitter, Injectable } from '@angular/core';
import { AnswerService, GameActionsService, MicroLessonMetricsService } from 'micro-lesson-core';
import { UserAnswer } from 'ox-types';
import { AcrosticChallengeService } from './acrostic-challenge.service';


@Injectable({
  providedIn: 'root'
})
export class AcrosticAnswerService extends AnswerService {
  protected isValidAnswer(answer: UserAnswer): boolean {
    return this.currentAnswer.parts.every(part => part.parts.every(part => part.value !== ''))
  }


  answerWordComplete = new EventEmitter<boolean>();
  answerForCorrection = new EventEmitter();

  constructor(private gameActionsService: GameActionsService<any>,
    m: MicroLessonMetricsService<any>,
    private challenge: AcrosticChallengeService) {
      super(gameActionsService, m)

      this.gameActionsService.showNextChallenge.subscribe(value => {
        this.cleanAnswer();
      });
      this.gameActionsService.finishedTimeOfExercise.subscribe(() => {
        console.log('finishedTimeOfExercise');
        this.onTryAnswer();
      });
     }

     public cleanAnswer(): void {
      this.currentAnswer = { parts: [] };
    }



}
