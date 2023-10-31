import PanelSection from "../components/panel/section.tsx";
import { Show, createEffect, createSignal, on } from "solid-js";
import { useMaterialContext } from "./material-context.ts";
import MaterialPreviewCanvas from "./preview-canvas.tsx";

export default function MaterialPreviewPanel() {
    const materialCtx = useMaterialContext()!;
    const [hidden, setHidden] = createSignal(true);
    let refreshDebounce: number;
    let firstMount = true;

    createEffect(
        on(materialCtx.getOutputTextureWidth, () => {
            clearTimeout(refreshDebounce);
            refreshDebounce = setTimeout(
                () => {
                    setHidden(true);
                    requestAnimationFrame(() => {
                        setHidden(false);
                    });
                },
                firstMount ? 0 : 500,
            );
            firstMount = false;
        }),
    );

    return (
        <PanelSection label="Preview">
            <Show when={!hidden()}>
                <MaterialPreviewCanvas />
            </Show>
        </PanelSection>
    );
}
