export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
    }

    create() {
        this.player = this.physics.add.sprite(640, 360, 'player');
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        const speed = 200;

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
    }
}
