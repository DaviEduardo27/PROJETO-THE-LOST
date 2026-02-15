
export default class InventorySystem {

    constructor(scene) {
        this.scene = scene;
        this.items = {};
    }

    addItem(key) {
        this.items[key] = true;
        console.log("Item adquirido:", key);
    }

    hasItem(key) {
        return !!this.items[key];
    }
}
