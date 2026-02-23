import IsoUtils from '../utils/IsoUtils.js';

export default class DoorSystem {

    constructor(scene, x, y) {
        this.scene = scene;
        this.isOpen = false;
        this.x = x;
        this.y = y;

        // Sprite Visual
        this.sprite = scene.add.rectangle(x, y, 20, 100, 0x8B4513);
        
        // Body Físico
        this.body = scene.add.rectangle(x, y, 20, 100, 0x000000, 0);
        scene.physics.add.existing(this.body, true); // Corpo estático

        this.updateVisuals();
    }

    // Interface requerida pelo InteractionSystem
    onInteract() {
        this.toggle();
    }

    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    open() {
        this.isOpen = true;
        this.scene.sound.play('doorOpen');
        this.body.body.enable = false; // Desabilita colisão
        this.updateVisuals();
    }

    close() {
        this.isOpen = false;
        this.scene.sound.play('door');
        this.body.body.enable = true; // Habilita colisão
        this.updateVisuals();
    }

    updateVisuals() {
        if (this.isOpen) {
            this.sprite.setAlpha(0.3); // Visual fantasma/aberto
            this.sprite.angle = -90;   // Rotação visual
        } else {
            this.sprite.setAlpha(1);
            this.sprite.angle = 0;
        }
    }

    update() {
        // Lógica para fechar sozinha ou insanidade pode ir aqui
    }
}
