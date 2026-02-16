export default class InteractionSystem {

    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.isReading = false;

        this.interactionDistance = 80;

        this.infoText = scene.add.text(
            640, 650,
            '',
            {
                fontSize: '18px',
                fill: '#ffffff',
                wordWrap: { width: 1000 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);
    }

    addObject(config) {

        const obj = {
            id: config.id,
            body: config.body,
            sprite: config.sprite,
            description: config.description,
            onInteract: config.onInteract,
            isCollected: false
        };

        this.objects.push(obj);
    }

    update(player) {

        if (this.isReading) {
            // Tremor leve para aumentar a tensão
            const shake = 1;
            this.infoText.setPosition(
                640 + Phaser.Math.Between(-shake, shake),
                650 + Phaser.Math.Between(-shake, shake)
            );
            return;
        }
        this.infoText.setPosition(640, 650);

        let closest = null;
        let minDist = this.interactionDistance;

        this.objects.forEach(obj => {

            const dist = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                obj.body.x,
                obj.body.y
            );

            if (dist < minDist && !obj.isCollected) {
                closest = obj;
                minDist = dist;
            }
        });

        if (closest) {
            this.infoText.setText('Pressione E para interagir');
            this.currentObject = closest;
        } else {
            this.infoText.setText('');
            this.currentObject = null;
        }
    }

    tryInteract() {

        if (!this.currentObject) return;

        this.isReading = true;
        this.infoText.setText('');

        const fullText = this.currentObject.description;
        let currentChar = 0;

        // Efeito Typewriter: Adiciona uma letra a cada 50ms
        this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                this.infoText.text += fullText[currentChar];
                currentChar++;
            },
            repeat: fullText.length - 1
        });

        if (this.currentObject.onInteract) {
            this.currentObject.onInteract();
        }

        this.currentObject.isCollected = true;

        // Calcula o tempo total: tempo para digitar + 2 segundos de leitura extra
        const typingDuration = fullText.length * 50;
        const extraReadTime = 2000;

        this.scene.time.delayedCall(typingDuration + extraReadTime, () => {
            this.infoText.setText('');
            this.isReading = false;
        });
    }
}
