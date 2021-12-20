import { Injectable, EventEmitter } from '@angular/core';
import {
  AppInfoOxService,
  ChallengeService,
  FeedbackOxService,
  GameActionsService,
  LevelService,
  SubLevelService
} from 'micro-lesson-core';
import { ExerciseOx, PreloaderOxService } from 'ox-core';
import { ExpandableInfo } from 'ox-types';
import { WordSelectedEmitValues } from '../types/types';
@Injectable({
  providedIn: 'root'
})


export class AcrosticChallengeService extends ChallengeService <any,any> {

  wordHasBeenSelected = new EventEmitter<WordSelectedEmitValues>()

  protected generateNextChallenge(subLevel: number): ExerciseOx<any> {
    throw new Error('Method not implemented.');
  }
  protected equalsExerciseData(exerciseData: any, exerciseDoneData: any): boolean {
    throw new Error('Method not implemented.');
  }
  getMetricsInitialExpandableInfo(): ExpandableInfo {
    throw new Error('Method not implemented.');
  }

  constructor(gameActionsService: GameActionsService<any>, private levelService: LevelService,
    subLevelService: SubLevelService,
    private preloaderService: PreloaderOxService,
    private feedback: FeedbackOxService,
    private appInfo: AppInfoOxService) {
      super(gameActionsService, subLevelService, preloaderService)
     }

}
