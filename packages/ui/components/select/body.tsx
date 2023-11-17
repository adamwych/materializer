import { DocumentEventListener } from "@solid-primitives/event-listener";
import { ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
import assertInWindowBounds from "../../../utils/assertInWindowBounds.ts";
import hasParentWithCondition from "../../../utils/hasParentWithCondition.ts";
import makeNestedEventListener from "../../../utils/makeNestedEventListener.ts";
import { SelectContextProvider } from "./context.ts";

type Props<V> = {
    buttonElement: HTMLDivElement;

    onChange(newValue: V): void;
    onClose(): void;
};

export default function SelectBody<V>(props: ParentProps<Props<V>>) {
    let rootElement: HTMLDivElement;

    makeNestedEventListener(props.buttonElement, "scroll", () => {
        props.onClose();
    });

    function onDocumentMouseDown(ev: MouseEvent) {
        const clickedInsideSelect = hasParentWithCondition(
            ev.target as Element,
            (element) => element === rootElement,
        );

        if (!clickedInsideSelect) {
            props.onClose();
        }
    }

    function alignBodyToButton(bodyElement: HTMLDivElement) {
        rootElement = bodyElement;

        const buttonElementRect = props.buttonElement.getBoundingClientRect();

        bodyElement.style.position = "absolute";
        bodyElement.style.top = buttonElementRect.top + buttonElementRect.height + "px";
        bodyElement.style.left = buttonElementRect.left + "px";
        bodyElement.style.width = buttonElementRect.width + "px";

        assertInWindowBounds(bodyElement);
    }

    return (
        <Portal>
            <DocumentEventListener onMousedown={onDocumentMouseDown} />
            <div
                ref={alignBodyToButton}
                class="absolute w-full z-10 border border-gray-200 -mt-[1px] rounded-b-md overflow-hidden"
            >
                <SelectContextProvider onChange={props.onChange} onClose={props.onClose}>
                    {props.children}
                </SelectContextProvider>
            </div>
        </Portal>
    );
}
