import IsoUtils from '../utils/IsoUtils.js';

export default class WorldTopologySystem {

    constructor(scene) {
        this.scene = scene;
        this.seed = 0;
        this.currentLayout = [];
        this.alternativeLayout = [];
    }

    generateLayout(seed) {
        Phaser.Math.RND.sow([seed]);

        const layout = [];

        const roomCount = Phaser.Math.Between(3, 6);

        for (let i = 0; i < roomCount; i++) {
            layout.push({
                x: 800 + i * 400,
                y: 1000 + Phaser.Math.Between(-200, 200),
                width: 300,
                height: 200
            });
        }

        return layout;
    }

    buildLayout(layout) {

        if (this.scene.generatedWalls) {
            this.scene.generatedWalls.forEach(w => {
                if (w.body) w.body.destroy();
                if (w.sprite) w.sprite.destroy();
            });
        }

        this.scene.generatedWalls = [];

        layout.forEach(room => {
            // Body Físico (Invisível)
            const body = this.scene.add.rectangle(
                room.x,
                room.y,
                room.width,
                room.height,
                0x000000,
                0
            );
            this.scene.physics.add.existing(body, true);

            // Sprite Visual
            const iso = IsoUtils.cartToIso(room.x, room.y);
            const sprite = this.scene.add.rectangle(
                iso.x,
                iso.y,
                room.width,
                room.height,
                0x333333
            );
            sprite.depth = sprite.y;

            this.scene.generatedWalls.push({
                body,
                sprite
            });
        });
    }

    generateWorld() {
        this.seed++;
        this.currentLayout = this.generateLayout(this.seed);
        this.buildLayout(this.currentLayout);
    }

    generateAlternativeWorld() {
        this.seed += 999;
        this.alternativeLayout = this.generateLayout(this.seed);
    }

    switchWorld() {
        if (this.scene.worldState === 'normal') {
            this.scene.worldState = 'distorted';
            this.buildLayout(this.alternativeLayout);
        } else {
            this.scene.worldState = 'normal';
            this.buildLayout(this.currentLayout);
        }
    }
}
