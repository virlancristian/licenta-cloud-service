export interface ImageInfoService {
    name: string;
    data: Buffer
};

export interface ImageServiceResponse {
    images: ImageInfoService[],
    meta: {
        total: number;
        pages: number;
    }
}