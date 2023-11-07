import Dialog from "../components/dialog/dialog.tsx";
import ImportMaterialFromFilePanel from "./import-from-file.tsx";
import ImportMaterialFromLocalStoragePanel from "./import-from-local-storage.tsx";

interface Props {
    onClose(): void;
}

export default function OpenMaterialDialog(props: Props) {
    return (
        <Dialog title="Open" onClose={props.onClose}>
            <ImportMaterialFromFilePanel onClose={props.onClose} />
            <hr class="my-4" />
            <ImportMaterialFromLocalStoragePanel onClose={props.onClose} />
        </Dialog>
    );
}
