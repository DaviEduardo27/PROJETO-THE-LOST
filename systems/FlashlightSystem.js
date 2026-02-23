export default class FlashlightSystem {

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.isOn = true;
        this.battery = 100;

        // 1. O Overlay Escuro (Cobre o mundo todo)
        this.darkOverlay = scene.add.rectangle(
            0, 0, 4000, 4000, 0x000000
        ).setDepth(900); // Profundidade alta mas abaixo da UI

        // 2. O Graphics da Máscara (Define o que é visível)
        this.maskGraphics = scene.make.graphics({});
        
        // 3. Cria a Geometry Mask a partir do graphics
        const mask = this.maskGraphics.createGeometryMask();
        mask.setInvertAlpha(true); // Inverter: Desenha onde queremos VER
        
        // 4. Aplica máscara na escuridão
        this.darkOverlay.setMask(mask);

        // 5. Opcional: Efeito visual do feixe de luz (amarelado)
        this.lightConeGraphics = scene.add.graphics().setDepth(901);
    }

    update(delta, cursors) {
        this.maskGraphics.clear();
        this.lightConeGraphics.clear();

        if (!this.isOn) return;

        // Calcula Ângulo baseado no movimento ou última direção
        let angle = 0;
        
        if (cursors.left.isDown) angle = Math.PI;
        else if (cursors.right.isDown) angle = 0;
        else if (cursors.up.isDown) angle = -Math.PI / 2;
        else if (cursors.down.isDown) angle = Math.PI / 2;
        else {
            // Se não estiver movendo, mantém último ângulo ou padrão
            angle = this.lastAngle || 0;
        }
        
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            this.lastAngle = angle;
        } else {
            angle = this.lastAngle || 0;
        }

        const x = this.player.x;
        const y = this.player.y;
        const radius = 300;
        const width = Math.PI / 4; // 45 graus de largura

        // Desenha o "Recorte" na escuridão (A Máscara)
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.beginPath();
        this.maskGraphics.moveTo(x, y);
        this.maskGraphics.arc(x, y, radius, angle - width, angle + width);
        this.maskGraphics.closePath();
        this.maskGraphics.fillPath();
        
        // Desenha um pequeno círculo ao redor do player para não ficar no breu total
        this.maskGraphics.fillCircle(x, y, 40);

        // Desenha o visual amarelado
        this.lightConeGraphics.fillStyle(0xffffaa, 0.15);
        this.lightConeGraphics.beginPath();
        this.lightConeGraphics.moveTo(x, y);
        this.lightConeGraphics.arc(x, y, radius, angle - width, angle + width);
        this.lightConeGraphics.closePath();
        this.lightConeGraphics.fillPath();
    }
}
