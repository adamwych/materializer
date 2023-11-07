export enum ExportImageFormat {
    Png = "image/png",
    Jpeg = "image/jpeg",
}

export function getExportImageFormatName(format: ExportImageFormat) {
    switch (format) {
        case ExportImageFormat.Png:
            return "PNG";
        case ExportImageFormat.Jpeg:
            return "JPEG";
    }
}

export function getExportImageFileExtension(format: ExportImageFormat) {
    switch (format) {
        case ExportImageFormat.Png:
            return "png";
        case ExportImageFormat.Jpeg:
            return "jpg";
    }
}

export function getExportImageFormatMimeType(format: ExportImageFormat) {
    switch (format) {
        case ExportImageFormat.Png:
            return "image/png";
        case ExportImageFormat.Jpeg:
            return "image/jpeg";
    }
}
