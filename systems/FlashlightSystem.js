export default class FlashlightSystem {

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.battery = 100;
        this.isOn = true;
        this.drainRate = 5;

        // Camada de escuridão
        this.darkOverlay = scene.add.rectangle(
            0, 0, 2000, 2000, 0x000000, 0.8
        ).setOrigin(0);

        // Graphics que será a máscara
        this.maskGraphics = scene.make.graphics({});
        this.lightMask = this.maskGraphics.createGeometryMask();
        this.lightMask.setInvertAlpha(true);

        this.darkOverlay.setMask(this.lightMask);

        // Graphics visual para a cor da luz
        this.lightGraphics = scene.add.graphics();
    }

    update(delta, cursors) {

        if (this.isOn && this.battery > 0) {
            this.battery -= this.drainRate * (delta / 1000);

            if (this.battery <= 0) {
                this.battery = 0;
                this.isOn = false;
            }
        }

        this.renderCone(cursors);
    }

    toggle() {
        if (this.battery > 0) {
            this.isOn = !this.isOn;
        }
    }

    renderCone(cursors) {

        this.maskGraphics.clear();
        this.lightGraphics.clear();

        if (!this.isOn || this.battery <= 0) return;

        const angle = this.getDirectionAngle(cursors);
        const coneLength = 400;
        const coneWidth = Math.PI / 6;

        this.maskGraphics.fillStyle(0xffffff);

        this.maskGraphics.beginPath();
        this.maskGraphics.moveTo(this.player.x, this.player.y);

        this.maskGraphics.arc(
            this.player.x,
            this.player.y,
            coneLength,
            angle - coneWidth,
            angle + coneWidth
        );

        this.maskGraphics.closePath();
        this.maskGraphics.fillPath();

        // Desenha a cor amarelada da luz
        this.lightGraphics.fillStyle(0xffdd00, 0.3);

        this.lightGraphics.beginPath();
        this.lightGraphics.moveTo(this.player.x, this.player.y);

        this.lightGraphics.arc(
            this.player.x,
            this.player.y,
            coneLength,
            angle - coneWidth,
            angle + coneWidth
        );

        this.lightGraphics.closePath();
        this.lightGraphics.fillPath();
    }

    getDirectionAngle(cursors) {

        if (cursors.left.isDown) return Math.PI;
        if (cursors.right.isDown) return 0;
        if (cursors.up.isDown) return -Math.PI / 2;
        if (cursors.down.isDown) return Math.PI / 2;

        return 0; // padrão olhando para direita
    }
}
