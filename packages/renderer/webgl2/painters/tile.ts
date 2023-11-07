import { MaterialNodeSnapshot } from "../../types";
import PatternMaterialNodePainter, { PatternElement } from "./pattern";

export default class TileMaterialNodePainter extends PatternMaterialNodePainter {
    public generatePattern(snapshot: MaterialNodeSnapshot): Array<PatternElement> {
        const node = snapshot.node;
        const elements: Array<PatternElement> = [];

        const amountX = Math.floor(node.parameters["amountX"] as number);
        const amountY = Math.floor(node.parameters["amountY"] as number);
        const extraOffsetX = (node.parameters["offsetX"] as number) / amountX;
        const extraOffsetY = (node.parameters["offsetY"] as number) / amountY;
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
