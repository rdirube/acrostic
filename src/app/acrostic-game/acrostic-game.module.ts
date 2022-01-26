import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBodyComponent } from './components/game-body/game-body.component';
import { SharedModule } from '../shared/shared.module';
import { MainLetterComponent } from './components/main-letter/main-letter.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GameBodyComponent,
    MainLetterComponent
  ],
  imports: [
    SharedModule,
    FormsModule
  ],
  exports:[
    GameBodyComponent
  ]
})
export class AcrosticGameModule { }
