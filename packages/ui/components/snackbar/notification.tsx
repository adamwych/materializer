import { TailwindColorName } from "../../../types/tailwind.ts";
import { SnackbarNotificationInfo } from "./context.ts";

const colors: { [k: string]: TailwindColorName } = {
    success: "washed-green",
    error: "washed-red",
    info: "washed-blue",
};

export default function SnackbarNotification({ info }: { info: SnackbarNotificationInfo }) {
    const IconComponent = info.icon;
    const color = colors[info.type];

    return (
        <div class={`p-3 bg-${color}-500 rounded-md animate-fade-scale-in`}>
            <span class="flex items-center gap-2">
                {IconComponent && <IconComponent />}
                <span class="text-sm">{info.text}</span>
            </span>
        </div>
    );
}
