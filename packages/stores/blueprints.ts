import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import blend from "../../resources/nodes/base/blend";
import normal from "../../resources/nodes/base/normal";
import output from "../../resources/nodes/base/output";
import gaussianBlur from "../../resources/nodes/blur/gaussian";
import gradient from "../../resources/nodes/generate/linear-gradient";
import shape from "../../resources/nodes/generate/shape";
import solidColor from "../../resources/nodes/generate/solid-color";
import scatter from "../../resources/nodes/layout/scatter";
import tile from "../../resources/nodes/layout/tile";
import transform from "../../resources/nodes/layout/transform";
import anisotropicNoise from "../../resources/nodes/noises/anisotropic";
import floor from "../../resources/nodes/utilities/floor";
import invert from "../../resources/nodes/utilities/invert";
import passthrough from "../../resources/nodes/utilities/pass-through";
import perlinNoise from "../../resources/nodes/noises/perlin";
import { MaterialNodeBlueprint, MaterialNodeBlueprintsPackage } from "../material/node";

const BUILTIN_NODES_PACKAGE: MaterialNodeBlueprintsPackage = new Map<string, MaterialNodeBlueprint>(
    [
        ["output", output],
        ["normal", normal],
        ["blend", blend],

        ["solid-color", solidColor],
        ["gradient", gradient],
        ["shape", shape],

        ["perlin-noise", perlinNoise],
        ["anisotropic-noise", anisotropicNoise],

        ["gaussian-blur", gaussianBlur],

        ["transform", transform],
        ["tile", tile],
        ["scatter", scatter],

        ["passthrough", passthrough],
        ["invert", invert],
        ["floor", floor],
    ],
);

export const [NodeBlueprintsProvider, useNodeBlueprintsStore] = createContextProvider(() => {
    const packages = new ReactiveMap<string, MaterialNodeBlueprintsPackage>([
        ["materializer", BUILTIN_NODES_PACKAGE],
    ]);

    return {
        getBlueprintByPath(path: string): MaterialNodeBlueprint | undefined {
            const [packageName, nodeName] = path.split("/");
            return packages.get(packageName)?.get(nodeName);
        },

        getAll() {
            return Array.from(packages.entries());
        },
    };
});
