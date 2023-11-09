import { IconProps, IconTypes } from "solid-icons";
import { ParentProps } from "solid-js";
import cn from "../../../utils/cn";

type Props = {
    icon?: IconTypes;
    iconSide?: "left" | "right";
    iconProps?: IconProps;

    size?: "inline" | "tiny" | "small" | "default";

    disabled?: boolean;

    onClick(): void;
};

const sizeStyles = {
    inline: "",
    tiny: "px-2 py-2 text-xs min-w-[22px] h-[22px]",
    small: "px-2.5 py-1 text-xs min-w-[26px] h-[26px]",
    default: "px-4 py-2 text-sm min-w-[32px] h-[32px]",
};

export default function Button(props: ParentProps<Props>) {
    const size = () => props.size ?? "default";
    const iconSide = () => props.iconSide ?? "left";
    const hasContent = () => !!props.children;

    function renderIcon(side: "left" | "right") {
        if (props.icon && iconSide() === side) {
            const IconComponent = props.icon;
            return <IconComponent {...props.iconProps} />;
        }
    }

    return (
        <button
            class={cn(
                "rounded-md",
                "flex items-center justify-center gap-2",
                sizeStyles[size()],
                !hasContent() && "p-initial",
                props.disabled
                    ? "outline outline-1 outline-gray-200 opacity-50 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 active:bg-gray-100",
            )}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {renderIcon("left")}
            {props.children}
            {renderIcon("right")}
        </button>
    );
}
