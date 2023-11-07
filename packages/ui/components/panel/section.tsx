import { JSX } from "solid-js/jsx-runtime";

export default function PanelSection(props: { label: string; children: JSX.Element }) {
    return (
        <section>
            <div class="px-4 py-2 bg-gray-200 border-b border-gray-300 text-gray-800">
                <span class="text-sm font-semibold uppercase">{props.label}</span>
            </div>
            <div>{props.children}</div>
        </section>
    );
}
