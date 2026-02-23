import FlashlightSystem from '../systems/FlashlightSystem.js';
import SanitySystem from '../systems/SanitySystem.js';
import EventSystem from '../systems/EventSystem.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import DoorSystem from '../systems/DoorSystem.js';
import InventorySystem from '../systems/InventorySystem.js';
import KeyItem from '../systems/KeyItem.js';
import WorldTopologySystem from '../systems/WorldTopologySystem.js';
import IsoTilemapSystem from '../systems/IsoTilemapSystem.js';
import PathfindingSystem from '../systems/PathfindingSystem.js';
import IsoUtils from '../utils/IsoUtils.js';
import PathFollower from '../systems/PathFollower.js';
import EnemyAI from '../systems/EnemyAI.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('enemy', 'assets/sprites/player.png'); // Placeholder
        this.load.audio('whisper', 'assets/audio/whisper.ogg');
        this.load.audio('door', 'assets/audio/door.ogg');
        this.load.audio('note', 'assets/audio/note.ogg');
        this.load.audio('doorOpen', 'assets/audio/doorOpen.ogg');

    }

    create() {
        // 1. Setup World Bounds
        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.add.rectangle(0, 0, 2000, 2000, 0x111111).setOrigin(0); // Chão escuro

        // 2. Setup Player (Physics Sprite)
        this.player = this.physics.add.sprite(1000, 1000, 'player');
        this.player.setTint(0x00ff00); // Tint de debug/visual
        this.player.setCollideWorldBounds(true);
        
        // 3. Setup Camera
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.2);

        // 4. Setup Systems
        this.inventorySystem = new InventorySystem(this);
        this.flashlight = new FlashlightSystem(this, this.player);
        this.sanitySystem = new SanitySystem(this, this.player, this.flashlight);
        this.eventSystem = new EventSystem(this, this.sanitySystem, this.flashlight);
        this.interactionSystem = new InteractionSystem(this);

        // 4.1 Setup Iso Tilemap
        this.isoTilemap = new IsoTilemapSystem(this);
        this.isoTilemap.generateGrid(50, 50);
        this.worldTopology = new WorldTopologySystem(this, this.isoTilemap, 'reality_A');

        // 4.2 Setup Pathfinding
        this.pathfinding = new PathfindingSystem(this, this.isoTilemap);

        // 4.3 Setup PathFollower (Agente de Movimento)
        this.playerFollower = new PathFollower(this, this.player, this.pathfinding, this.worldTopology, 200);

        // 4.4 Setup Enemy (Teste de IA)
        // Cria sprite do inimigo
        this.enemySprite = this.physics.add.sprite(1000, 600, 'enemy').setTint(0xff0000);
        // Cria o "Corpo" (PathFollower) - Velocidade menor que o player (150)
        this.enemyFollower = new PathFollower(this, this.enemySprite, this.pathfinding, this.worldTopology, 150);
        // Cria a "Mente" (AI)
        this.enemyAI = new EnemyAI(this, this.enemyFollower, this.player);

        this.input.on('pointerdown', (pointer) => {
            const worldPoint = pointer.positionToCamera(this.cameras.main);
            
            // Delega o movimento para o PathFollower
            this.playerFollower.moveTo(worldPoint.x, worldPoint.y);
        });

        // 5. Create Environment (Apartamento Fixo)
        const walls = this.worldTopology.createApartment();
        this.physics.add.collider(this.player, walls);

        // 6. Create Interactables
        this.interactables = [];

        // -- Porta (Entre Sala e Quarto)
        // Posicionada no gap definido em WorldTopology (aprox 1000 + 300, 1000)
        this.door = new DoorSystem(this, 1300, 1000); 
        this.interactables.push(this.door);
        this.physics.add.collider(this.player, this.door.body);

        // -- Papel (No quarto)
        const paper = this.eventSystem.createPaper(1450, 950);
        this.interactables.push(paper);

        // -- Chave
        this.keyItem = new KeyItem(this, 1200, 1000, 'basement_key');

        // 7. Input Handling
        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.input.keyboard.on('keydown-E', () => {
            this.interactionSystem.tryInteract();
        });

        this.input.keyboard.on('keydown-F', () => {
            this.flashlight.isOn = !this.flashlight.isOn;
        });

        this.input.keyboard.on('keydown-G', () => {
            this.isDistorted = !this.isDistorted;
            const gridPos = this.pathfinding.worldToGrid(this.player.x, this.player.y);
            
            if (this.isDistorted) {
                this.worldTopology.applyDistortion(gridPos.x, gridPos.y, 5);
            } else {
                this.worldTopology.resetWorld();
            }
        });
    }

    update(time, delta) {
        const speed = 200;
        this.player.setVelocity(0);

        // Movimento
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.playerFollower.stop(); // Cancela pathfinding se usar WASD
        }
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.playerFollower.stop();
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.playerFollower.stop();
        }
        if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.playerFollower.stop();
        }

        // Atualiza o seguidor de caminho
        this.playerFollower.update(delta);

        // Atualiza IA do Inimigo
        if (this.enemyAI) this.enemyAI.update(delta);

        // System Updates
        this.flashlight.update(delta, this.cursors);
        this.sanitySystem.update(delta);
        this.interactionSystem.update(this.player, this.interactables);
        
        this.eventSystem.update(delta);
        if (this.keyItem) this.keyItem.update();
        if (this.door) this.door.update();
        
        // Limpeza de objetos destruídos
        this.interactables = this.interactables.filter(obj => {
            if (obj.sprite && !obj.sprite.scene) return false;
            return true;
        });
    }
}