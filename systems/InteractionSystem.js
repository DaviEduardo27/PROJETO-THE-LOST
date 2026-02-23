export default class InteractionSystem {

    constructor(scene) {
        this.scene = scene;
        
        // Texto de UI para interação
        this.infoText = scene.add.text(
            scene.scale.width / 2, 
            scene.scale.height - 100,
            '',
            {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 10, y: 5 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000);
    }

    update(player, interactables) {
        let closest = null;
        let minDist = 100; // Raio de interação

        // Encontra o interagível mais próximo
        interactables.forEach(obj => {
            // Verifica se objeto é válido (não destruído)
            if (!obj || (obj.sprite && !obj.sprite.scene) || (obj.body && !obj.body.scene)) return;

            // Pega posição (trata estruturas diferentes de objetos)
            const targetX = obj.body ? obj.body.x : obj.x;
            const targetY = obj.body ? obj.body.y : obj.y;

            const dist = Phaser.Math.Distance.Between(
                player.x, 
                player.y, 
                targetX, 
                targetY
            );

            if (dist < minDist) {
                minDist = dist;
                closest = obj;
            }
        });

        if (closest) {
            this.infoText.setText('Pressione E');
            this.infoText.setVisible(true);
            this.currentFocus = closest;
        } else {
            this.infoText.setVisible(false);
            this.currentFocus = null;
        }
    }

    tryInteract() {
        if (this.currentFocus && typeof this.currentFocus.onInteract === 'function') {
            this.currentFocus.onInteract();
            
            // Limpa foco imediatamente para evitar interação dupla em objetos destruídos
            this.currentFocus = null; 
            this.infoText.setVisible(false);
        }
    }
}
