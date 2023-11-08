enum TextureFilterMethod {
    Linear = 0,
    Nearest = 1,
}

export function mapFilterMethodToGL(method: TextureFilterMethod) {
    return method === TextureFilterMethod.Linear ? 0x2601 : 0x2600;
}

export default TextureFilterMethod;
