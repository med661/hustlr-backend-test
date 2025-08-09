const express = require('express');
const { getAllProducts, getProductDetails, updateProduct, deleteProduct, getProductReviews, deleteReview, createProductReview, createProduct, getAdminProducts, getProducts } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/user_actions/auth');
const { validateProduct } = require("../middlewares/validator")

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API endpoints
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination and filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for product name
 *         example: "iPhone"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *         example: 100
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *         example: 1000
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: "Electronics"
 *       - in: query
 *         name: ratings[gte]
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *         example: 4
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/products').get(getAllProducts);

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get all products without pagination (for sliders/carousels)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/products/all').get(getProducts);


/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

/**
 * @swagger
 * /admin/product/new:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *               - brandname
 *             properties:
 *               name:
 *                 type: string
 *                 example: "iPhone 14 Pro"
 *               description:
 *                 type: string
 *                 example: "Latest iPhone with advanced camera system"
 *               price:
 *                 type: number
 *                 example: 999.99
 *               discountPrice:
 *                 type: number
 *                 example: 899.99
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               stock:
 *                 type: number
 *                 example: 50
 *               brandname:
 *                 type: string
 *                 example: "Apple"
 *               warranty:
 *                 type: number
 *                 example: 1
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['{"title":"Display","description":"6.1-inch Super Retina XDR"}']
 *                 description: "Array of JSON strings containing specifications"
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["High quality product", "Latest technology"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Product images (multiple files supported)"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: "Brand logo image file"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);


router.route('/review').put(isAuthenticatedUser, createProductReview);


router.route('/admin/reviews')
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview);


/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: Successfully retrieved product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/product/:id').get(getProductDetails);

// Test authentication endpoint
router.route('/test-auth').get(isAuthenticatedUser, (req, res) => {
    res.json({
        success: true,
        message: "Authentication successful",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;