enum TextureFilterMethod {
    Linear = 0,
    Nearest = 1,
}

export function mapFilterMethodToGL(method: TextureFilterMethod) {
    return method === TextureFilterMethod.Linear ? 0x2601 : 0x2600;
}

export function mapFilterMethodToMipmapGL(method: TextureFilterMethod) {
    return method === TextureFilterMethod.Linear ? 0x2703 : 0x2702;
}

export default TextureFilterMethod;
