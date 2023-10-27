import { JSX } from "solid-js/jsx-runtime";

export default function PanelSection(props: { label: string; children: JSX.Element }) {
    return (
        <section>
            <div class="px-4 py-2 bg-gray-300-0 border-b border-gray-400-0 text-gray-800-0">
                <span class="text-sm font-semibold uppercase">{props.label}</span>
            </div>
            <div class="p-4">{props.children}</div>
        </section>
    );
}