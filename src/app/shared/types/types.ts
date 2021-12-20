export interface WordPosition {
  position:number;
  lastHalf:number;
  isSelected:boolean;
}


export interface WordAnswer {
    id:number,
    word:string,
    isComplete:boolean,
    isSelected:boolean,
    isCorrect:boolean,
    definition:string,
  }


  export interface WordSelectedEmitValues {
      id:number,
      definition:string
  }