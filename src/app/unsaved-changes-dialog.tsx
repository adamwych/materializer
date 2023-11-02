import Dialog from "../components/dialog/dialog";

interface Props {
    materialName: string;
    onSave(): void;
    onClose(): void;
    onCancel(): void;
}

export default function UnsavedChangesDialog(props: Props) {
    return (
        <Dialog
            title="Unsaved Changes"
            buttons={[
                {
                    label: "Save changes",
                    onClick: props.onSave,
                },
                {
                    label: "Close without saving",
                    onClick: props.onClose,
                },
                {
                    label: "Cancel",
                    onClick: props.onCancel,
                },
            ]}
            onClose={props.onCancel}
        >
            <p class="text-center">
                Material "{props.materialName}" has unsaved changes. Do you want to save it?
            </p>
        </Dialog>
    );
}
