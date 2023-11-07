export type TextureType = "grayscale" | "rgb";

export type MaterialNodeSocketInfo = {
    id: string;
    textureType: TextureType;
    hidden: boolean;
};

export type MaterialNodeSocketAddr = [number, string];
