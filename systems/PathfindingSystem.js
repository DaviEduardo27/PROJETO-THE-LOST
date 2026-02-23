import IsoUtils from '../utils/IsoUtils.js';

export default class PathfindingSystem {

    constructor(scene, isoTilemap) {
        this.scene = scene;
        this.isoTilemap = isoTilemap;
    }

    // Convert World (Cartesian) to Grid Indices
    worldToGrid(x, y) {
        const i = Math.round(x / (IsoUtils.TILE_WIDTH / 2));
        const j = Math.round(y / (IsoUtils.TILE_HEIGHT / 2));
        return { x: i, y: j };
    }

    // Convert Grid Indices to World (Cartesian)
    gridToWorld(i, j) {
        return {
            x: i * (IsoUtils.TILE_WIDTH / 2),
            y: j * (IsoUtils.TILE_HEIGHT / 2)
        };
    }

    // A* Pathfinding Algorithm
    findPath(startWorldX, startWorldY, endWorldX, endWorldY) {
        const startNode = this.worldToGrid(startWorldX, startWorldY);
        const endNode = this.worldToGrid(endWorldX, endWorldY);

        const startKey = `${startNode.x},${startNode.y}`;
        const endKey = `${endNode.x},${endNode.y}`;

        // If start is same as end, return empty path
        if (startKey === endKey) return [];

        // Check if target is walkable
        if (!this.isWalkable(endNode.x, endNode.y)) {
            return [];
        }

        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        const gScore = new Map();
        const fScore = new Map();

        openSet.push(startNode);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startNode, endNode));

        while (openSet.length > 0) {
            // Get node with lowest fScore
            let current = openSet.reduce((prev, curr) => {
                const prevScore = fScore.get(`${prev.x},${prev.y}`) || Infinity;
                const currScore = fScore.get(`${curr.x},${curr.y}`) || Infinity;
                return prevScore < currScore ? prev : curr;
            });

            const currentKey = `${current.x},${current.y}`;

            if (current.x === endNode.x && current.y === endNode.y) {
                return this.reconstructPath(cameFrom, current);
            }

            // Remove current from openSet
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(currentKey);

            // Neighbors (Up, Down, Left, Right in Grid Space)
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (closedSet.has(neighborKey)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                const tile = this.isoTilemap.getTile(neighbor.x, neighbor.y);
                const movementCost = tile ? tile.cost : 1;

                const tentativeGScore = (gScore.get(currentKey) || 0) + movementCost;

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, endNode));
            }
        }

        return []; // No path found
    }

    /**
     * Versão assíncrona do A* que divide o processamento em múltiplos frames
     * para evitar travar a thread principal (Time-Slicing).
     */
    async findPathAsync(startWorldX, startWorldY, endWorldX, endWorldY) {
        const startNode = this.worldToGrid(startWorldX, startWorldY);
        const endNode = this.worldToGrid(endWorldX, endWorldY);

        const startKey = `${startNode.x},${startNode.y}`;
        const endKey = `${endNode.x},${endNode.y}`;

        if (startKey === endKey) return [];
        if (!this.isWalkable(endNode.x, endNode.y)) return [];

        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        openSet.push(startNode);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startNode, endNode));

        // Configuração do Time-Slicing
        const TIME_BUDGET_MS = 3; // Máximo de tempo gasto por frame neste cálculo
        let startTime = performance.now();

        while (openSet.length > 0) {
            // Verifica orçamento de tempo
            if (performance.now() - startTime > TIME_BUDGET_MS) {
                // Pausa e espera o próximo frame (libera a UI)
                await new Promise(resolve => requestAnimationFrame(resolve));
                startTime = performance.now(); // Reseta timer
            }

            // Lógica padrão A* (igual ao síncrono)
            let current = openSet.reduce((prev, curr) => {
                const prevScore = fScore.get(`${prev.x},${prev.y}`) || Infinity;
                const currScore = fScore.get(`${curr.x},${curr.y}`) || Infinity;
                return prevScore < currScore ? prev : curr;
            });

            const currentKey = `${current.x},${current.y}`;
            if (current.x === endNode.x && current.y === endNode.y) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(currentKey);

            const neighbors = [
                { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (closedSet.has(neighborKey) || !this.isWalkable(neighbor.x, neighbor.y)) continue;

                // ... (Lógica de vizinhos idêntica ao método síncrono, omitida para brevidade se fosse duplicada, mas necessária aqui)
                // Para garantir funcionamento, repetimos a lógica interna do loop:
                const tile = this.isoTilemap.getTile(neighbor.x, neighbor.y);
                const movementCost = tile ? tile.cost : 1;
                const tentativeGScore = (gScore.get(currentKey) || 0) + movementCost;

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, endNode));
            }
        }
        return [];
    }

    isWalkable(x, y) {
        const tile = this.isoTilemap.getTile(x, y);
        return tile && tile.walkable === true;
    }

    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    reconstructPath(cameFrom, current) {
        const totalPath = [this.gridToWorld(current.x, current.y)];
        let currentKey = `${current.x},${current.y}`;

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = `${current.x},${current.y}`;
            totalPath.unshift(this.gridToWorld(current.x, current.y));
        }
        return totalPath;
    }
}