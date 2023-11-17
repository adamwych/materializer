import { MaterialSnapshot } from "../types";

export default interface IWebGLPreviewRenderer {
    render(material: MaterialSnapshot): void;
}
