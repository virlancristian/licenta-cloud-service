export interface ImageInfoController {
    filename: string;
    data: string;
}

export interface ImageListResponse {
    images: ImageInfoController[],
    meta: {
        total: number;
        pages: number;
    }
};