import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-letter',
  templateUrl: './main-letter.component.html',
  styleUrls: ['./main-letter.component.scss']
})
export class MainLetterComponent implements OnInit {

  @Input() mainLetter!:string
  @Input() answerWord!:string;
  public answerWordArray!:string[];
  public beforeFirstHalfQuantity!:string[];
  public afterFirstHalfQuantity!:string[];


   
  constructor() { 
  }

  ngOnInit(): void {
    this.answerWordArray =  this.answerWord.split('');
    this.beforeFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter,true);
    this.afterFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter,false);
  }


  public answerWordPositionCalculator(wordArray:string[],word:string, beforeFirstHalf:boolean):string[] {

    const wordPosition = wordArray.indexOf(word);
    let wordSplited:string[] = []
    if(beforeFirstHalf) {
       wordSplited = this.answerWordArray.splice(0,wordPosition);
       return  wordSplited
    } else {
      wordSplited = this.answerWordArray.splice(1, wordArray.length);
      return wordSplited
    } 
  }

}
