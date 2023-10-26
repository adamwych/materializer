import MaterialNodeInspectorRGBInput from "./input-rgb.tsx";
import { Accessor } from "solid-js";

interface Props {
    name: string;
    value: Accessor<unknown>;

    onChange(value: unknown): void;
}

export default function MaterialNodeInspectorParameter(props: Props) {
    return (
        <div>
            <h1 class="font-semibold">{props.name}</h1>
            <MaterialNodeInspectorRGBInput
                value={props.value as Accessor<[number, number, number]>}
                onChange={props.onChange}
            />
        </div>
    );
}
