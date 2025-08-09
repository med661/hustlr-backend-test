const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/helpers/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');

// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    console.log("=== API CALL: Getting all products ===");
    if (!req.query || Object.keys(req.query).length === 0) {
        console.log("No query parameters provided");
        const products = await Product.find();
        res.status(200).json({
            success: true,
            productsCount: products.length,
            products,
        });
        return;
        
    }

    const resultPerPage = 12;
    const productsCount = await Product.countDocuments();

    // Create search feature for counting filtered products
    const searchFeatureForCount = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter();

    const filteredProducts = await searchFeatureForCount.query;
    const filteredProductsCount = filteredProducts.length;

    // Create new search feature for paginated results
    const searchFeature = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    const products = await searchFeature.query;
    console.log("Products:", products);

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products ---Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
console.log("=== API CALL: Getting product details ===");   
console.log("Request params:", req.params);
let { id } = req.params
    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Products ---ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

// Create Product ---ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    console.log("=== API CALL: Creating new product ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User:", req.user.name);

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = process.env.CLOUDINARY_NAME &&
                                   process.env.CLOUDINARY_API_KEY &&
                                   process.env.CLOUDINARY_API_SECRET &&
                                   process.env.CLOUDINARY_NAME !== 'your_cloud_name';

    console.log("Cloudinary configured:", isCloudinaryConfigured);
    console.log("Cloudinary name:", process.env.CLOUDINARY_NAME);

    let imagesLink = [];
    let brandLogo = {};

    if (isCloudinaryConfigured) {
        // Use Cloudinary if configured
        console.log("Using Cloudinary for image uploads");

        // Handle product images
        let images = [];
        if (req.files && req.files.images) {
            // Handle file uploads from multipart/form-data
            const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (let imageFile of imageFiles) {
                const result = await cloudinary.v2.uploader.upload(imageFile.tempFilePath || `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}`, {
                    folder: "products",
                    resource_type: "auto"
                });
                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        } else if (req.body.images) {
            // Handle base64 images from JSON
            if (typeof req.body.images === "string") {
                images.push(req.body.images);
            } else {
                images = req.body.images;
            }

            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: "products",
                });
                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        }

        // Handle brand logo
        if (req.files && req.files.logo) {
            // Handle file upload
            const logoFile = req.files.logo;
            const result = await cloudinary.v2.uploader.upload(logoFile.tempFilePath || `data:${logoFile.mimetype};base64,${logoFile.data.toString('base64')}`, {
                folder: "brands",
                resource_type: "auto"
            });
            brandLogo = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        } else if (req.body.logo) {
            // Handle base64 logo
            const result = await cloudinary.v2.uploader.upload(req.body.logo, {
                folder: "brands",
            });
            brandLogo = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        } else {
            // Default brand logo
            brandLogo = {
                public_id: `brand_${Date.now()}`,
                url: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=200"
            };
        }

        // If no images were uploaded, use default
        if (imagesLink.length === 0) {
            imagesLink = [
                {
                    public_id: `product_${Date.now()}_1`,
                    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                }
            ];
        }
    } else {
        // Use placeholder images if Cloudinary is not configured
        console.log("Cloudinary not configured, using placeholder images");

        imagesLink = [
            {
                public_id: `product_${Date.now()}_1`,
                url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
            },
            {
                public_id: `product_${Date.now()}_2`,
                url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500"
            }
        ];

        brandLogo = {
            public_id: `brand_${Date.now()}`,
            url: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=200"
        };
    }

    // Prepare product data
    const productData = {
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        cuttedPrice: Number(req.body.discountPrice) || Number(req.body.price),
        category: req.body.category,
        stock: Number(req.body.stock),
        warranty: req.body.warranty ? (typeof req.body.warranty === 'string' ? parseInt(req.body.warranty) : Number(req.body.warranty)) : 1,
        images: imagesLink,
        brand: {
            name: req.body.brandname,
            logo: brandLogo
        },
        user: req.user.id,
        highlights: req.body.highlights ? (Array.isArray(req.body.highlights) ? req.body.highlights : [req.body.highlights]) : ["High quality product"],
        specifications: []
    };

    // Handle specifications
    if (req.body.specifications) {
        let specs = [];
        if (Array.isArray(req.body.specifications)) {
            req.body.specifications.forEach((s) => {
                try {
                    specs.push(typeof s === 'string' ? JSON.parse(s) : s);
                } catch (e) {
                    specs.push({ title: "Specification", description: s });
                }
            });
        } else {
            try {
                specs.push(typeof req.body.specifications === 'string' ? JSON.parse(req.body.specifications) : req.body.specifications);
            } catch (e) {
                specs.push({ title: "Specification", description: req.body.specifications });
            }
        }
        productData.specifications = specs;
    }

    console.log("Final product data:", productData);

    const product = await Product.create(productData);

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        product
    });
});

// Update Product ---ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    if (req.body.images !== undefined) {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLink;
    }

    if (req.body.logo.length > 0) {
        await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        req.body.brand = {
            name: req.body.brandname,
            logo: brandLogo
        }
    }

    let specs = [];
    req.body.specifications.forEach((s) => {
        specs.push(JSON.parse(s))
    });
    req.body.specifications = specs;
    req.body.user = req.user.id;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(201).json({
        success: true,
        product
    });
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(201).json({
        success: true
    });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

    if (isReviewed) {

        product.reviews.forEach((rev) => { 
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating, rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});

// Delete Reveiws
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings: Number(ratings),
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});