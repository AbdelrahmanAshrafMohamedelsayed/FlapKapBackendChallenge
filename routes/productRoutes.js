const express = require('express');
const productController = require('../controllers/productControllers');
const authController = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

// router.use(authController.protect); // protect all routes after this middleware (only logged in users can access these routes)

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('seller'),
    productController.setUserIds,
    productController.createProduct
  );
router.route('/:id').get(productController.getProduct);
router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('seller'),
    productController.checkIsSeller,
    productController.deleteProduct
  )
  .patch(
    authController.protect,
    authController.restrictTo('seller'),
    productController.checkIsSeller,
    productController.updateProduct
  );

module.exports = router;
