import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import blend from "../../resources/builtin/base/blend";
import output from "../../resources/builtin/base/output";
import shape from "../../resources/builtin/base/shape";
import solidColor from "../../resources/builtin/base/solidColor";
import scatter from "../../resources/builtin/layout/scatter";
import tile from "../../resources/builtin/layout/tile";
import transform from "../../resources/builtin/layout/transform";
import noise from "../../resources/builtin/noises/noise";
import invert from "../../resources/builtin/utilities/invert";
import { MaterialNodeBlueprint, MaterialNodeBlueprintsPackage } from "../material/node";

const BUILTIN_NODES_PACKAGE: MaterialNodeBlueprintsPackage = new Map<string, MaterialNodeBlueprint>(
    [
        ["solid-color", solidColor],
        ["shape", shape],
        ["blend", blend],
        ["output", output],
        ["noise", noise],
        ["transform", transform],
        ["tile", tile],
        ["scatter", scatter],
        ["invert", invert],
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
