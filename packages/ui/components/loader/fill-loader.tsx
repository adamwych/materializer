import { RiSystemLoader2Fill } from "solid-icons/ri";

export default function FillLoader() {
    return (
        <div
            class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-25 z-50"
            onPointerDown={(e) => e.stopPropagation()}
        >
            <RiSystemLoader2Fill class="animate-spin" size={24} />
        </div>
    );
}
