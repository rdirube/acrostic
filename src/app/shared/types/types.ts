import { duplicateWithJSON, equalArrays } from "ox-types";

export interface WordPosition {
  position:number;
  lastHalf:number;
  isSelected:boolean;
}


export interface WordAnswer {
    id:number,
    word:HorizontalWordText,
    isComplete:boolean,
    isCorrect:boolean,
    description:HorizontalWordDescription,
  }


  export interface WordSelectedEmitValues {
      id:number,
      definition:string
  }



  export interface AcrosticNivelation {
    verticalWord: {
      text:string;
      audio:string;
    },
    horizontalWord: {
      word:{
        word1:string,
        mainLetter:string,
        word2:string,
        audio:string
      }[],
      description: {
          audio:string,
          image:string,
          text:string,
          video:string
      }[]
    }
  }

    
  export interface HorizontalWordText { 
      text:string;
      audio:string;  
  }


  export interface HorizontalWordDescription {
    audio:string;
    image:string,
    text:string,
    video:string
  }


  export interface AcrosticExercise {
    verticalWord:  {
      text:string;
      audio:string;
    },
    horizontalWord: HorizontalWord
  }


  export interface HorizontalWord {   
      word : HorizontalWordText[],
      description: HorizontalWordDescription[]
  }


  export class HorizontalWordObj {
  public answerWordArray:string[] = [];  
  public beforeFirstHalfQuantity!:string[];
  public afterFirstHalfQuantity!:string[];


  constructor(public answerWord:WordAnswer, public mainLetter:string) {
   this.answerWordArray = this.answerWord.word.text.split('');
   this.beforeFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter, true);
   this.afterFirstHalfQuantity = this.answerWordPositionCalculator(this.answerWordArray, this.mainLetter, false);
  }

  public middlePositionCalculator(wordArray: string[], wordSearched: string): number {
    let positionsArray: WordPosition[] = [];
    let currentDiffPositionValue: number = 1000;
    let wordQuantity: number = 1;
    wordArray.forEach((word, i) => {
      if (word === wordSearched) {
        positionsArray.push({
          position: wordArray.indexOf(word, wordQuantity),
          lastHalf: wordArray.length - wordArray.indexOf(word, wordQuantity),
          isSelected: false
        });
        wordQuantity++;
      }
    })
    positionsArray.forEach(el => {
      if (Math.abs(el.position - el.lastHalf) < currentDiffPositionValue) {
        positionsArray.forEach(el => el.isSelected = false)
        el.isSelected = true;
        currentDiffPositionValue = Math.abs(el.position - el.lastHalf)
      }
    })
    const positionToReturn = positionsArray.filter(el => el.isSelected);
    return positionToReturn[0].position;
  }



  public answerWordPositionCalculator(wordArray: string[], wordSearched: string, beforeFirstHalf: boolean): string[] {
    const wordAnswerArrayCalc = duplicateWithJSON(wordArray);
    const wordPosition = this.middlePositionCalculator(wordAnswerArrayCalc, wordSearched);
    let wordSplited: string[] = [];
    if (beforeFirstHalf) {
      wordSplited = wordAnswerArrayCalc.splice(0, wordPosition);
      return wordSplited
    } else {
      wordSplited = wordAnswerArrayCalc.splice(wordPosition + 1, wordAnswerArrayCalc.length);
      return wordSplited
    }
  }

  
   

  }