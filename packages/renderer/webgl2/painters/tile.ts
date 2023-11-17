import { MaterialNodeSnapshot } from "../../types";
import PatternNodePainter, { PatternElement } from "./pattern";

export default class TileNodePainter extends PatternNodePainter {
    public generatePattern(snapshot: MaterialNodeSnapshot): Array<PatternElement> {
        const node = snapshot.node;
        const elements: Array<PatternElement> = [];

        const amountXY = node.parameters["amount"] as [number, number];
        const amountX = Math.floor(amountXY[0]);
        const amountY = Math.floor(amountXY[1]);
        const extraOffsetXY = node.parameters["offset"] as [number, number];
        const extraOffsetX = extraOffsetXY[0] / amountX;
        const extraOffsetY = extraOffsetXY[1] / amountY;
        const scale = 1 / Math.max(amountX, amountY);

        const toAddY = Math.ceil(extraOffsetY * amountY * amountY + 1);

        for (let y = 0; y < amountY + toAddY; y++) {
            const toAddX = extraOffsetX > 0 ? Math.round((extraOffsetX * y) / extraOffsetX) : 0;
            let positionX = 0;
            let positionY = 0;

            for (let x = 0; x < amountX + toAddX; x++) {
                positionX = 0;
                positionY = 0;

                // Offset each instance to [0, 0]
                positionX -= 1 - 1 / amountX;
                positionY -= 1 - 1 / amountY;

                // Move to where the tile is supposed to be.
                positionX += x / (amountX / 2);
                positionY += y / (amountY / 2);

                positionX -= extraOffsetX * y;
                positionY -= extraOffsetY * (y + 1);

                elements.push({
                    position: [positionX, positionY, 0],
                    rotation: 0,
                    scale: [scale, scale],
                });
            }
        }

        return elements;
    }
}
