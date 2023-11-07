import Dialog from "../components/dialog/dialog.tsx";
import ImportMaterialFromFilePanel from "./import-from-file.tsx";
import ImportMaterialFromLocalStoragePanel from "./import-from-local-storage.tsx";

export default function OpenMaterialDialog() {
    return (
        <Dialog title="Open">
            <ImportMaterialFromFilePanel />
            <hr class="my-4" />
            <ImportMaterialFromLocalStoragePanel />
        </Dialog>
    );
}
