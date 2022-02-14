import { HttpClient } from '@angular/common/http';
import { Component, ElementRef } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  AppInfoOxService,
  BaseMicroLessonApp,
  EndGameService,
  GameActionsService,
  InWumboxService,
  LevelService,
  MicroLessonCommunicationService,
  MicroLessonMetricsService,
  ProgressService,
  ResourceStateService,
  SoundOxService
} from 'micro-lesson-core';
import { PostMessageBridgeFactory } from 'ngox-post-message';
import { CommunicationOxService, I18nService, PreloaderOxService, ResourceOx, ResourceType } from 'ox-core';
import { ResourceFinalStateOxBridge, ScreenTypeOx } from 'ox-types';
import { timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AcrosticChallengeService } from './shared/services/acrostic-challenge.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseMicroLessonApp {


  protected getBasePath(): string {
    return environment.basePath;
  }

  title = 'acrostic';

  constructor(preloader: PreloaderOxService, translocoService: TranslocoService, wumboxService: InWumboxService,
    communicationOxService: CommunicationOxService, microLessonCommunicationService: MicroLessonCommunicationService<any>,
    progressService: ProgressService, elementRef: ElementRef, private _gameActionsService: GameActionsService<any>,
    endGame: EndGameService, i18nService: I18nService, levelService: LevelService, http: HttpClient,
    private _challengeService: AcrosticChallengeService, private _appInfoService: AppInfoOxService,
    private _metrics: MicroLessonMetricsService<any>, // Todo
    resourceStateService: ResourceStateService,
    sound: SoundOxService, bridgeFactory: PostMessageBridgeFactory,
    transloco: TranslocoService) {
    super(preloader, translocoService, wumboxService, communicationOxService, microLessonCommunicationService,
      progressService, elementRef, _gameActionsService, endGame,
      i18nService, levelService, http, _challengeService, _appInfoService, _metrics, sound, bridgeFactory);

    communicationOxService.receiveI18NInfo.subscribe(z => {
      console.log('i18n', z);
    });
    this._gameActionsService.microLessonCompleted.subscribe(__ => {
      if (resourceStateService.currentState?.value) {
        microLessonCommunicationService.sendMessageMLToManager(ResourceFinalStateOxBridge, resourceStateService.currentState.value);
      }
    });
    preloader.addResourcesToLoad(this.getGameResourcesToLoad());
    console.log('App component instanciated', this);
    // preloader.loadAll().subscribe( z => {
    //   console.log('Everything is loaded, vale of loaded', this);
    //   timer(3000).subscribe(z => {
    //     this.loaded = true
    //     console.log('Loaded set to ttrue', this.loaded);
    //   });
    // });
    this.sound.setSoundOn(true);
  }


  protected getGameResourcesToLoad(): ResourceOx[] {
    const svgElementos: string[] = ['check.svg', 'copa-memotest.svg', 'next-memotest.svg', 'surrender.svg', 'menu.svg', 'pista.svg', 'sonido-activado.svg'];

    const gameResources: string[] = ['background.svg', 'boat-with-water.svg', 'container-blue.svg', 'container-green.svg', 'container-orange.svg',
      'container-red.svg', 'header-background-18.svg', 'indicator.svg'];

    const sounds = ['click.mp3', 'bubble01.mp3', 'bubble02.mp3', 'rightAnswer.mp3', 'woosh.mp3', 'wrongAnswer.mp3', 'clickSurrender.mp3', 'cantClick.mp3', 'keypressOk.mp3', 'selectedInput.mp3', 'hint.mp3'].map(z => 'sounds/' + z);
    // 
    return svgElementos.map(x => new ResourceOx('mini-lessons/executive-functions/buttons/' + x, ResourceType.Svg,
      [ScreenTypeOx.Game], true)).concat(gameResources.map(x => new ResourceOx('mini-lessons/executive-functions/acrostic/volcan/svg/' + x, ResourceType.Svg,
        [ScreenTypeOx.Game], true)))
      .concat(getResourceArrayFromUrlList(sounds, ResourceType.Audio, true));
  }

//   return svgElementos.map(x => new ResourceOx('changing_rules/svg/elementos/' + x, ResourceType.Svg,
//   [ScreenTypeOx.Game], true))
// .concat(svgIndications.map(x => new ResourceOx('changing_rules/svg/indicación/' + x, ResourceType.Svg,
//   [ScreenTypeOx.Game], true)))
// .concat(getResourceArrayFromUrlList(sounds, ResourceType.Audio, false))
// .concat(getResourceArrayFromUrlList(figuresSvg, ResourceType.Svg, false))
// .concat(getResourceArrayFromUrlList(['mini-lessons/executive-functions/svg/buttons/Home.svg',
//   'mini-lessons/executive-functions/svg/buttons/Hint.svg',
//   'mini-lessons/executive-functions/svg/buttons/saltear.svg'], ResourceType.Svg, false));

}



function getResourceArrayFromUrlList(urlList: string[], resourceType: ResourceType, isLocal: boolean): ResourceOx[] {
  return urlList.map(listElement => new ResourceOx(listElement, resourceType, [ScreenTypeOx.Game], isLocal));
}