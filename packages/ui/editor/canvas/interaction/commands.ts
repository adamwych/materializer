import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";

// TODO: I'm pretty sure it's possible to do type-checking of command handlers with
// some fancy TypeScript magic, but is it worth it?

export type EditorCommandId =
    | "nop"
    | "material.addNode"
    | "material.removeNode"
    | "material.moveNodesTo"
    | "material.setNodeParameter"
    | "material.setNodeTextureSize"
    | "material.setNodeTextureFilterMethod"
    | "material.addEdge"
    | "material.removeEdge";

export type EditorCommandRef = [EditorCommandId, ...Array<unknown>];
export type EditorCommandHandlerFn = (args: Array<unknown>) => void;
export type EditorCommandInfo = {
    id: EditorCommandId;
    handler: EditorCommandHandlerFn;
};

export const [EditorCommandsRegistry, useEditorCommands] = createContextProvider(() => {
    const editorCommands = new ReactiveMap<EditorCommandId, EditorCommandInfo>();

    return {
        registerEditorCommand(id: EditorCommandId, handler: EditorCommandHandlerFn) {
            editorCommands.set(id, { id, handler });
        },

        runCommand(ref: EditorCommandRef) {
            const commandInfo = editorCommands.get(ref[0]);
            commandInfo?.handler(ref.slice(1));
        },
    };
});
