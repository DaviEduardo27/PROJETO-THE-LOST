import FlashlightSystem from '../systems/FlashlightSystem.js';
import SanitySystem from '../systems/SanitySystem.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
    }

    create() {

    // Fundo maior que a tela
    this.add.rectangle(0, 0, 2000, 2000, 0x0a0a0a).setOrigin(0);

    // Mundo maior que a tela
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // Player
    this.player = this.physics.add.sprite(1000, 1000, 'player');
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    // 🎥 CÂMERA CINEMATOGRÁFICA
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    // Deadzone central
    this.cameras.main.setDeadzone(200, 150);

    // Leve zoom
    this.cameras.main.setZoom(1.1);

    // Sistema de lanterna
    this.flashlight = new FlashlightSystem(this, this.player);

    this.keyF = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.F);

    // Hud de bateria

    this.batteryText = this.add.text(20, 20, 'Bateria: 100%', {
    fontSize: '18px',
    fill: '#ffffff'
}).setScrollFactor(0);

// Sistema de sanidade
this.sanitySystem = new SanitySystem(
    this,
    this.player,
    this.flashlight
);

this.sanityText = this.add.text(20, 50, 'Sanidade: 100%', {
    fontSize: '18px',
    fill: '#00ffcc'
}).setScrollFactor(0);


}


   update(time, delta) {

    const speed = 200;

    this.sanitySystem.update(delta);

    this.sanityText.setText(
        'Sanidade: ' + Math.floor(this.sanitySystem.getSanity()) + '%'
    );

    if (this.sanitySystem.getSanity() < 30) {
        this.sanityText.setColor('#ff0000');
    } else {
        this.sanityText.setColor('#00ffcc');
    }

    this.batteryText.setText(
    'Bateria: ' + Math.floor(this.flashlight.battery) + '%'
    );

    if (this.flashlight.battery < 20) {
        this.batteryText.setColor('#ff0000');
    } else {
        this.batteryText.setColor('#ffffff');
    }

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
    }
    if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
    }
    if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
    }
    if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
        this.flashlight.toggle();
    }

    this.flashlight.update(delta);
}}