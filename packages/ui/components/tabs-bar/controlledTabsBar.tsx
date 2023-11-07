import { RiSystemAddFill } from "solid-icons/ri";
import { JSX, ParentProps, Show } from "solid-js";

type Props = {
    renderTabs: () => JSX.Element;
    onNewClick?(): void;
};

export default function ControlledTabsBar(props: ParentProps<Props>) {
    return (
        <div class="flex flex-col flex-1">
            <div class="flex items-center flex-wrap bg-gray-100 border-b border-gray-200">
                {props.renderTabs()}

                <Show when={props.onNewClick}>
                    <div class="px-2 flex items-center h-[35px]">
                        <div
                            class="hover:bg-gray-300 active:bg-gray-200 p-1 rounded-md"
                            onClick={props.onNewClick}
                        >
                            <RiSystemAddFill />
                        </div>
                    </div>
                </Show>
            </div>

            {props.children}
        </div>
    );
}
