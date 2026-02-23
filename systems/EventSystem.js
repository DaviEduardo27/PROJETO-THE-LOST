export default class EventSystem {

    constructor(scene, sanitySystem, flashlight) {
        this.scene = scene;
        this.sanitySystem = sanitySystem;
        this.flashlight = flashlight;

        this.insanityTimer = 0;
        this.cooldown = 0;
    }

    // Factory method para Papel Interagível
    createPaper(x, y) {
        const paper = this.scene.add.rectangle(x, y, 20, 20, 0xffffff);
        this.scene.physics.add.existing(paper);
        
        // Retorna objeto compatível com InteractionSystem
        return {
            sprite: paper,
            body: paper.body,
            x: x,
            y: y,
            onInteract: () => {
                console.log("📄 Papel lido: 'Eles estão observando...'");
                this.scene.sound.play('note');
                paper.destroy(); // Destrói visual
            }
        };
    }

    update(delta) {

        if (this.cooldown > 0) {
            this.cooldown -= delta;
            return;
        }

        const sanity = this.sanitySystem.getSanity();
        let chance = this.calculateChance(sanity);

        if (Math.random() < chance * (delta / 1000)) {
            this.triggerRandomEvent();
            this.cooldown = 3000; // 3 segundos entre eventos
        }
    }

    calculateChance(sanity) {

        if (sanity > 80) return 0.02;
        if (sanity > 50) return 0.05;
        if (sanity > 20) return 0.1;
        return 0.2;
    }

    triggerRandomEvent() {

        const events = [
            () => this.whisper(),
            () => this.lightFlicker(),
            () => this.cameraJolt(),
            () => this.briefDarkness(),
            () => this.doorEvent(),
            () => this.noteEvent()
        ];
        
        const randomEvent = events[
            Math.floor(Math.random() * events.length)
        ];

        randomEvent();
    }

    whisper() {
        console.log("👂 Sussurro...");
        this.scene.sound.play('whisper');
    }

    lightFlicker() {
        console.log("💡 Luz piscando...");
        this.flashlight.isOn = false;

        this.scene.time.delayedCall(300, () => {
            this.flashlight.isOn = true;
        });
    }

    cameraJolt() {
        console.log("🎥 Tremor súbito...");
        this.scene.cameras.main.shake(200, 0.01);
    }

    briefDarkness() {
        console.log("🌑 Escuridão momentânea...");
        this.flashlight.isOn = false;

        this.scene.time.delayedCall(800, () => {
            this.flashlight.isOn = true;
        });
    }
    doorEvent() {

    if (this.scene.door && this.scene.door.isOpen) {
        console.log("🗝️ Porta bate sozinha!");
        this.scene.door.close();
    }
    }

}
