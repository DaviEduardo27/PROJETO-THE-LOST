export default class FlashlightSystem {

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.battery = 100;
        this.isOn = true;
        this.drainRate = 5;

        this.graphics = scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(999);
    }

    update(delta) {

        if (this.isOn && this.battery > 0) {
            this.battery -= this.drainRate * (delta / 1000);

            if (this.battery <= 0) {
                this.battery = 0;
                this.isOn = false;
            }
        }

        this.renderLight();
    }

    toggle() {
        if (this.battery > 0) {
            this.isOn = !this.isOn;
        }
    }

    renderLight() {

        this.graphics.clear();

        // Desenha escuridão
        this.graphics.fillStyle(0x000000, 0.95);
        this.graphics.fillRect(0, 0, 1280, 720);

        if (!this.isOn) return;

        // Ativa modo de recorte
        this.graphics.setBlendMode(Phaser.BlendModes.ERASE);

        // Desenha círculo de luz (usando posição da câmera)
        const cam = this.scene.cameras.main;

        const x = this.player.x - cam.scrollX;
        const y = this.player.y - cam.scrollY;

        this.graphics.fillCircle(x, y, 200);

        // Volta para modo normal
        this.graphics.setBlendMode(Phaser.BlendModes.NORMAL);
    }
}
