import seedrandom from "seedrandom";
import PatternNodePainter, { PatternElement } from "./pattern";
import { MaterialNodeSnapshot } from "../../types";

export default class ScatterNodePainter extends PatternNodePainter {
    public generatePattern(snapshot: MaterialNodeSnapshot): Array<PatternElement> {
        const { node } = snapshot;
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
