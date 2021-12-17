import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBodyComponent } from './components/game-body/game-body.component';
import { SharedModule } from '../shared/shared.module';
import { MainLetterComponent } from './components/main-letter/main-letter.component';


@NgModule({
  declarations: [
    GameBodyComponent,
    MainLetterComponent
  ],
  imports: [
    SharedModule
  ],
  exports:[
    GameBodyComponent
  ]
})
export class AcrosticGameModule { }
