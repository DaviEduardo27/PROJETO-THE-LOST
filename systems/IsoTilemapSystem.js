import IsoUtils from '../utils/IsoUtils.js';

export default class IsoTilemapSystem {

    constructor(scene) {
        this.scene = scene;
        this.tiles = [];
        this.tileWidth = IsoUtils.TILE_WIDTH;
        this.tileHeight = IsoUtils.TILE_HEIGHT;
    }

    generateGrid(widthInTiles, heightInTiles) {
        // Initialize 2D array
        this.tiles = [];

        for (let i = 0; i < widthInTiles; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < heightInTiles; j++) {
                
                // Calculate cartesian world position
                const cartX = i * (this.tileWidth / 2);
                const cartY = j * (this.tileHeight / 2);

                // Convert to iso
                const iso = IsoUtils.cartToIso(cartX, cartY);

                // Create graphics
                const graphics = this.scene.add.graphics();

                // Draw diamond
                const color = ((i + j) % 2 === 0) ? 0x2c3e50 : 0x34495e;
                graphics.fillStyle(color, 1);
                
                graphics.beginPath();
                graphics.moveTo(0, this.tileHeight / 2);
                graphics.lineTo(this.tileWidth / 2, 0);
                graphics.lineTo(this.tileWidth, this.tileHeight / 2);
                graphics.lineTo(this.tileWidth / 2, this.tileHeight);
                graphics.closePath();
                graphics.fillPath();

                // Position the graphics at isoX, isoY
                graphics.x = iso.x;
                graphics.y = iso.y;

                // Set depth using IsoUtils.getIsoDepth(cartX, cartY)
                // We apply a large negative offset to ensure tiles are rendered below the player (depth 0)
                // and other game entities like the flashlight overlay (depth 900).
                const depthOffset = -4000;
                graphics.setDepth(IsoUtils.getIsoDepth(cartX, cartY) + depthOffset);

                // Store tile data
                this.tiles[i][j] = {
                    cartX,
                    cartY,
                    isoX: iso.x,
                    isoY: iso.y,
                    graphics,
                    walkable: true,
                    cost: 1,
                    type: "floor"
                };
            }
        }
    }

    updateDepth() {
        const depthOffset = -4000;
        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i]) continue;
            for (let j = 0; j < this.tiles[i].length; j++) {
                const tile = this.tiles[i][j];
                if (tile && tile.graphics) {
                    tile.graphics.setDepth(IsoUtils.getIsoDepth(tile.cartX, tile.cartY) + depthOffset);
                }
            }
        }
    }

    getTile(x, y) {
        if (!this.tiles[x]) return null;
        return this.tiles[x][y] || null;
    }

    setWalkable(x, y, value) {
        const tile = this.getTile(x, y);
        if (tile) tile.walkable = value;
    }

    setTileType(x, y, type) {
        const tile = this.getTile(x, y);
        if (tile) tile.type = type;
    }

    setTileCost(x, y, cost) {
        const tile = this.getTile(x, y);
        if (tile) tile.cost = cost;
    }
}

// Grid now supports dynamic topology changes (walkable, cost, type)
// Ready for WorldTopology integration
