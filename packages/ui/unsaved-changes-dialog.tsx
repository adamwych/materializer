import Button from "./components/button/button";
import Dialog from "./components/dialog/dialog";

type Props = {
    materialName: string;
    onSave(): void;
    onClose(): void;
    onCancel(): void;
};

export default function UnsavedChangesDialog(props: Props) {
    return (
        <Dialog
            title="Unsaved Changes"
            buttons={[
                <Button onClick={props.onSave}>Save changes</Button>,
                <Button onClick={props.onClose}>Close without saving</Button>,
                <Button onClick={props.onCancel}>Cancel</Button>,
            ]}
        >
            <p class="text-center">
                Material "{props.materialName}" has unsaved changes. Do you want to save it?
            </p>
        </Dialog>
    );
}
