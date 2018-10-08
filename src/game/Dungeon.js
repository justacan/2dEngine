import AABB from "./AABB";

import { astar, Graph } from './lib/astar';

const mapWidth = 50;
const mapHeight = 50;


const makeGraph = (map, onlyFloors = false) => {
  const grid = [];  

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (!grid[y]) grid[y] = [];
      grid[y][x] = undefined;
    }
  }

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (!grid[y]) grid[y] = []
      if (onlyFloors) {
        grid[x][y] = (map[y][x].type === 'floor') ? 1 : 0;
      } else {
        grid[x][y] = map[y][x].weight;
      }
    }
  }

  return new Graph(grid);
}

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const addPadding = (room, padding = 1) => {
  const { x, y, width, height } = room;
  return {
    x: x - padding,
    y: y - padding,
    width: width + padding,
    height: height + padding
  }
};

// Tile Types
const Floor = () => {
  return {
    type: 'floor',
    weight: 1,
    fillStyle: '#47361a',
    canWalk: true,
    canSeeThrough: true
  }
}

const Wall = () => {
  return {
    type: 'wall',
    weight: 5,
    fillStyle: '#aab4b7',
    canWalk: false,
    canSeeThrough: false
  }
}

const WallCorner = () => {
  return {
    type: 'wall',
    weight: 0,
    fillStyle: '#09b2e5',
    canWalk: false,
    canSeeThrough: false
  }
}

const Void = () => {
  return {
    type: 'void',
    weight: 1,
    fillStyle: '#000000',
    canWalk: false
  }
}

const Door = () => {
  return {
    type: 'door',
    weight: 1,
    fillStyle: '#17d81b',
    strokeStyle: '#17d81b',
    renderStyle: 'fill',
    open: false,
    canWalk: true,
    canSeeThrough: false
  }
};

const LineTest = () => {
  return {
    weight: 1,
    fillStyle: '#eadc10',
    canWalk: true
  }
}


class Map {
  constructor(canvas, ctx) {
    this.map = [];
    this.mask = [];
    this.rooms = [];
    this.canvas = canvas;
    this.ctx = ctx;
    this.tileSize = 16;
    // this.width = this.canvas.width / this.tileSize;
    // this.height = this.canvas.height / this.tileSize;
  }

