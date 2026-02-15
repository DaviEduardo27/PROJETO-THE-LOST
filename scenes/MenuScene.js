export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.audio('menuMusic', 'assets/audio/MusicaMenu.ogg');
        this.load.video('introVideo', 'assets/sprites/Game_Intro_Sequence_Psychological_Horror.mp4');
    }

    create() {
        const { width, height } = this.scale;

        // Video de fundo com glitch
        this.introVideo = this.add.video(width / 2, height / 2, 'introVideo');
        this.introVideo.play(true);
        // Adapta o vídeo para cobrir a tela inteira
        this.introVideo.setDisplaySize(width, height);
        this.introVideo.setAlpha(0.2); // Começa escuro/sutil

        // Música do Menu
        this.music = this.sound.add('menuMusic', { volume: 0.5, loop: true });
        this.music.play();

        // Graphics para o efeito de estática
        this.staticGraphics = this.add.graphics();

        // Título com efeito Glitch (Camadas RGB)
        const titleText = 'PROJECT THE LOST';
        const titleStyle = { fontSize: '64px', fill: '#ffffff', fontFamily: 'Arial Black' };

        // Camadas de glitch (Vermelho e Ciano)
        this.glitchRed = this.add.text(width / 2, height * 0.4, titleText, { ...titleStyle, fill: '#ff0000' })
            .setOrigin(0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7);
        
        this.glitchCyan = this.add.text(width / 2, height * 0.4, titleText, { ...titleStyle, fill: '#00ffff' })
            .setOrigin(0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7);

        // Texto principal
        this.mainTitle = this.add.text(width / 2, height * 0.4, titleText, titleStyle).setOrigin(0.5);

        const startText = this.add.text(width / 2, height * 0.6, 'Pressione ENTER', {
            fontSize: '24px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Efeito de piscar o texto (Tween)
        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.music.stop(); // Para a música ao iniciar o jogo
            this.scene.start('GameScene');
        });
    }

    update() {
        const { width, height } = this.scale;

        // Efeito de Estática Procedural
        this.staticGraphics.clear();
        
        // Desenha linhas aleatórias cinzas/brancas para simular ruído
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const w = Phaser.Math.Between(10, 200);
            const h = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
            
            this.staticGraphics.fillStyle(0xffffff, alpha);
            this.staticGraphics.fillRect(x, y, w, h);
        }

        // Ocasionalmente pisca a tela inteira levemente
        if (Math.random() > 0.95) {
            this.staticGraphics.fillStyle(0x000000, 0.1);
            this.staticGraphics.fillRect(0, 0, width, height);
        }

        // Animação de Glitch do Título
        const centerX = width / 2;
        const centerY = height * 0.4;

        if (Math.random() > 0.9) {
            const offset = Phaser.Math.Between(-5, 5);
            this.glitchRed.setPosition(centerX + offset, centerY + offset);
            this.glitchCyan.setPosition(centerX - offset, centerY - offset);
            this.mainTitle.setAlpha(0.8);
        } else {
            this.glitchRed.setPosition(centerX, centerY);
            this.glitchCyan.setPosition(centerX, centerY);
            this.mainTitle.setAlpha(1);
        }

        // Efeito de Glitch no Video
        if (Math.random() > 0.96) {
            this.introVideo.setAlpha(Phaser.Math.FloatBetween(0.4, 0.8));
        } else {
            this.introVideo.setAlpha(0.2);
        }
    }
}
