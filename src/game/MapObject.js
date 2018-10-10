// i = x + width*y;
// x = i % width;    // % is the "modulo operator", the remainder of i / width;
// y = i / width;    // where "/" is an integer division

import { astar, Graph } from './lib/astar';

export default class MapObject {
    constructor(width, height, initFill) {
        this.width = width;
        this.height = height;
        this.map = new Array(width * height).fill(initFill)
    }

    getCell(x, y) {
        const { width } = this;
        const index = x + width * y;
        if(typeof this.map[index] === 'undefined') return false;
        const value = this.map[index];
        return {x, y, value, index}
    }

    setCell(x, y, value) {
        const { width } = this;
        const index = x + width * y;
        this.map[index] = value;
    }

    setCellByIndex(index, value) {
        this.map[index] = value;
    }

    iterateRange(startX, startY, endX, endY, func) {
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                func(this.makeCellObjectFromCoord(x, y));
            }
        }
    }

    makeCellObjectFromCoord(x, y) {
        const { width } = this;
        const index = x + width * y;
        const value = this.map[index];
        return {x, y, index, value}
    }

    makeCellObjectFromIndex(index) {
        const { width } = this;
        const x = Math.floor(index % width);
        const y = Math.floor(index / width);
        const value = this.map[index];
        return {x, y, index, value}
    }

    iterate(func) {        
        for (let index in this.map) {                        
            func(this.makeCellObjectFromIndex(index))
        }
    }

    makeGraph(onlyFloors = false, includeDoors = false) {
        const {width, height} = this;        
        let grid = [];        
        this.iterate((cellObject) => {            
            const { x, y, value } = cellObject;            
            if (!grid[x]) grid[x] = [];
            if (onlyFloors) {
                grid[x][y] = (value.type === 'floor' || value.type === 'door') ? 1 : 0;
            } else {
                grid[x][y] = value.weight;
            }
        });
        return new Graph(grid);
      };

    findPath(x0, y0, x1, y1) {
        const graph = this.makeGraph(true, true);
        const start = graph.grid[x0][y0];
        const end = graph.grid[x1][y1];
        const results = astar.search(graph, start, end);
        return results;
    }

}