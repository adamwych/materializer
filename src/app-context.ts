import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import { MaterialNodesPackage } from "./types/material.ts";
import { BUILTIN_NODES_PACKAGE } from "./builtin-nodes.ts";

export const [AppContextProvider, useAppContext] = createContextProvider(() => {
    const nodesPackages = new ReactiveMap<string, MaterialNodesPackage>();
    nodesPackages.set("@materializer", BUILTIN_NODES_PACKAGE);

    return {
        addNodesPackage(name: string, pkg: MaterialNodesPackage) {
            nodesPackages.set(name, pkg);
        },

        getNodeSpec(path: string) {
            const parts = path.split("/");
            const pkg = nodesPackages.get(parts[0]);
            if (!pkg || !pkg.nodes.has(parts[1])) {
                throw new Error(`Node '${path}' was not found within the registry.`);
            }

            return structuredClone(pkg.nodes.get(parts[1]))!;
        },

        nodesPackages,
    };
});
