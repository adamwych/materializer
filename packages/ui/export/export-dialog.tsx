import { RenderEngineProvider } from "../../renderer/engine.ts";
import { MaterialProvider } from "../../stores/material.ts";
import ExportDialogInner from "./inner.tsx";

export default function ExportDialog() {
    return (
        <MaterialProvider>
            <RenderEngineProvider>
                <ExportDialogInner />
            </RenderEngineProvider>
        </MaterialProvider>
    );
}
