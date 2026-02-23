import IsoUtils from '../utils/IsoUtils.js';
import { bus } from '../utils/EventBus.js';

export default class WorldTopologySystem {

    constructor(scene, isoTilemap, worldId = 'reality_A') {
        this.scene = scene;
        this.isoTilemap = isoTilemap;
        this.walls = null;
        this.worldId = worldId; // Identificador da realidade (A, B, Nightmare, etc)
        this.version = 1;       // Versão incremental da topologia
    }

    createApartment() {
        // Remove paredes antigas se houver
        if (this.walls) {
            this.walls.clear(true, true);
        }

        this.walls = this.scene.physics.add.staticGroup();

        // Configuração do Layout (Coordenadas Top-Down 2D)
        // Sala (Grande) + Quarto (Menor ao lado)
        
        const wallThickness = 20;
        const centerX = 1000;
        const centerY = 1000;
        
        // --- Paredes da Sala ---
        // Topo
        this.createWall(centerX, centerY - 300, 600, wallThickness);
        // Baixo
        this.createWall(centerX, centerY + 300, 600, wallThickness);
        // Esquerda
        this.createWall(centerX - 300, centerY, wallThickness, 600);
        
        // --- Paredes do Quarto (Anexo à direita) ---
        // Topo (Extensão)
        this.createWall(centerX + 400, centerY - 300, 200, wallThickness);
        // Baixo (Extensão)
        this.createWall(centerX + 400, centerY + 100, 200, wallThickness);
        // Direita (Fim do quarto)
        this.createWall(centerX + 500, centerY - 100, wallThickness, 400);
        
        // Parede Divisória (com buraco para porta)
        // Parte superior da divisória
        this.createWall(centerX + 300, centerY - 200, wallThickness, 200);
        // Parte inferior da divisória
        this.createWall(centerX + 300, centerY + 200, wallThickness, 200);

        return this.walls;
    }

    createWall(x, y, width, height) {
        // Body Físico (A parede real)
        const wall = this.scene.add.rectangle(x, y, width, height, 0x555555);
        this.walls.add(wall);
        
        // Atualiza o corpo para corresponder ao tamanho
        wall.body.updateFromGameObject();
    }

    blockTile(x, y) {
        this.isoTilemap.setWalkable(x, y, false);
        this.isoTilemap.setTileType(x, y, "wall");
    }

    unblockTile(x, y) {
        this.isoTilemap.setWalkable(x, y, true);
        this.isoTilemap.setTileType(x, y, "floor");
    }

    setHighCostZone(centerX, centerY, radius) {
        const tiles = this.isoTilemap.tiles;
        const startX = Math.max(0, Math.floor(centerX - radius));
        const endX = Math.min(tiles.length, Math.ceil(centerX + radius));

        for (let x = startX; x < endX; x++) {
            if (!tiles[x]) continue;
            const startY = Math.max(0, Math.floor(centerY - radius));
            const endY = Math.min(tiles[x].length, Math.ceil(centerY + radius));

            for (let y = startY; y < endY; y++) {
                const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (dist <= radius) {
                    this.isoTilemap.setTileCost(x, y, 5);
                }
            }
        }
    }

    resetCosts() {
        const tiles = this.isoTilemap.tiles;
        for (let x = 0; x < tiles.length; x++) {
            if (!tiles[x]) continue;
            for (let y = 0; y < tiles[x].length; y++) {
                this.isoTilemap.setTileCost(x, y, 1);
            }
        }
    }

    applyDistortion(centerX, centerY, radius) {
        const tiles = this.isoTilemap.tiles;
        const startX = Math.max(0, Math.floor(centerX - radius));
        const endX = Math.min(tiles.length, Math.ceil(centerX + radius));

        for (let x = startX; x < endX; x++) {
            if (!tiles[x]) continue;
            const startY = Math.max(0, Math.floor(centerY - radius));
            const endY = Math.min(tiles[x].length, Math.ceil(centerY + radius));

            for (let y = startY; y < endY; y++) {
                const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (dist <= radius) {
                    if (Math.random() > 0.7) {
                        this.blockTile(x, y);
                    } else {
                        this.isoTilemap.setTileCost(x, y, 5);
                    }
                }
            }
        }

        // Incrementa versão
        this.version++;

        // Notifica o sistema que a topologia mudou
        bus.emit('topologyChanged', { type: 'distortion', worldId: this.worldId, version: this.version, x: centerX, y: centerY });
    }

    resetWorld() {
        const tiles = this.isoTilemap.tiles;
        for (let x = 0; x < tiles.length; x++) {
            if (!tiles[x]) continue;
            for (let y = 0; y < tiles[x].length; y++) {
                this.isoTilemap.setWalkable(x, y, true);
                this.isoTilemap.setTileCost(x, y, 1);
                this.isoTilemap.setTileType(x, y, "floor");
            }
        }

        // Incrementa versão (reset também é uma mudança de estado)
        this.version++;

        // Notifica o sistema que a topologia foi restaurada
        bus.emit('topologyChanged', { type: 'reset', worldId: this.worldId, version: this.version });
    }
}
