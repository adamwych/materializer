import { createContextProvider } from "@solid-primitives/context";

const [EditorDiagnosticsContextProvider, useEditorDiagnosticsContext] =
    createContextProvider(() => {
        return {
            error(message: string) {
                console.error(message);
            },
        };
    });

export { EditorDiagnosticsContextProvider, useEditorDiagnosticsContext };