  registerCanvas(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  iterate(func) {
    // const { width, height } = this;
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        func(x, y);
      }
    }
  }

  findClosestRoom(room, filtered = false) {
    let closest = null;
    const rooms = filtered || this.rooms
    for (let iRoom of rooms) {
      // if (room.center.x === iRoom.center.x && room.center.y === iRoom.center.y) continue;
      if (room === iRoom) continue;
      if (iRoom.connected.includes(room)) continue;
      if (!closest) closest = iRoom;

      const ax = Math.abs(room.center.x - iRoom.center.x);
      const ay = Math.abs(room.center.y - iRoom.center.y);

      const bx = Math.abs(room.center.x - closest.center.x);
      const by = Math.abs(room.center.y - closest.center.y);

      if ((ax + ay) < (bx + by)) {
        closest = iRoom;
      }
    }
    return closest;
  }

  roomCounter = 0;

  placeRoom(_x, _y, _width, _height) {
    const x = _x || getRandomArbitrary(1, mapWidth - 1);
    const y = _y || getRandomArbitrary(1, mapHeight - 1);
    const width = _width || getRandomArbitrary(7, 15);
    const height = _height || getRandomArbitrary(7, 15);

    // Out of bounds check
    if ((y + height + 1) > mapHeight) return false;
    if ((x + width + 1) > mapWidth) return false;

    // Overlap check
    for (let room of this.rooms) {
      if (AABB(addPadding({ x, y, width, height }), addPadding(room))) return false;
    }

    const corners = [];

    // Apply room to map
    for (let iY = y; iY < y + height; iY++) {
      for (let iX = x; iX < x + width; iX++) {
        if (iY === y || iX === x || iY === y + height - 1 || iX === x + width - 1) {
          this.setTile(iX, iY, Wall());
        } else {
          this.setTile(iX, iY, Floor());
        }
        if (iX === x && iY === y) this.setTile(iX, iY, WallCorner())
        if (iX === x + width - 1 && iY === y) this.setTile(iX, iY, WallCorner())
        if (iX === x && iY === y + height - 1) this.setTile(iX, iY, WallCorner())
        if (iX === x + width - 1 && iY === y + height - 1) this.setTile(iX, iY, WallCorner())

      }
    }

    // Save room to be checked for overlap
    this.rooms.push({ index: this.roomCounter, x, y, width, height, connected: [], corners });
    this.roomCounter++
    console.log("Room Placed!")

  }

  getTile(x, y) {
    try {
      return this.map[y][x]
    } catch (e) {
      return false;
    }
  }

  setTile(x, y, value) {
    try {
      this.map[y][x] = {x, y, ...value};
    } catch (e) {
      return false;
    }

  }

  connectRooms(room1, room2) {
    if (!room1.connected) room1.connected = [];
    if (!room2.connected) room2.connected = [];
    room1.connected.push(room2);
    room2.connected.push(room1);
  }

  findRoomCenters() {
    for (let room of this.rooms) {
      let x = Math.floor(room.width / 2) + room.x;
      let y = Math.floor(room.height / 2) + room.y;
      room.center = { x, y };
      // this.setTile(x, y, RoomCenter())
    }
  }

  generate() {
    this.iterate((x, y) => {
      if (!this.map[y]) this.map[y] = []
      this.setTile(x, y, Void());
    });

    for (let i = 0; i < 1000; i++) {
      this.placeRoom();
    }

    this.findRoomCenters();

    for (let room of this.rooms) {
      const graphWithWeight = makeGraph(this.map);
      const closest = this.findClosestRoom(room);
      const start = graphWithWeight.grid[room.center.x][room.center.y];
      const end = graphWithWeight.grid[closest.center.x][closest.center.y];
      const resultWithWeight = astar.search(graphWithWeight, start, end);
      for (let res of resultWithWeight) {
        this.setTile(res.x, res.y, Floor())
      }
      this.connectRooms(room, closest);
    }

    // Fix Islands
    while (true) {
      let areConnected = [];
      let notConnected = [];
      const firstRoom = this.rooms[0];
      for (let room of this.rooms) {        
        const graph = makeGraph(this.map, true);
        const start = graph.grid[firstRoom.center.x][firstRoom.center.y];
        const end = graph.grid[room.center.x][room.center.y];
        const results = astar.search(graph, start, end);

        if (results.length) areConnected.push(room)
        // console.log(results.length);
      }

      areConnected.unshift(firstRoom)
      notConnected = this.rooms.filter(e => !areConnected.includes(e))

      console.log('areConnected:', areConnected.length);
      console.log('notConnected:', notConnected.length);
      console.log('rooms', this.rooms.length)

      if (areConnected.length === this.rooms.length) {
        console.log("ALL CONNECTED");
        break;
      }      
      
      console.log("Fixing Island!");

      try {
        const firstUp = notConnected.pop();      
        if (!firstUp) break;
        const graphWithWeight = makeGraph(this.map);
        const closest = this.findClosestRoom(firstUp, areConnected);
        const start = graphWithWeight.grid[firstUp.center.x][firstUp.center.y];
        const end = graphWithWeight.grid[closest.center.x][closest.center.y];
        const resultWithWeight = astar.search(graphWithWeight, start, end);
        for (let res of resultWithWeight) {
          this.setTile(res.x, res.y, Floor())
        }
        this.connectRooms(firstUp, closest);
      } catch (e) {
        // this.render()
        console.log("BROKE")
        break;        
      }
    }

    // make doors
    for (let room of this.rooms) {
      for (let y = room.y; y < room.height + room.y; y++) {
        for (let x = room.x; x < room.width + room.x; x++) {
          if (x === room.x || y === room.y || x === room.width + room.x - 1 || y === room.height + room.y - 1) {
            if (this.map[y][x].type === 'floor') {
              this.setTile(x, y, Door());
            }
            
          }
        }
      }     
      // return;
    }

    // make mask

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (!this.mask[y]) this.mask[y] = [];
        if (this.getTile(x, y).type !== 'void') {
          this.mask[y][x] = 1
        } else {
          this.mask[y][x] = 0
        }
      }
    }
  }

  testGenerate() {
      this.iterate((x, y) => {
        if (!this.map[y]) this.map[y] = []
        this.setTile(x, y, Void());
      });

      this.placeRoom(1, 1, 10, 10);

      this.findRoomCenters();

      for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
        if (!this.mask[y]) this.mask[y] = [];
        if (this.getTile(x, y).type !== 'void') {
          this.mask[y][x] = 1
        } else {
          this.mask[y][x] = 0
        }
      }
    }
  }



  render() {
    const { tileSize } = this;
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (!this.map[y][x]) {
          this.ctx.fillStyle = "#ff00bf"
        } else {
          this.ctx.strokeStyle = this.map[y][x].strokeStyle;
          this.ctx.fillStyle = this.map[y][x].fillStyle;
        }

        if (this.map[y][x].renderStyle && this.map[y][x].renderStyle === 'stroke') {
          this.ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize)
        } else {
          this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }

      }
    }
  }

  line(x0, y0, x1, y1) {
    let dx = Math.abs(x1-x0);
    let dy = Math.abs(y1-y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx-dy;

    while(true) {
      // this.setPixel(x0,y0, 4);  // Do what you need to for this

      const tile = this.getTile(x0, y0);
      if (!tile) continue;
      if (!tile.canSeeThrough) return {x: x0, y: y0};

      if ((x0 === x1) && (y0 === y1)) break;
      let e2 = 2*err;
      if (e2 >-dy){ err -= dy; x0 += sx; }
      if (e2 < dx){ err += dx; y0 += sy; }
    }
    return true;
  }

  updateMask(playerX, playerY) {

    const radius = 4;

    const extras = [];

    for(let y = 0;y < mapHeight; y++) {
      for(let x = 0;x < mapHeight; x++) {
        if (this.mask[y][x] === 0) this.mask[y][x] = .5
      }
    }

    for (let y = playerY + -(radius); y <= playerY + (radius); y++) {
      for (let x = playerX + -(radius); x <= playerX + (radius); x++) {
        const res = this.line(playerX, playerY, x, y);
        if(res === true) this.setMask(x, y, 0);
        if (res.x && res.y) extras.push(res)
      }
    }

    for (let extra of extras) {
      const {x, y} = extra
      this.setMask(x, y, 0);
    }

  }

  setMask (x, y, value) {
    try {
      this.mask[y][x] = value
    } catch (e) {
      return false;
    }
  }

  setDoor(door, mode) {
    if (mode === 'open') {
      door.open = true;
      door.canSeeThrough = true;
      door.renderStyle = 'stroke'
    }
    if (mode === 'closed') {
      door.open = false;
      door.canSeeThrough = false;
      door.renderStyle = 'fill'
    }
  }

  renderMask() {
    const { tileSize } = this;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        this.ctx.fillStyle = `rgba(0,0,0,${this.mask[y][x]})`;
        this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

export default Map;