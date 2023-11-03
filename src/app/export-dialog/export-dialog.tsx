import { MaterialContextProvider } from "../../editor/material-context.ts";
import { RenderingEngineProvider } from "../../renderer/engine.ts";
import { RenderingSchedulerProvider } from "../../renderer/scheduler.ts";
import { useWorkspaceContext } from "../../workspace-context.ts";
import ExportDialogInner from "./inner";

interface Props {
    onClose(): void;
}

export default function ExportDialog(props: Props) {
    const context = useWorkspaceContext()!;
    const activeMaterial = context.activeEditorTabMaterial;

    return (
        <MaterialContextProvider value={activeMaterial()!}>
            <RenderingEngineProvider>
                <RenderingSchedulerProvider>
                    <ExportDialogInner onClose={props.onClose} />
                </RenderingSchedulerProvider>
            </RenderingEngineProvider>
        </MaterialContextProvider>
    );
}
