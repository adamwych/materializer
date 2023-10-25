import { createContextProvider } from "@solid-primitives/context";

type Props = {
    onClose(): void;
};

const [UIMenuBarContextProvider, useMenuBarContext] = createContextProvider(
    (props: Props) => {
        return {
            closeMenu() {
                props.onClose();
            },
        };
    },
);

export { UIMenuBarContextProvider, useMenuBarContext };
