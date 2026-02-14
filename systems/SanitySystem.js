export default class SanitySystem {

    constructor(scene, player, flashlight) {
        this.scene = scene;
        this.player = player;
        this.flashlight = flashlight;

        this.sanity = 100;

        this.baseDrain = 2;      // por segundo
        this.darkDrain = 6;      // quando no escuro
        this.recoveryRate = 1;   // quando seguro

        this.overlay = scene.add.rectangle(
            0, 0, 1280, 720, 0xff0000, 0
        ).setOrigin(0).setScrollFactor(0);
    }

    update(delta) {

        let drain = 0;

        // Se lanterna desligada ou sem bateria
        if (!this.flashlight.isOn || this.flashlight.battery <= 0) {
            drain = this.darkDrain;
        } else {
            drain = this.baseDrain;
        }

        this.sanity -= drain * (delta / 1000);

        if (this.sanity < 0) this.sanity = 0;
        if (this.sanity > 100) this.sanity = 100;

        this.applyEffects();
    }

    applyEffects() {

        if (this.sanity < 50) {
            this.overlay.setAlpha((50 - this.sanity) / 100);
        } else {
            this.overlay.setAlpha(0);
        }

        // Tremor leve abaixo de 30
        if (this.sanity < 30) {
            this.scene.cameras.main.shake(50, 0.001);
        }
    }

    getSanity() {
        return this.sanity;
    }
}
