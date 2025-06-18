import { Body, Controller, Delete, Get, HttpStatus, Post, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Request, Response } from "express";

import { ImageService } from "src/services/image/image.service";
import { ImageUploadRequest } from "src/models/image/image.upload.request";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageInfoService } from "src/models/image/image.info.service";
import { ImageListResponse } from "src/models/image/image.info.controller";
import { SortType } from "src/models/image/image.sort.type";

@Controller("/image")
export class ImageController {
    constructor(
        private readonly imageService: ImageService
    ) {}

    @Post("/upload")
    @UseInterceptors(FileInterceptor("image"))
    async uploadImage(
        @UploadedFile() image: Express.Multer.File,
        @Body() imageRequestData: ImageUploadRequest,
        @Res() response: Response
    ): Promise<Response<{
        message: string;
    }>> {
        const { userID } = imageRequestData;

        if(userID === undefined) {
            return response.status(HttpStatus.BAD_REQUEST).send({ message: "No user provided." });
        }

        if(image === undefined) {
            return response.status(HttpStatus.BAD_REQUEST).send({ message: "No image provided." });
        }

        const { rejected, error, message } = await this.imageService.uploadImage(userID, image);

        if(rejected || error) {
            return response.status(rejected ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR).send({ message: message });
        }

        return response.status(HttpStatus.CREATED).send({ message: "" });
    }

    @Get("/list")
    async getUserImages(
        @Req() request: Request,
        @Res() response: Response
    ): Promise<Response<{ images: ImageListResponse }>> {
        let { page, offset, ascending, sortBy } = request.query;
        const userID: string | string[] | undefined = request.headers["user"];

        if(page === undefined) {
            page = "1";
        }

        if(offset === undefined) {
            offset = "10";
        }

        if(ascending === undefined) {
            ascending = "false";
        }

        const { images, meta } = this.imageService.getUserImages(userID as string, Number.parseInt(page as string), Number.parseInt(offset as string), ascending === 'true', sortBy as SortType);

        return response.status(HttpStatus.OK).send({
            images: images.map((image: ImageInfoService) => ({
                filename: image.name,
                data: `data:image/${image.name.split('.').pop()};base64,${image.data.toString('base64')}`
            })),
            meta: meta
        });
    }

    @Delete("/delete")
    async deleteImage(
        @Req() request: Request,
        @Body() body: { file: { name: string } },
        @Res() response: Response
    ): Promise<Response<{ message: string }>> {
        const userID: string | string[] | undefined = request.headers["user"];

        if(userID === undefined) {
            return response.status(HttpStatus.BAD_REQUEST).send({
                message: "User not provided."
            });
        }

        if(body === undefined || body.file === undefined || body.file.name === undefined) {
            return response.status(HttpStatus.BAD_REQUEST).send({
                message: "No file provided."
            });
        }

        const { rejected, error, message } = this.imageService.deleteUserImage(userID as string, body.file.name);

        if(rejected || error) {
            return response.status(rejected ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: message
            });
        }

        return response.status(HttpStatus.OK).send({
            message: ""
        });
    }

    @Get("/list/weight")
    async getInstanceWeight(
        @Res() response: Response
    ): Promise<Response<{ weight: number }>> {
        const weight: number = this.imageService.getInstanceWeight();

        return response.status(HttpStatus.OK).send({ weight: weight });
    }

}