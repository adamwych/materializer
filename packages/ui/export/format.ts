export enum ExportFileFormat {
    Png = "image/png",
    Jpeg = "image/jpeg",
}

export function getExportFileName(format: ExportFileFormat) {
    switch (format) {
        case ExportFileFormat.Png:
            return "PNG";
        case ExportFileFormat.Jpeg:
            return "JPEG";
    }
}

export function getExportFileExtension(format: ExportFileFormat) {
    switch (format) {
        case ExportFileFormat.Png:
            return "png";
        case ExportFileFormat.Jpeg:
            return "jpg";
    }
}

export function getExportFileMimeType(format: ExportFileFormat) {
    switch (format) {
        case ExportFileFormat.Png:
            return "image/png";
        case ExportFileFormat.Jpeg:
            return "image/jpeg";
    }
}
