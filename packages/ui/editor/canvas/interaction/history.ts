import { createContextProvider } from "@solid-primitives/context";
import { IconTypes } from "solid-icons";
import { RiBuildingsHome2Line, RiEditorCodeView, RiMediaImage2Line } from "solid-icons/ri";
import { MaterialNode } from "../../../../material/node";
import { useWorkspaceStore } from "../../../../stores/workspace";
import { useWorkspaceHistory } from "../../../../stores/workspace-history";
import { EditorCommandRef, useEditorCommands } from "./commands";

export type EditorHistoryStack = {
    entries: Array<EditorHistoryEntry>;
    top: number;
};

export type EditorHistoryEntry = {
    id: number;
    name: string;
    icon: IconTypes;
    redoCommand: EditorCommandRef;
    undoCommand: EditorCommandRef;
    addedAt: Date;
};

export const [EditorHistoryProvider, useEditorHistory] = createContextProvider(() => {
    const commands = useEditorCommands()!;
    const workspace = useWorkspaceStore()!;
    const workspaceHistory = useWorkspaceHistory()!;
    const material = workspace.getActiveMaterial()!;
    const stack = () => workspaceHistory.getEditorHistoryStack(material.id)!;

    function setStack(setter: (current: EditorHistoryStack) => void) {
        workspaceHistory.setEditorHistoryStack(material.id, setter);
    }

    return {
        /**
         * Pushes an action onto the history stack.
         *
         * @param name A label describing the action.
         * @param icon Icon that will be shown next to the label.
         * @param redoCommand Command that re-applies the changes done by this action.
         * @param undoCommand Command that reverts changes done by this action.
         */
        pushAction(
            name: string,
            icon: IconTypes,
            redoCommand: EditorCommandRef,
            undoCommand: EditorCommandRef,
        ) {
            setStack((stack) => {
                stack.entries = stack.entries.filter((x) => x.id <= stack.top);

                if (stack.entries.length === 0) {
                    stack.entries.push({
                        id: 0,
                        name: "Start",
                        icon: RiBuildingsHome2Line,
                        redoCommand: ["nop"],
                        undoCommand,
                        addedAt: new Date(),
                    });
                }

                stack.entries.splice(0, 0, {
                    id: Math.max(-1, ...Array.from(stack.entries.values()).map((x) => x.id)) + 1,
                    name,
                    icon,
                    redoCommand,
                    undoCommand,
                    addedAt: new Date(),
                });

                stack.top = stack.entries.length - 1;
            });
        },

        pushNodeTextureSizeChanged(node: MaterialNode, newValue: number, previousValue: number) {
            this.pushAction(
                `Set ${node.name} texture size`,
                RiMediaImage2Line,
                ["material.setNodeTextureSize", node.id, newValue, true, false],
                ["material.setNodeTextureSize", node.id, previousValue, true, false],
            );
        },

        pushNodeParameterValueChanged<V>(
            node: MaterialNode,
            parameterId: string,
            newValue: V,
            previousValue: V,
        ) {
            this.pushAction(
                `Set ${node.name}/${parameterId} parameter`,
                RiEditorCodeView,
                ["material.setNodeParameter", node.id, parameterId, newValue, true, false],
                ["material.setNodeParameter", node.id, parameterId, previousValue, true, false],
            );
        },

        revertToAction(id: number) {
            stack()
                .entries.filter((x) => x.id > stack().top && x.id <= id)
                .reverse()
                .forEach((action) => {
                    commands.runCommand(action.redoCommand);
                });

            stack()
                .entries.filter((x) => x.id <= stack().top && x.id > id)
                .forEach((action) => {
                    commands.runCommand(action.undoCommand);
                });

            setStack((stack) => (stack.top = id));
        },

        moveUp(amount: number) {
            if (stack().top < stack().entries.length - 1) {
                this.revertToAction(stack().top + amount);
            }
        },

        moveDown(amount: number) {
            if (stack().top > 0) {
                this.revertToAction(stack().top - amount);
            }
        },

        stack,
    };
});
