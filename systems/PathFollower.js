import { bus } from '../utils/EventBus.js';

export default class PathFollower {

    constructor(scene, entity, pathfindingSystem, worldTopology, speed = 200, onPathStatusChange = null) {
        this.scene = scene;
        this.entity = entity; // O Sprite/Player
        this.pathfinding = pathfindingSystem;
        this.worldTopology = worldTopology; // Referência para pegar a versão atual
        this.speed = speed;
        this.worldId = worldTopology.worldId; // A qual realidade este agente pertence?
        this.onPathStatusChange = onPathStatusChange; // Callback para IA (opcional)

        this.path = [];
        this.currentTargetIndex = 0;
        this.isMoving = false;
        
        // Armazena o destino final para recalculos
        this.finalTarget = null; 

        // Armazena a versão do mundo no momento do cálculo
        this.pathVersion = 0;
        
        // ID da requisição de path atual (para cancelar antigas)
        this.currentPathRequestId = 0;

        // Flag para o debounce
        this.isRepathPending = false;

        // Bind para manter o contexto correto no EventBus
        this.onTopologyChanged = this.onTopologyChanged.bind(this);
        
        // Escuta mudanças no mundo
        bus.on('topologyChanged', this.onTopologyChanged);
    }

    /**
     * Define um novo destino e inicia o movimento.
     */
    moveTo(targetX, targetY) {
        this.finalTarget = { x: targetX, y: targetY };
        this.calculatePath();
    }

    /**
     * Calcula o path do ponto atual até o destino final.
     */
    async calculatePath() {
        if (!this.finalTarget) return;

        // Incrementa ID da requisição. Se houver um cálculo anterior rodando,
        // ele saberá que seu ID é velho e não aplicará o resultado.
        this.currentPathRequestId++;
        const myRequestId = this.currentPathRequestId;

        const startX = this.entity.x;
        const startY = this.entity.y;

        const oldPathLength = this.path ? this.path.length : 0;
        
        // Chama a versão assíncrona
        const newPath = await this.pathfinding.findPathAsync(startX, startY, this.finalTarget.x, this.finalTarget.y);

        // Verifica se esta requisição ainda é a mais recente
        if (this.currentPathRequestId !== myRequestId) return;

        if (newPath && newPath.length > 0) {
            // Verifica se o caminho aumentou drasticamente (ex: 50% maior)
            // Isso indica que o caminho direto foi bloqueado e ele está dando uma volta enorme
            const isDrasticChange = oldPathLength > 0 && newPath.length > oldPathLength * 1.5;
            
            this.path = newPath;
            this.currentTargetIndex = 0;
            this.isMoving = true;
            this.pathVersion = this.worldTopology.version; // Marca a versão deste caminho

            if (this.onPathStatusChange) {
                this.onPathStatusChange(isDrasticChange ? 'compromised' : 'valid');
            }
        } else {
            // Caminho bloqueado ou inválido
            this.stop();
            
            if (this.onPathStatusChange) {
                this.onPathStatusChange('blocked');
            }
        }
    }

    /**
     * Callback disparado pelo EventBus.
     * Usa queueMicrotask para evitar múltiplos recalculos no mesmo frame.
     * @param {Object} data - { worldId, version, type }
     */
    onTopologyChanged(data) {
        // Se não estamos nos movendo ou já agendamos um recalculo, ignora
        if (!this.isMoving || this.isRepathPending) return;

        // Filtro de Realidade: Se a mudança foi em outro mundo, ignora
        if (data.worldId && data.worldId !== this.worldId) return;

        this.isRepathPending = true;

        // Agenda o recalculo para o final da microtask queue (debounce)
        queueMicrotask(() => {
            // Verifica se o objeto ainda existe e se ainda deve se mover
            if (this.entity.scene && this.isMoving) {
                // console.log("Recalculando rota devido a distorção...");
                this.calculatePath();
            }
            this.isRepathPending = false;
        });
    }

    update(delta) {
        if (!this.isMoving || this.path.length === 0) return;

        const target = this.path[this.currentTargetIndex];

        if (target) {
            const dx = target.x - this.entity.x;
            const dy = target.y - this.entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Chegou no nó atual
            if (distance < 5) {
                this.currentTargetIndex++;

                // Chegou no final do caminho
                if (this.currentTargetIndex >= this.path.length) {
                    this.stop();
                }
            } else {
                // Move em direção ao nó
                const angle = Math.atan2(dy, dx);
                this.entity.body.setVelocity(
                    Math.cos(angle) * this.speed,
                    Math.sin(angle) * this.speed
                );
            }
        }
    }

    stop() {
        this.isMoving = false;
        this.path = [];
        this.finalTarget = null;
        this.entity.body.setVelocity(0);
    }

    /**
     * Limpeza obrigatória ao destruir o objeto/cena
     */
    destroy() {
        bus.off('topologyChanged', this.onTopologyChanged);
    }
}
