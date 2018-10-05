import canRegisterCanvas from './canRegisterCanvas';

export default (name = 'Unnamed', x = 0, y = 0) => {
  const width = 16;
  const height = 16;

  let state = {
    name,
    pos: {x,y},
    size: {width, height},
    update: () => {},
    render: () => {}
  };

  return Object.assign(state, canRegisterCanvas(state));
};