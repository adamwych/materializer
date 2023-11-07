import { createContextProvider } from "@solid-primitives/context";

type Props = {
    onChange(value: unknown): void;
    onClose(): void;
};

export const [SelectContextProvider, useSelectContext] = createContextProvider((props: Props) => {
    return {
        setValue(value: unknown) {
            props.onChange(value);
        },

        close() {
            props.onClose();
        },
    };
});
