import { DeepReadonly } from "ts-essentials";
import { MaterialNode } from "../../types/material";
import PatternMaterialNodePainter, { PatternElement } from "./pattern";
import seedrandom from "seedrandom";

export default class ScatterMaterialNodePainter extends PatternMaterialNodePainter {
    public generatePattern(node: DeepReadonly<MaterialNode>): Array<PatternElement> {
        const amount = Math.round(node.parameters["amount"] as number);

        const randomnessSeed = node.parameters["seed"] as number;
        const size = (node.parameters["size"] as number) * 2048;
        const spreadX = node.parameters["spreadX"] as number;
        const spreadY = node.parameters["spreadY"] as number;
        const randomRotation = node.parameters["randomRotation"] as number;
        const randomScale = (node.parameters["randomScale"] as number) / 2048;

        const elements: Array<PatternElement> = [];

        const rng = seedrandom.alea(randomnessSeed.toString());

        for (let i = 0; i < amount; i++) {
            const scale = size / 2048 + rng() * randomScale - randomScale / 2;
            elements.push({
                rotation: rng() * randomRotation,
                position: [rng() * spreadX - spreadX / 2, rng() * spreadY - spreadY / 2, 0],
                scale: [scale, scale],
            });
        }

        return elements;
    }
}
