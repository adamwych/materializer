export type ParameterInputType = "number" | "rgb" | "select";
export type ParameterValueType = "int" | "float" | "vec3";

type MakeParameterInputInfo<
    InputType extends ParameterInputType,
    InputProps,
    DefaultValue,
    ValueType extends ParameterValueType,
> = {
    /** Specifies what input component to show for this parameter in the UI. */
    inputType: InputType;

    /** Extra props, that will be passed to the input component. */
    inputProps: InputProps;

    /** Default value of the parameter. */
    default: DefaultValue;

    /** Type of this parameter's value. */
    valueType: ValueType;
};

export type NumberParameterInputInfo = MakeParameterInputInfo<
    "number",
    { min: number; max: number; step?: number },
    number,
    "int" | "float"
>;

export type RgbParameterInputInfo = MakeParameterInputInfo<
    "rgb",
    object,
    [number, number, number],
    "vec3"
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectParameterInputInfo<V extends ParameterValueType = any> = MakeParameterInputInfo<
    "select",
    {
        options: Array<{ label: string; value: V }>;
    },
    V,
    V
>;

export type ParameterInputInfo =
    | NumberParameterInputInfo
    | RgbParameterInputInfo
    | SelectParameterInputInfo;

/**
 * Describes a parameter that can be passed to a material node.
 * This structure only stores information about what that parameter is,
 * the actual value is stored inside a specific {@link MaterialNode}.
 */
export type MaterialNodeParameterInfo = {
    /** A string uniquely identifying this parameter among others. */
    id: string;

    /** Human-readable name of this parameter. */
    name: string;

    when?: string;
} & ParameterInputInfo;
