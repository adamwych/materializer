import { For, JSX } from "solid-js";
import { useWorkspaceStore } from "../../stores/workspace";
import { Material, createEmptyMaterial } from "../../types/material";
import ControlledTabsBar from "../components/tabs-bar/controlledTabsBar";
import TabsBarItem from "../components/tabs-bar/tabsBarItem";
import { useWorkspaceHistory } from "../../stores/workspace-history";

type Props = {
    children: (material?: Material) => JSX.Element;
};

export default function EditorTabsBar(props: Props) {
    const workspace = useWorkspaceStore()!;
    const history = useWorkspaceHistory()!;

    return (
        <ControlledTabsBar
            renderTabs={() => (
                <For each={workspace.getMaterials()}>
                    {(material) => (
                        <TabsBarItem
                            current={workspace.isActiveMaterial(material.id)}
                            onClick={() => workspace.addMaterial(material)}
                            onCloseClick={() => workspace.deleteMaterial(material.id)}
                        >
                            {material.name}
                            {history.hasUnsavedChanges(material.id) && " *"}
                        </TabsBarItem>
                    )}
                </For>
            )}
            onNewClick={() => workspace.addMaterial(createEmptyMaterial())}
        >
            {props.children(workspace.getActiveMaterial())}
        </ControlledTabsBar>
    );
}
