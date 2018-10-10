
const directions = {
    north: {x: 0, y: -1},
    south: {x: 0, y: 1},
    east: {x: 1, y: 0},
    west: {x: -1, y: 0},
}

export default (direction) => {
    if (typeof direction === 'string') return {name: "MOVE", dir: directions[direction]}
    if (typeof direction === 'object') return {name: "MOVE", dir: direction}
}