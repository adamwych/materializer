import { createContextProvider } from "@solid-primitives/context";

type Props = {
    onChange(value: any): void;
    onClose(): void;
};

export const [SelectContextProvider, useSelectContext] = createContextProvider((props: Props) => {
    return {
        setValue(value: any) {
            props.onChange(value);
        },

        close() {
            props.onClose();
        },
    };
});
