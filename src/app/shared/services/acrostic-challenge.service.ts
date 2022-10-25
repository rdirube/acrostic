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
import { AcrosticExercise, HorizontalWordText, WordAnswer, WordSelectedEmitValues } from '../types/types';
import { AcrosticNivelation } from '../types/types';


@Injectable({
  providedIn: 'root'
})


export class AcrosticChallengeService extends ChallengeService<any, any> {

  wordHasBeenSelected = new EventEmitter<WordAnswer>();
  nextWordSelection = new EventEmitter<number>();
  horizontalWordToArray = new EventEmitter();

  public exerciseConfig!: AcrosticNivelation;
  public animationRunning: boolean = false;

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
        },
        correctionWithMayus:this.exerciseConfig.advancedSettings.correctWithMayus,
       correctionWithAccent:this.exerciseConfig.advancedSettings.correctWithAccent,
       hintQuantity: this.exerciseConfig.advancedSettings.hintQuantity
      } as AcrosticExercise, 1, {
      maxTimeToBonus: 0,
      freeTime: 0
    }, []);

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


  constructor( private levelService: LevelService,
    subLevelService: SubLevelService,
    gameActionsService: GameActionsService<any>,
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
        console.log(this.exerciseConfig);
        
        this.exerciseConfig = JSON.parse('{"supportedLanguages":{"es":true,"en":false},"isPublic":false,"ownerUid":"oQPbggIFzLcEHuDjp5ZNbkkVOlZ2","uid":"dUKr5JJrsVDOD47oscop","inheritedPedagogicalObjectives":[],"customTextTranslations":{"es":{"name":{"text":""},"description":{"text":""},"previewData":{"path":""}}},"backupReferences":"","type":"mini-lesson","libraryItemType":"resource","tagIds":{},"properties":{"customConfig":{"customMedia":["1642796742586snake.mp3"],"creatorInfo":{"metricsType":"results","creatorType":"acrostic","type":"challenges","screenTheme":"executive-functions","exerciseCount":8,"microLessonGameInfo":{"verticalWord":{"text":"venenoso","audio":"1642796742586snake.mp3"},"horizontalWord":{"word":[{"word1":"a","mainLetter":"v","word2":"ión","audio":""},{"word1":"ber","mainLetter":"e","word2":"njena","audio":""},{"word1":"gé","mainLetter":"n","word2":"ero","audio":""},{"word1":"cat","mainLetter":"e","word2":"goría","audio":""},{"word1":"exte","mainLetter":"n","word2":"sión","audio":""},{"word1":"fil","mainLetter":"o","word2":"sofia","audio":""},{"word1":"divi","mainLetter":"s","word2":"ión","audio":""},{"word1":"alg","mainLetter":"o","word2":"ritmo","audio":""}],"description":[{"audio":"","image":"","text":"Vehículo que puede desplazarse por el aire gracias a que cuenta con un motor y con alas.","video":""},{"audio":"","image":"","text":"Planta hortícola ramosa, de hojas grandes, ovaladas, de color verde, cubiertas de un polvo blanco y llenas de aguijones, flores grandes de color morado y fruto aovado o alargado.","video":""},{"audio":"","image":"","text":"Conjunto de personas o cosas que tienen características generales comunes.","video":""},{"audio":"","image":"","text":"Clase que resulta de una clasificación de personas o cosas según un criterio o jerarquía.","video":""},{"audio":"","image":"","text":"Acción de extender o extenderse.","video":""},{"audio":"","image":"","text":"Conjunto de razonamientos lógicos y metódicos sobre conceptos abstractos que tratan de explicar las causas y fines de la verdad, la realidad, las experiencias y nuestra existencia.","video":""},{"audio":"","image":"","text":"Separación o partición de un todo en partes.","video":""},{"audio":"","image":"","text":"Conjunto ordenado de operaciones sistemáticas que permite hacer un cálculo y hallar la solución de un tipo de problemas.","video":""}]}}},"advancedSettings":{"correctWithAccent":false}}},"extraInfo":{"gameUrl":"https://text-structure.web.app","theme":"volcano","exerciseCase":"created","language":"ESP"}},"format":"acrostic","miniLessonVersion":"with-custom-config-v2","miniLessonUid":"Acrostic","url":"https://ml-screen-manager.firebaseapp.com"}}').properties.customConfig.creatorInfo?.microLessonGameInfo;
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
