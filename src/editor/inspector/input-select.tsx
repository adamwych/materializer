import { For } from "solid-js";
import { InputProps } from "./parameter";
import Select from "../../components/select/select";
import SelectOption from "../../components/select/select-option";

export default function MaterialNodeInspectorSelectInput(props: InputProps<any>) {
    const selectedOption = () => props.parameter.options!.find((x) => x.value === props.value());

    return (
        <Select label={selectedOption()!.label} value={props.value()} onChange={props.onChange}>
            <For each={props.parameter.options!}>
                {({ label, value }) => <SelectOption value={value}>{label}</SelectOption>}
            </For>
        </Select>
    );
}
