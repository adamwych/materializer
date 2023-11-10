import { MaterialStore, useMaterialStore } from "../../../../stores/material";
import { EditorCommandId, useEditorCommands } from "./commands";

export default function registerEditorMaterialCommands() {
    const commands = useEditorCommands()!;
    const materialStore = useMaterialStore()!;

    function registerStoreFunctionAsCommand(functionName: keyof MaterialStore) {
        const commandId = `material.${functionName}` as EditorCommandId;

        commands.registerEditorCommand(commandId, (args: Array<unknown>) => {
            const storeFn = materialStore[functionName] as (...args: Array<unknown>) => void;
            storeFn.apply(materialStore, args);
        });
    }

    registerStoreFunctionAsCommand("addNode");
    registerStoreFunctionAsCommand("removeNode");
    registerStoreFunctionAsCommand("setNodeParameter");
    registerStoreFunctionAsCommand("setNodeTextureSize");
    registerStoreFunctionAsCommand("setNodeTextureFilterMethod");
    registerStoreFunctionAsCommand("addEdge");
    registerStoreFunctionAsCommand("removeEdge");

    commands.registerEditorCommand("material.moveNodesTo", ([infos]) => {
        (infos as Array<never>).forEach((info: { nodeId: number; x: number; y: number }) => {
            materialStore.moveNodeTo(info.nodeId, info.x, info.y);
        });
    });
}
