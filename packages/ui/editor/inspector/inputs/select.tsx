import { For } from "solid-js";
import SelectOption from "../../../components/select/option";
import Select from "../../../components/select/select";
import { SelectParameterInputInfo } from "../../../../types/node-parameter";
import { InputProps } from "../parameter";

export default function MaterialNodeInspectorSelectInput(
    props: InputProps<SelectParameterInputInfo, unknown>,
) {
    const selectedOption = () =>
        props.parameter.inputProps.options!.find((x) => x.value === props.value());

    return (
        <Select label={selectedOption()!.label} value={props.value()} onChange={props.onChange}>
            <For each={props.parameter.inputProps.options!}>
                {({ label, value }) => <SelectOption value={value}>{label}</SelectOption>}
            </For>
        </Select>
    );
}
