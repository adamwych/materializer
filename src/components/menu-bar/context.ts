import { createContextProvider } from "@solid-primitives/context";

type Props = {
    onClose(): void;
};

const [MenuBarContextProvider, useMenuBarContext] = createContextProvider((props: Props) => {
    return {
        closeMenu() {
            props.onClose();
        },
    };
});

export { MenuBarContextProvider, useMenuBarContext };
