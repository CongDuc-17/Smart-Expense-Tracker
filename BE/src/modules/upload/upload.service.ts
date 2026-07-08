import { Readable } from 'stream';

import { UploadApiResponse, UploadApiOptions } from 'cloudinary';

import { InternalServerException } from '@/common';
import { cloudinary } from '@/configs';

export type UploadContext = 'expense' | 'avatar' | 'ocr';

export class UploadService {
	/**
	 * Tải một buffer ảnh lên Cloudinary
	 * @param buffer Dữ liệu ảnh dạng nhị phân
	 * @param context Ngữ cảnh upload (dùng để chia folder và tự động resize)
	 * @returns Kết quả từ Cloudinary
	 */
	public async uploadImage(
		buffer: Buffer,
		context: UploadContext,
	): Promise<UploadApiResponse> {
		return new Promise((resolve, reject) => {
			let folder = 'smart_expense/misc';
			let transformation: UploadApiOptions['transformation'] = [];

			if (context === 'expense') {
				folder = 'smart_expense/expenses';
			} else if (context === 'avatar') {
				folder = 'smart_expense/avatars';
				// Avatar nên được crop vuông nhỏ gọn
				transformation = [{ width: 200, height: 200, crop: 'fill' }];
			} else if (context === 'ocr') {
				folder = 'smart_expense/ocr';
			}

			const options: UploadApiOptions = {
				folder,
				transformation,
				resource_type: 'image',
			};

			const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error) {
					console.error('Cloudinary Upload Error:', error);
					reject(new InternalServerException());
				} else if (result) {
					resolve(result);
				}
			});

			// Chuyển Buffer thành Readable stream rồi pipe vào Cloudinary
			Readable.from(buffer).pipe(stream);
		});
	}

	/**
	 * Xóa một ảnh khỏi Cloudinary dựa theo publicId
	 * Fire-and-forget: Không throw lỗi ra ngoài để tránh block quy trình chính
	 * @param publicId ID public của ảnh trên Cloudinary
	 */
	public async deleteImage(publicId: string): Promise<void> {
		try {
			await cloudinary.uploader.destroy(publicId);
		} catch (error) {
			console.error(`Failed to delete image with publicId ${publicId}:`, error);
		}
	}
}
