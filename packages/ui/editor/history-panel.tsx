import { For } from "solid-js";
import PanelSection from "../components/panel/section";
import { useEditorHistory } from "./canvas/interaction/history";
import HistoryPanelItem from "./history-panel-item";

export default function HistoryPanel() {
    const history = useEditorHistory()!;

    return (
        <PanelSection label="History">
            <div class="h-[340px] overflow-y-auto">
                <For each={history.stack().entries}>
                    {(entry) => <HistoryPanelItem entry={entry} />}
                </For>
            </div>
        </PanelSection>
    );
}
