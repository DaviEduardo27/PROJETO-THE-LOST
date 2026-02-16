import IsoUtils from '../utils/IsoUtils.js';

export default class DoorSystem {

    constructor(scene, x, y) {
    this.scene = scene;

    // Body Físico (Invisível)
    this.body = scene.add.rectangle(x, y, 60, 100, 0x000000, 0);
    // Cria corpo estático (true) para colisão sólida
    scene.physics.add.existing(this.body, true);

    // Sprite Visual
    const iso = IsoUtils.cartToIso(x, y);
    this.sprite = scene.add.rectangle(iso.x, iso.y, 60, 100, 0x654321);
    this.sprite.setDepth(iso.y);

    this.interactionDistance = 80;
    
    // Chave necessária para abrir a porta
    this.requiredKey = 'basement_key';
    this.state = 'locked';

    }

// Comportamento aleatório da porta baseado na sanidade do jogador
    update(player) {

    // Atualiza posição da sprite para seguir o body (considerando isometria)
    const iso = IsoUtils.cartToIso(this.body.x, this.body.y);

    this.sprite.x = iso.x;
    this.sprite.y = iso.y;
    this.sprite.setDepth(
        IsoUtils.getIsoDepth(this.body.x, this.body.y)
    );


    // Se o jogador estiver lendo algo, não mostra o texto da porta
    if (this.scene.interactionSystem && this.scene.interactionSystem.isReading) return;

    const dist = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        this.body.x,
        this.body.y
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

// Verifica se a porta deve causar uma transição de mundo com base na sanidade do jogador
handleWorldTransition() { 

    const sanity = this.scene.sanitySystem.currentSanity;

    if (sanity < 50) {

        // pequena pausa dramática
        this.scene.time.delayedCall(300, () => {

            this.scene.cameras.main.fadeOut(200);

            this.scene.time.delayedCall(200, () => {

                this.scene.worldTopology.switchWorld();

                this.scene.cameras.main.fadeIn(200);

            });

        });
    }
    
    const iso = IsoUtils.cartToIso(this.body.x, this.body.y);

    this.sprite.x = iso.x;
    this.sprite.y = iso.y;

    this.sprite.depth = this.sprite.y;
}


    open() {
    this.state = 'open';

    this.sprite.setFillStyle(0xaaaaaa);
    this.body.body.enable = false; // remove colisão do body

    this.scene.sound.play('door'); // Som de porta abrindo

    this.handleWorldTransition(); // Verifica se deve mudar o mundo
    }

    close() {
    this.state = 'closed';

    this.sprite.setFillStyle(0x654321);
    this.body.body.enable = true; // ativa colisão do body

    this.scene.sound.play('door');
    }

    // Tranca a porta
    slam() {
    this.state = 'closed';

    this.sprite.setFillStyle(0x654321);
    this.body.body.enable = true;

    this.scene.cameras.main.shake(300, 0.02);
    this.scene.sound.play('door');

    if (this.scene.sanitySystem.currentSanity < 30) {
        this.scene.changeWorld();
    }
    }

}
