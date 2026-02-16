export default class IsoUtils {

    static TILE_WIDTH = 64;
    static TILE_HEIGHT = 32;

    // Conversão cartesiano → isométrico 45°
    static cartToIso(x, y) {
        return {
            x: x - y,
            y: (x + y) / 2
        };
    }

    // Depth global isométrico
    static getIsoDepth(x, y) {
        return x + y;
    }

}
