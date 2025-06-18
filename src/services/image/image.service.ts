import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

import { ImageInfoService, ImageServiceResponse } from "src/models/image/image.info.service";
import { SortType } from "src/models/image/image.sort.type";

interface ImageSizeInfo {
    name: string;
    size: number;
}

interface ImageDateInfo {
    name: string;
    modified: Date
}

@Injectable()
export class ImageService {
    constructor() {
        if(!fs.existsSync("images")) {
            fs.mkdirSync("images");
        }
    }

    getInstanceWeight(): number {
        const userDirNames: string[] = fs.readdirSync("images");
        const totalAssignedUsers: number = userDirNames.length;
        let totalImages: number = 0;

        if(totalAssignedUsers === 0) {
            return 0;
        }

        for(const dirName of userDirNames) {
            const imageNames: string[] = fs.readdirSync(path.join("images", dirName));
            totalImages += imageNames.length;
        }

        return totalImages / totalAssignedUsers;
    }

    async uploadImage(userID: string, file: Express.Multer.File)
    : Promise<{
        rejected: boolean;
        error: boolean;
        message: string;
    }> {
        const userFilePath: string = path.join("images", userID);
        const splitFilename: string[] = file.originalname.split(".");
        const imageType: string = splitFilename[splitFilename.length - 1];

        if(!["jpg", "jpeg", "png"].includes(imageType)) {
            return {
                rejected: true,
                error: false,
                message: "Invalid file type."
            };
        }

        if(!fs.existsSync(userFilePath)) {
            fs.mkdirSync(userFilePath);
        }

        try {
            fs.writeFileSync(path.join(userFilePath, file.originalname), file.buffer);
        } catch(error) {
            console.error(`Error in ImageService::uploadImage - failed to upload file: ${error}`);
            return {
                rejected: false,
                error: true,
                message: "Internal server error."
            };
        }


        return {
            rejected: false,
            error: false,
            message: ""
        };
    }

    getUserImages(userID: string, page: number, offset: number, ascending: boolean, sortBy: SortType): ImageServiceResponse {
        let imageBuffers: ImageInfoService[] = [];
        const userFilePath: string = path.join("images", userID);

        if(!fs.existsSync(userFilePath)) {
            return { 
                images: [],
                meta: {
                    total: 0,
                    pages: 0
                }
            };
        }

        let imageNames: string[] = fs.readdirSync(userFilePath);
        
        switch(sortBy) {
            case "name": {
                imageBuffers = this.getImagesByName(userFilePath, ascending, page, offset, imageNames);
                break;
            }
            case "size": {
                imageBuffers = this.getImagesBySize(userFilePath, ascending, page, offset, imageNames);
                break;
            }
            case "date": {
                imageBuffers = this.getImagesByDate(userFilePath, ascending, page, offset, imageNames);
            }
        }

        return {
            images: imageBuffers,
            meta: {
                total: imageNames.length,
                pages: Math.ceil(imageNames.length / offset)
            }
        };
    }

    getImagesByName(userFilePath: string, asceding: boolean, page: number, offset: number, imageNames: string[]): ImageInfoService[] {
        let imageBuffers: ImageInfoService[] = [];
        const sortedImageNames: string[] = imageNames.sort((a: string, b: string) => {
            return asceding ? a.localeCompare(b) : b.localeCompare(a);
        });
        const selectedImageNames = sortedImageNames.slice((page - 1)*offset, page * offset);

        for(const imageName of selectedImageNames) {
            const data: Buffer = fs.readFileSync(path.join(userFilePath, imageName));
            imageBuffers.push({
                name: imageName,
                data: data
            });
        }

        return imageBuffers;
    }

    getImagesBySize(userFilePath: string, asceding: boolean, page: number, offset: number, imageNames: string[]): ImageInfoService[] {
        let imageBuffers: ImageInfoService[] = [];
        let imageSizeInfo: ImageSizeInfo [] = [];

        for(const name of imageNames) {
            imageSizeInfo.push({
                name: name,
                size: fs.statSync(path.join(userFilePath, name)).size
            });
        }

        imageSizeInfo = imageSizeInfo.sort((a: ImageSizeInfo, b: ImageSizeInfo) => {
            return asceding ? (a.size < b.size ? 1 : -1) : (b.size < a.size ? 1 : -1); 
        });
        const selectedImages: string[] = imageSizeInfo.slice((page - 1)*offset, page * offset).map((imageSizeInfo: ImageSizeInfo) => imageSizeInfo.name);

        for(const imageName of selectedImages) {
            const data: Buffer = fs.readFileSync(path.join(userFilePath, imageName));
            imageBuffers.push({
                name: imageName,
                data: data
            });
        }

        return imageBuffers
    }

    getImagesByDate(userFilePath: string, ascending: boolean, page: number, offset: number, imageNames: string[]): ImageInfoService[] {
        let imageBuffers: ImageInfoService[] = [];
        let imageDateInfo: ImageDateInfo[] = [];

        for(const name of imageNames) {
            imageDateInfo.push({
                name: name,
                modified: fs.statSync(path.join(userFilePath, name)).mtime
            });
        }

        imageDateInfo = imageDateInfo.sort((a: ImageDateInfo, b: ImageDateInfo) => {
            return ascending ? (a.modified < b.modified ? 1 : -1) : (b.modified < a.modified ? 1 : -1);
        });
        const selectedImageNames: string[] = imageDateInfo.slice((page - 1) * offset, page * offset).map((info: ImageDateInfo) => info.name);

        for(const name of selectedImageNames) {
            const data: Buffer = fs.readFileSync(path.join(userFilePath, name));
            imageBuffers.push({
                name: name,
                data: data
            });
        }

        return imageBuffers;
    }

    deleteUserImage(userID: string, filename: string): {
        rejected: boolean;
        error: boolean;
        message: string;
    } {
        const filepath: string = path.join("images", userID, filename);

        if(filename === "") {
            return {
                rejected: true,
                error: false,
                message: "No file provided."
            }
        }

        if(!fs.existsSync(filepath)) {
            return {
                rejected: true,
                error: false,
                message: "File not found."
            };
        }

        try {
            fs.rmSync(filepath);
        } catch(error) {
            console.error(`Error in ImageService::deleteUserImage - failed to delete user image: ${error}`);
            return {
                rejected: false,
                error: true,
                message: "Internal server error."
            };
        }

        return {
            rejected: false,
            error: false,
            message: ""
        };
    }
}