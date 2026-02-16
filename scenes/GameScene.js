import FlashlightSystem from '../systems/FlashlightSystem.js';
import SanitySystem from '../systems/SanitySystem.js';
import EventSystem from '../systems/EventSystem.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import DoorSystem from '../systems/DoorSystem.js';
import InventorySystem from '../systems/InventorySystem.js';
import KeyItem from '../systems/KeyItem.js';
import WorldTopologySystem from '../systems/WorldTopologySystem.js';
import IsoUtils from '../utils/IsoUtils.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
        this.load.audio('whisper', 'assets/audio/whisper.ogg');
        this.load.audio('door', 'assets/audio/door.ogg');
        this.load.audio('note', 'assets/audio/note.ogg');
        this.load.audio('doorOpen', 'assets/audio/doorOpen.ogg');

    }

    create() {

    // Fundo maior que a tela
    this.add.rectangle(0, 0, 2000, 2000, 0x0a0a0a).setOrigin(0);
    
    // Estado do mundo para eventos aleatórios
    this.worldState = 'normal'; // normal | distorted

    // Mundo maior que a tela
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // Player - REFATORADO: Separação de Body e Sprite
    // Body: Invisível, usado para física e lógica
    this.player = this.add.rectangle(1000, 1000, 32, 32, 0x000000, 0);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Sprite: Visual, apenas segue o body
    this.playerSprite = this.add.sprite(1000, 1000, 'player');

    // 1. Sistema de lanterna (Base)
    this.flashlight = new FlashlightSystem(this, this.player);

    // 2. Sistema de sanidade (Depende da Lanterna)
    this.sanitySystem = new SanitySystem(
        this,
        this.player,
        this.flashlight
    );

    // 3. Evento aleatório (Depende de Sanidade e Lanterna)
    this.eventSystem = new EventSystem(
        this,
        this.sanitySystem,
        this.flashlight
    );

    // Interações
    this.interactionSystem = new InteractionSystem(
        this,
        this.player,
        this.eventSystem
    );

    // Nota - REFATORADO
    const noteBody = this.add.rectangle(1200, 1000, 40, 40, 0x000000, 0);
    this.physics.add.existing(noteBody);
    const noteIso = IsoUtils.cartToIso(noteBody.x, noteBody.y);

    const noteSprite = this.add.rectangle(
        noteIso.x,
        noteIso.y,
        40,
        40,
        0xffffff
    );

    noteSprite.setDepth(noteSprite.y);


    this.interactionSystem.addObject({
        id: 'note1',
        body: noteBody,
        sprite: noteSprite,
        description: 'Uma nota rasgada... "Ele nunca saiu daqui."',
        onInteract: () => {
            console.log("Pista coletada!");
            this.sound.play('note');
        }
    });
    this.door = new DoorSystem(this, 1400, 1000);

    this.physics.add.collider(this.player, this.door.body);

    // Configuração WASD mantendo a estrutura de 'cursors' para compatibilidade
    this.cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 🎥 CÂMERA CINEMATOGRÁFICA
    this.cameras.main.startFollow(this.playerSprite, true, 0.05, 0.05);

    // Deadzone central
    this.cameras.main.setDeadzone(200, 150);

    // Leve zoom
    this.cameras.main.setZoom(1.1);

    this.keyF = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.F
    );

    this.keyE = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
    );

    // Hud de bateria

    this.batteryText = this.add.text(20, 20, 'Bateria: 100%', {
    fontSize: '18px',
    fill: '#ffffff'
    }).setScrollFactor(0);

    this.sanityText = this.add.text(20, 50, 'Sanidade: 100%', {
        fontSize: '18px',
        fill: '#00ffcc'
    }).setScrollFactor(0);

    // Sistema de inventário
    this.inventorySystem = new InventorySystem(this);

    // Chave para o porão
    this.key = new KeyItem(this, 1200, 1000, 'basement_key');

    // Sistema de topologia do mundo
    this.worldTopology = new WorldTopologySystem(this);

    this.worldTopology.generateWorld();
    this.worldTopology.generateAlternativeWorld();
}

    // Alterna o estado do mundo para eventos aleatórios
    changeWorld() {

    if (this.worldState === 'normal') {
        this.worldState = 'distorted';
        this.applyDistortedWorld();
    } else {
        this.worldState = 'normal';
        this.applyNormalWorld();
    }
}


// Aplica efeitos de mundo distorcido
    applyDistortedWorld() {

    console.log("🌫️ O mundo mudou...");

    this.cameras.main.shake(500, 0.02);

    if (this.generatedWalls) {
        this.generatedWalls.forEach(wall => {
            wall.body.x += Phaser.Math.Between(-50, 50);
            wall.body.y += Phaser.Math.Between(-50, 50);
            
            const iso = IsoUtils.cartToIso(wall.body.x, wall.body.y);
            wall.sprite.x = iso.x;
            wall.sprite.y = iso.y;
            wall.sprite.setDepth(iso.y);
        });
    }

}


    update(time, delta) {

        const speed = 200;

        this.batteryText.setText(
            'Bateria: ' + Math.floor(this.flashlight.battery) + '%'
        );

        if (this.flashlight.battery < 20) {
            this.batteryText.setColor('#ff0000');
        } else {
            this.batteryText.setColor('#ffffff');
        }

        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        }
        if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }
        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        }
        if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        // Atualiza posição da sprite do player para seguir o body
        const isoPos = IsoUtils.cartToIso(this.player.x, this.player.y);

        this.playerSprite.x = isoPos.x;
        this.playerSprite.y = isoPos.y;

        // Depth global isométrico
        this.playerSprite.setDepth(IsoUtils.getIsoDepth(this.player.x, this.player.y));


        if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
            this.flashlight.toggle();
        }

        this.flashlight.update(delta, this.cursors);

        this.sanitySystem.update(delta);

        this.sanityText.setText(
            'Sanidade: ' + Math.floor(this.sanitySystem.getSanity()) + '%'
        );

        if (this.sanitySystem.getSanity() < 30) {
            this.sanityText.setColor('#ff0000');
        } else {
            this.sanityText.setColor('#00ffcc');
        }

        this.eventSystem.update(delta);

        this.interactionSystem.update(this.player);
        this.door.update(this.player);

        if (this.key) this.key.update();

        this.generatedWalls?.forEach(wall => {
            const iso = IsoUtils.cartToIso(wall.body.x, wall.body.y);
            wall.sprite.x = iso.x;
            wall.sprite.y = iso.y;
            wall.sprite.depth = wall.sprite.y;
        });

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.interactionSystem.tryInteract();
            this.door.interact();
        }
    }

}