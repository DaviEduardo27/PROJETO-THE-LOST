import IsoUtils from '../utils/IsoUtils.js';

export default class KeyItem {

    constructor(scene, x, y, keyName) {
        this.scene = scene;
        this.keyName = keyName;

        // Body Físico
        this.body = scene.add.rectangle(x, y, 32, 32, 0x000000, 0);
        scene.physics.add.existing(this.body);
        this.body.body.setImmovable(true);
        this.body.body.allowGravity = false;

        // Sprite Visual
        const iso = IsoUtils.cartToIso(x, y);
        this.sprite = scene.add.circle(iso.x, iso.y, 10, 0xffff00);
        this.sprite.setDepth(iso.y);

        scene.physics.add.overlap(
            scene.player,
            this.body,
            () => this.collect(),
            null,
            this
        );
    }

    update() {
        if (this.body && this.body.scene) {
            const iso = IsoUtils.cartToIso(this.body.x, this.body.y);
            this.sprite.x = iso.x;
            this.sprite.y = iso.y;
            this.sprite.setDepth(iso.y);
        }
    }

    collect() {
        this.scene.inventorySystem.addItem(this.keyName);
        this.body.destroy();
        this.sprite.destroy();
    }
}
