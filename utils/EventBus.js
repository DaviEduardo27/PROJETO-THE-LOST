export default class EventBus { 
    constructor() {
        this.listeners = {};
    }

    /**
     * Inscreve um callback para um evento.
     * @param {string} event - Nome do evento.
     * @param {Function} callback - Função a ser executada.
     * @param {Object} context - Contexto (this) opcional.
     */
    on(event, callback, context = null) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push({ callback, context });
    }

    /**
     * Remove uma inscrição.
     * @param {string} event - Nome do evento.
     * @param {Function} callback - Função original inscrita.
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(
            listener => listener.callback !== callback
        );
    }

    /**
     * Emite um evento para todos os inscritos.
     * @param {string} event - Nome do evento.
     * @param {any} data - Dados a serem passados.
     */
    emit(event, data) {
        if (!this.listeners[event]) return;
        
        this.listeners[event].forEach(listener => {
            if (listener.context) {
                listener.callback.call(listener.context, data);
            } else {
                listener.callback(data);
            }
        });
    }
}

// Exporta uma instância única (Singleton) para uso global no projeto
export const bus = new EventBus();
