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
    canWalk: true
  }
}

const Wall = () => {
  return {
    weight: 5,
    fillStyle: '#aab4b7',
    canWalk: false
  }
}

const WallCorner = () => {
  return {
    weight: 0,
    fillStyle: '#09b2e5',
    canWalk: false
  }
}

const Void = () => {
  return {
    weight: 1,
    fillStyle: '#000000',
    canWalk: false
    
  }
}

const Yolo = () => {
  return {
    weight: 1,
    fillStyle: '#17d81b',
    canWalk: true
  }
}

const RoomCenter = () => {
  return {
    weight: 1,
    fillStyle: '#eadc10',
    canWalk: true
  }
}


class Map {
  constructor(canvas, ctx) {
    this.map = [];
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

  placeRoom() {
    const x = getRandomArbitrary(0, mapWidth);
    const y = getRandomArbitrary(0, mapHeight);
    const width = getRandomArbitrary(7, 15);
    const height = getRandomArbitrary(7, 15);

    // Out of bounds check
    if ((y + height) > mapHeight) return false;
    if ((x + width) > mapWidth) return false;

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

  getTile(x, y) {return this.map[y][x]}

  setTile(x, y, value) {
    this.map[y][x] = value;
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
              this.setTile(x, y, Yolo());
            }
            
          }
        }
      }     
      // return;
    }

  }

  render() {
    const { tileSize } = this;

    // const graph = makeGraph(this.map, true);

    // for (let y = 0; y < height; y++) {
    //   for (let x = 0; x < width; x++) {
    //     if (graph.grid[x][y].weight) {
    //       this.ctx.fillStyle = "#ffffff"
    //     } else {
    //       this.ctx.fillStyle = "#000000"
    //     }
    //     this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    //   }
    // }

    // for (let i in this.rooms) {
    //   const room = this.rooms[i]
    //   this.ctx.font = "12px Arial";
    //   this.ctx.fillStyle = "#000000"
    //   this.ctx.fillText(i, room.center.x * this.tileSize, room.center.y * this.tileSize);
    // }

    // return;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (!this.map[y][x]) {
          this.ctx.fillStyle = "#ff00bf"
        } else {
          this.ctx.fillStyle = this.map[y][x].fillStyle
        }
        this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

export default Map;