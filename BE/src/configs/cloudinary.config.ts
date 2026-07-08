import { v2 as cloudinary } from 'cloudinary';

import { appEnv } from './app.config';

cloudinary.config({
	cloud_name: appEnv.CLOUDINARY_CLOUD_NAME,
	api_key: appEnv.CLOUDINARY_API_KEY,
	api_secret: appEnv.CLOUDINARY_API_SECRET,
	secure: true,
});

export { cloudinary };
