export default (state) => {
  state.canvas = undefined;
  state.ctx = undefined;
  return {
    registerCanvas: (canvas, ctx) => {
      state = Object.assign(state, {canvas, ctx})
    }
  }
};