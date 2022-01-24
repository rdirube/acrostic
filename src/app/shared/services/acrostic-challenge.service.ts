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
import { AcrosticExercise, HorizontalWordText, WordSelectedEmitValues } from '../types/types';
import { AcrosticNivelation } from '../types/types';


@Injectable({
  providedIn: 'root'
})


export class AcrosticChallengeService extends ChallengeService<any, any> {

  wordHasBeenSelected = new EventEmitter<WordSelectedEmitValues>()
  public exerciseConfig!: AcrosticNivelation;


  protected generateNextChallenge(subLevel: number): ExerciseOx<AcrosticExercise> {
    const horizontalWordText:HorizontalWordText[] = [];
    this.exerciseConfig.horizontalWord.word.forEach(word => {
    horizontalWordText.push({
        text: word.word1 + word.mainLetter + word.word2,
        audio: word.audio
      })
    })
    return new ExerciseOx(
      {
        verticalWord: this.exerciseConfig.verticalWord,
        horizontalWord: {
          word: horizontalWordText,
          description: this.exerciseConfig.horizontalWord.description
        }

      } as AcrosticExercise, 1, {
      maxTimeToBonus: 0,
      freeTime: 0
    }, []);

    throw new Error('Method not implemented.');
  }


  protected equalsExerciseData(exerciseData: any, exerciseDoneData: any): boolean {
    return true
  }


  getMetricsInitialExpandableInfo(): ExpandableInfo {
    return {
      exercisesData: [],
      exerciseMetadata: {
        exercisesMode: 'cumulative',
        exercisesQuantity: 'infinite',
      },
      globalStatement: [],
      timeSettings: {
        timeMode: 'total',
      },
    }; 
   }


  constructor(gameActionsService: GameActionsService<any>, private levelService: LevelService,
    subLevelService: SubLevelService,
    private preloaderService: PreloaderOxService,
    private feedback: FeedbackOxService,
    private appInfo: AppInfoOxService) {

    super(gameActionsService, subLevelService, preloaderService);
    console.log(this.appInfo.microLessonInfo);

  }




  beforeStartGame(): void {
    const gameCase = 'created-config';
    switch (gameCase) {
      case 'created-config':
        this.currentSubLevelPregeneratedExercisesNeeded = 1;
        this.exerciseConfig = this.getExerciseConfig();
        // this.exerciseConfig = JSON.parse('{"GAME_RULES":["forma","color","relleno"],"shapesAvaiable":["circulo","cuadrado","triangulo","estrella"],"colorsAvaiable":["rojo","celeste","amarillo","violeta"],"fillsAvaiable":["vacio","relleno","rallado","moteado"],"cardInTable":9,"cardQuantityDeck":32, "cardsForCorrectAnswer":3,"gameSetting":"igual","totalTimeInSeconds":30,"wildcardOn":true,"minWildcardQuantity":2,"GameMode":"limpiar la mesa","rulesForAnswer":1}');
        // this.cardInTable = 
        // this.exerciseConfig = JSON.parse('{"gameRules":["forma","color","relleno"],"shapesAvaiable":["circulo","cuadrado","triangulo","estrella","rombo"],"colorsAvaiable":["naranja","celeste","amarillo","verde","violeta"],"fillsAvaiable":["vacio","relleno","rallado","moteado"],"cardInTable":9,"cardsForCorrectAnswer":3,"gameSetting":["igual", "distinto", "aleatorio"],"totalTimeInSeconds":15  ,"wildcardOn":true,"minWildcardQuantity":2,"gameMode":"Set convencional","rulesForAnswer":1,"totalExercises":99}');
        break;
      default:
        throw new Error('Wrong game case recived from Wumbox');
    }
  }




  public getExerciseConfig(): any {
    return this.appInfo.microLessonInfo.creatorInfo?.microLessonGameInfo;
  }

}
