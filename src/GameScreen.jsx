import React,{Component} from 'react';

import Game from './game';

export default class GameScreen extends Component {

  state = {
    screenSize: {
      width: 800,
      height: 800
    }
  }

  componentDidMount() {
    const canvas = document.getElementById("gameScreen");
    const ctx = canvas.getContext("2d");
    const game = Game(canvas, ctx);
    game.load();
  }

  render() {
    const {width, height} = this.state.screenSize;
    return <canvas width={width} height={height} id="gameScreen"/>
  }

}

