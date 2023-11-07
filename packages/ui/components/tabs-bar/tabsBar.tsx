import { For, JSX, createSignal } from "solid-js";
import ControlledTabsBar from "./controlledTabsBar.tsx";
import TabsBarItem from "./tabsBarItem.tsx";

type TabsBarTabInfo = {
    label: string;
    closable?: boolean;
};

type Props = {
    tabs: ReadonlyArray<TabsBarTabInfo>;
    children: (tabIndex: number) => JSX.Element;
    onNewClick?(): void;
    onCloseClick?(index: number): void;
};

export default function TabsBar(props: Props) {
    const [tabIndex, setTabIndex] = createSignal(0);

    return (
        <ControlledTabsBar
            renderTabs={() => (
                <For each={props.tabs}>
                    {(tabInfo, index) => (
                        <TabsBarItem
                            current={index() == tabIndex()}
                            onClick={() => setTabIndex(index())}
                            onCloseClick={() => props.onCloseClick?.(index())}
                        >
                            {tabInfo.label}
                        </TabsBarItem>
                    )}
                </For>
            )}
            onNewClick={props.onNewClick}
        >
            {props.children(tabIndex())}
        </ControlledTabsBar>
    );
}
