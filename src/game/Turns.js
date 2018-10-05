export default class Turns {
  constructor(entities) {
    this.entities = entities;
    this.turn = 0;
    this.index = 0;
    // this.wait = false;
  }

  advanceTurn() {
    this.turn++
  }

  update() {
    // if (this.wait) return false;
    this.entities[this.index].update(() => this.afterTurn());
  }

  afterTurn() {

    this.index++;
    // this.wait = false;

    if (this.index >= this.entities.length) {
      this.index = 0;
      console.log('your turn')
      this.turn++;
      return;
    }

  }

}