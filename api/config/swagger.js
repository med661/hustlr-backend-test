const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'A comprehensive ecommerce API with product management, user authentication, and order processing',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:4001/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://your-production-domain.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'description', 'category', 'stock'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'iPhone 14 Pro'
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Latest iPhone with advanced camera system'
            },
            price: {
              type: 'number',
              description: 'Product price',
              example: 999.99
            },
            discountPrice: {
              type: 'number',
              description: 'Discounted price',
              example: 899.99
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Electronics'
            },
            stock: {
              type: 'number',
              description: 'Available stock',
              example: 50
            },
            ratings: {
              type: 'number',
              description: 'Average rating',
              example: 4.5
            },
            numOfReviews: {
              type: 'number',
              description: 'Number of reviews',
              example: 125
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  public_id: {
                    type: 'string'
                  },
                  url: {
                    type: 'string'
                  }
                }
              }
            },
            brand: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Apple'
                },
                logo: {
                  type: 'object',
                  properties: {
                    public_id: {
                      type: 'string'
                    },
                    url: {
                      type: 'string'
                    }
                  }
                }
              }
            },
            specifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  }
                }
              }
            },
            warranty: {
              type: 'string',
              example: '1 year'
            },
            returnPolicy: {
              type: 'string',
              example: '30 days'
            },
            user: {
              type: 'string',
              description: 'User ID who created the product'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ProductsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            productsCount: {
              type: 'number',
              example: 100
            },
            resultPerPage: {
              type: 'number',
              example: 12
            },
            filteredProductsCount: {
              type: 'number',
              example: 25
            }
          }
        },
        ProductResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            product: {
              $ref: '#/components/schemas/Product'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./api/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
