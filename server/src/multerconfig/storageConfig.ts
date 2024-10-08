// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // storage config
// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, uploadsDir);
//   },
//   filename: (req, file, callback) => {
//     const filename = `image-${Date.now()}.${file.originalname}`;
//     callback(null, filename);
//   }
// });

// // filter 
// const filefilter: multer.Options['fileFilter'] = (req, file, callback) => {
//   // File size validation
//   const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
//   if (file.size > MAX_FILE_SIZE) {
//     return callback(new Error("File size exceeds 1 MB limit"));
//   }

//   // MIME type validation
//   switch (file.mimetype) {
//     case "image/png":
//     case "image/jpg":
//     case "image/jpeg":
//       callback(null, true);
//       break;
//     default:
//       callback(null, false);
//       return callback(new Error("Only .png, .jpg & .jpeg formats are allowed"));
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: filefilter
// });

// export default upload;

import multer from 'multer';
import path from 'path';
import fs from 'fs';


// Directories for uploads
const userProfileDir = path.join(__dirname, '..', 'public', 'uploads', 'userProfilePics');
const productImagesDir = path.join(__dirname, '..', 'public', 'uploads', 'productImages');

// Ensure directories exist on server start
const ensureDirectoriesExist = () => {
  if (!fs.existsSync(userProfileDir)) {
    fs.mkdirSync(userProfileDir, { recursive: true });
    console.log('Created directory: ', userProfileDir);
  }
  if (!fs.existsSync(productImagesDir)) {
    fs.mkdirSync(productImagesDir, { recursive: true });
    console.log('Created directory: ', productImagesDir);
  }
};

// Call the function when the server starts
ensureDirectoriesExist();

// Multer storage configuration for user profile pics and product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Default to userProfileDir if type is not specified
    const uploadDir = file.fieldname === 'profilePicture' ? userProfileDir : productImagesDir;
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
  }
};


// Initialize Multer middleware
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
    }
  },
});

export const uploadProductImages = upload.array('productImages', 4); 
export const uploadProfilePicture = upload.single('profilePicture');
