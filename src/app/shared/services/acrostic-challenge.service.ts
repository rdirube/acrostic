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
        // this.exerciseConfig = this.getExerciseConfig();
         this.exerciseConfig = JSON.parse('{"supportedLanguages":{"es":true,"en":false},"isPublic":false,"ownerUid":"oQPbggIFzLcEHuDjp5ZNbkkVOlZ2","uid":"dUKr5JJrsVDOD47oscop","inheritedPedagogicalObjectives":[],"customTextTranslations":{"es":{"name":{"text":""},"description":{"text":""},"previewData":{"path":""}}},"backupReferences":"","type":"mini-lesson","libraryItemType":"resource","tagIds":{},"properties":{"customConfig":{"customMedia":["1642796742586snake.mp3"],"creatorInfo":{"metricsType":"results","creatorType":"acrostic","type":"challenges","screenTheme":"executive-functions","exerciseCount":6,"microLessonGameInfo":{"verticalWord":{"text":"verano","audio":"1642796742586snake.mp3"},"horizontalWord":{"word":[{"word1":"mo","mainLetter":"v","word2":"er","audio":""},{"word1":"el","mainLetter":"e","word2":"fante","audio":""},{"word1":"te","mainLetter":"r","word2":"mo","audio":""},{"word1":"cerr","mainLetter":"a","word2":"r","audio":""},{"word1":"co","mainLetter":"n","word2":"o","audio":""},{"word1":"morr","mainLetter":"o","word2":"on","audio":""}],"description":[{"audio":"","image":"","text":"Hacer que un cuerpo o una parte de él cambie de lugar físico.","video":""},{"audio":"","image":"","text":"Mamífero paquidermo de gran tamaño, el mayor de los terrestres, con la piel de color gris oscuro, gruesa, rugosa y sin pelo, grandes orejas colgantes, larga trompa prensil, cuatro extremidades gruesas y casi cilíndricas","video":""},{"audio":"","image":"","text":"Recipiente con cierre hermético y paredes aislantes que sirve para mantener la temperatura de las bebidas o alimentos líquidos que contiene.","video":""},{"audio":"","image":"","text":"Hacer que el interior de un espacio o lugar no tenga comunicación directa con el exterior, no dejando aberturas o cubriéndolas, tapándolas, etc.","video":""},{"audio":"","image":"","text":"Cuerpo geométrico formado por una superficie lateral curva y cerrada, que termina en un vértice, y un plano que forma su base; en especial el cono circular.","video":""},{"audio":"","image":"","text":"adj. Dícese del pimiento más dulce, grueso y carnoso que los de las otras variedades.","video":""}]}}},"extraInfo":{"gameUrl":"https://text-structure.web.app","theme":"volcano","exerciseCase":"created","language":"ESP"}},"format":"acrostic","miniLessonVersion":"with-custom-config-v2","miniLessonUid":"Acrostic","url":"https://ml-screen-manager.firebaseapp.com"}}').properties.customConfig.creatorInfo?.microLessonGameInfo;
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
