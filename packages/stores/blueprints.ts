import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import blend from "../../resources/builtin/base/blend";
import output from "../../resources/builtin/base/output";
import gaussianBlur from "../../resources/builtin/blur/gaussian";
import gradient from "../../resources/builtin/generate/linear-gradient";
import shape from "../../resources/builtin/generate/shape";
import solidColor from "../../resources/builtin/generate/solidColor";
import scatter from "../../resources/builtin/layout/scatter";
import tile from "../../resources/builtin/layout/tile";
import transform from "../../resources/builtin/layout/transform";
import anisotropicNoise from "../../resources/builtin/noises/anisotropic";
import noise from "../../resources/builtin/noises/noise";
import floor from "../../resources/builtin/utilities/floor";
import invert from "../../resources/builtin/utilities/invert";
import passthrough from "../../resources/builtin/utilities/pass-through";
import { MaterialNodeBlueprint, MaterialNodeBlueprintsPackage } from "../material/node";

const BUILTIN_NODES_PACKAGE: MaterialNodeBlueprintsPackage = new Map<string, MaterialNodeBlueprint>(
    [
        ["output", output],
        ["blend", blend],

        ["solid-color", solidColor],
        ["gradient", gradient],
        ["shape", shape],

        ["noise", noise],
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
