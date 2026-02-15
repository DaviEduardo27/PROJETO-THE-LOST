export default class DoorSystem {

    constructor(scene, x, y) {
    this.scene = scene;

    this.state = 'closed'; // fechado | aberto | trancado

    this.sprite = scene.add.rectangle(x, y, 60, 100, 0x654321);
    // Cria corpo estático (true) para colisão sólida
    scene.physics.add.existing(this.sprite, true);

    this.interactionDistance = 80;
    
    // Chave necessária para abrir a porta
    this.requiredKey = 'basement_key';
    this.state = 'locked';

    }

// Comportamento aleatório da porta baseado na sanidade do jogador
    update(player) {

    // Se o jogador estiver lendo algo, não mostra o texto da porta
    if (this.scene.interactionSystem && this.scene.interactionSystem.isReading) return;

    const dist = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        this.sprite.x,
        this.sprite.y
    );

    if (dist < this.interactionDistance) {
        this.scene.interactionSystem.infoText.setText('Pressione E para interagir com a porta');
        this.canInteract = true;
    } else {
        this.canInteract = false;
    }

    this.handleInsanityBehavior();
    }

    // Comportamento da porta baseado na sanidade do jogador
    handleInsanityBehavior() {

    const sanity = this.scene.sanitySystem.currentSanity;

    if (this.state === 'open') {

        if (sanity < 70 && sanity >= 40) {
            this.randomClose(0.001);
        }

        if (sanity < 40 && sanity >= 10) {
            this.randomClose(0.003);
        }

        if (sanity < 10) {
            this.randomSlam(0.005);
        }
        }
    }

    // Fecha a porta aleatoriamente com base na probabilidade
    randomClose(chance) {
        if (Math.random() < chance) {
        this.close();
     }
    }

    randomSlam(chance) {
        if (Math.random() < chance) {
        this.slam();
        }
    }


    // Fecha a porta aleatoriamente com base na probabilidade
    interact() {

    if (!this.canInteract) return;

    if (this.state === 'locked') {

        if (this.scene.inventorySystem.hasItem(this.requiredKey)) {
            console.log("🔓 Porta destrancada!");
            this.state = 'closed';
        } else {
            console.log("🚫 Está trancada.");
            return;
        }
    }

    if (this.state === 'closed') {
        this.open();
    } else if (this.state === 'open') {
        this.close();
    }
}


    open() {
    this.state = 'open';

    this.sprite.setFillStyle(0xaaaaaa);
    this.sprite.body.enable = false; // remove colisão

    this.scene.sound.play('door');
    }

    close() {
    this.state = 'closed';

    this.sprite.setFillStyle(0x654321);
    this.sprite.body.enable = true; // ativa colisão

    this.scene.sound.play('door');
    }

    // Tranca a porta
    slam() {
    this.state = 'closed';

    this.sprite.setFillStyle(0x654321);
    this.sprite.body.enable = true;

    this.scene.cameras.main.shake(300, 0.02);
    this.scene.sound.play('door');

    if (this.scene.sanitySystem.currentSanity < 30) {
        this.scene.changeWorld();
    }
    }

}
