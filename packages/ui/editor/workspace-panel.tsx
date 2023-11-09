import { For } from "solid-js";
import { useWorkspaceStore } from "../../stores/workspace";
import PanelSection from "../components/panel/section";
import WorkspacePanelItem from "./workspace-panel-item";
import Button from "../components/button/button";
import { RiSystemAddFill } from "solid-icons/ri";
import { createDefaultMaterial } from "../../types/material";

export default function WorkspacePanel() {
    const workspace = useWorkspaceStore()!;

    return (
        <PanelSection
            titleButtons={[
                <Button
                    size="tiny"
                    icon={RiSystemAddFill}
                    onClick={() => workspace.addMaterial(createDefaultMaterial())}
                />,
            ]}
            label="Workspace"
            class="flex-1"
        >
            <div
                class="overflow-y-auto"
                style={{ "max-height": "calc(100vh - 72px - 32px - 340px)" }}
            >
                <For each={workspace.getMaterials()}>
                    {(material) => <WorkspacePanelItem material={material} />}
                </For>
            </div>
        </PanelSection>
    );
}
