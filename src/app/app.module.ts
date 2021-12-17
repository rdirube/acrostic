import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { AcrosticGameModule } from './acrostic-game/acrostic-game.module';
import { SharedModule } from './shared/shared.module';
import { AnswerService, ChallengeService } from 'micro-lesson-core';
import { AcrosticChallengeService } from './shared/services/acrostic-challenge.service';
import { AcrosticAnswerService } from './shared/services/acrostic-answer.service';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslocoRootModule,
    AcrosticGameModule,
    SharedModule,
 ],
  providers: [
    {
      provide:ChallengeService,
      useExisting:AcrosticChallengeService
    },
    {
      provide:AnswerService,
      useExisting:AcrosticAnswerService
    },
    {provide: APP_BASE_HREF, useValue: '/'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
