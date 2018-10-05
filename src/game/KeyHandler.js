const keyMap = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

const keys = Object.keys(keyMap).map(e => parseInt(e));
const values = Object.values(keyMap);

class KeyHandler  {
  constructor() {
    this.pressed = Object.assign(...values.map(e => ({[e]:false})))
  }

  getPressed() {
    return this.pressed;
  }

  setKey(key, value) {
    this.pressed[key] = value;
  }

  startEventHandler() {
    window.addEventListener("keydown", (event) => {
      let handled = false;
      const {keyCode} = event;
      if (keys.some(e => e === keyCode)){
        this.setKey(keyMap[keyCode], true)
        handled = true
      }

      if (handled) {
        event.preventDefault();
      }
    }, true);

    window.addEventListener("keyup", (event) => {
      let handled = false;
      const {keyCode} = event;
      if (keys.some(e => e === keyCode)){
        this.setKey(keyMap[keyCode], false);
        handled = true
      }
      if (handled) {
        event.preventDefault();
      }
    }, true);
  }


}

export default KeyHandler;