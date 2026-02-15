export default class KeyItem {

    constructor(scene, x, y, keyName) {
        this.scene = scene;
        this.keyName = keyName;

        this.sprite = scene.add.circle(x, y, 10, 0xffff00);
        scene.physics.add.existing(this.sprite);

        this.sprite.body.setImmovable(true);
        this.sprite.body.allowGravity = false;

        scene.physics.add.overlap(
            scene.player,
            this.sprite,
            () => this.collect(),
            null,
            this
        );
    }

    collect() {
        this.scene.inventorySystem.addItem(this.keyName);
        this.sprite.destroy();
    }
}
