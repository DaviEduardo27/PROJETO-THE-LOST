export default class EnemyAI {

    static STATE = {
        IDLE: 'IDLE',
        CHASE: 'CHASE',
        CONFUSED: 'CONFUSED'
    };

    constructor(scene, follower, target) {
        this.scene = scene;
        this.follower = follower; // Instância de PathFollower
        this.target = target;     // Geralmente o Player
        
        this.currentState = EnemyAI.STATE.IDLE;
        this.stateTimer = 0;

        // Configura o callback do follower para escutar problemas de navegação
        this.follower.onPathStatusChange = (status) => this.handlePathStatus(status);
    }

    setState(newState) {
        if (this.currentState === newState) return;
        
        this.currentState = newState;
        this.stateTimer = 0;

        // Lógica de entrada do estado
        switch (newState) {
            case EnemyAI.STATE.CONFUSED:
                this.follower.stop();
                this.follower.entity.setTint(0xffff00); // Visual Debug: Amarelo
                break;
            case EnemyAI.STATE.CHASE:
                this.follower.entity.clearTint();
                break;
            case EnemyAI.STATE.IDLE:
                this.follower.stop();
                break;
        }
    }

    handlePathStatus(status) {
        // Se o caminho foi bloqueado ou ficou muito longo durante uma perseguição
        if (this.currentState === EnemyAI.STATE.CHASE) {
            if (status === 'blocked' || status === 'compromised') {
                this.setState(EnemyAI.STATE.CONFUSED);
            }
        }
    }

    update(delta) {
        this.stateTimer += delta;

        switch (this.currentState) {
            case EnemyAI.STATE.IDLE:
                // Lógica simples: se o player estiver perto, comece a perseguir
                if (this.getDistanceToTarget() < 600) {
                    this.setState(EnemyAI.STATE.CHASE);
                }
                break;

            case EnemyAI.STATE.CHASE:
                // Atualiza o destino periodicamente (não todo frame para performance)
                if (this.stateTimer > 500) { 
                    this.follower.moveTo(this.target.x, this.target.y);
                    this.stateTimer = 0;
                }
                
                // Se o player fugir muito, volta para Idle
                if (this.getDistanceToTarget() > 1000) {
                    this.setState(EnemyAI.STATE.IDLE);
                }
                break;

            case EnemyAI.STATE.CONFUSED:
                // Comportamento errático: Gira ou treme
                this.performConfusedBehavior();

                // Fica confuso por 3 segundos, depois tenta perseguir de novo
                if (this.stateTimer > 3000) {
                    this.setState(EnemyAI.STATE.CHASE);
                    // Força uma tentativa de movimento imediata
                    this.follower.moveTo(this.target.x, this.target.y);
                }
                break;
        }

        // Atualiza o "corpo"
        this.follower.update(delta);
    }

    performConfusedBehavior() {
        const sprite = this.follower.entity;
        
        // Simula olhar para os lados aleatoriamente
        if (Math.random() > 0.95) {
            const randomAngle = (Math.random() - 0.5) * 2; // -1 a 1
            sprite.rotation += randomAngle;
        }
        
        // Pequeno tremor
        sprite.x += (Math.random() - 0.5) * 2;
        sprite.y += (Math.random() - 0.5) * 2;
    }

    getDistanceToTarget() {
        return Phaser.Math.Distance.Between(
            this.follower.entity.x, this.follower.entity.y,
            this.target.x, this.target.y
        );
    }
}
