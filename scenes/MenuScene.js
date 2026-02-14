export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(640, 300, 'THE LOST', {
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const startText = this.add.text(640, 450, 'Pressione ENTER', {
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });
    }
}
