const APIFeatures = require('../util/APIFeatures');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/ErrorHandling');
const Product = require('./../Models/productModel');
const factory = require('./handlerFactory');

exports.getAllProducts = factory.getAll(Product);
exports.setUserIds = (req, res, next) => {
  if (!req.body.user) req.body.sellerId = req.user.id;
  next();
};
// Middleware to check if the current user is the seller of the product
exports.checkIsSeller = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  if (req.user.id !== product.sellerId.toString()) {
    return res
      .status(403)
      .json({ message: 'You are not authorized to modify this product' });
  }
  next();
};

exports.getProduct = factory.getOne(Product);
exports.createProduct = factory.createOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);

exports.getUserProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Product.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const ProductDocs = await features.query; // execute the query to get the documents from the collection 'Product'
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: ProductDocs.length,
    data: {
      Products: ProductDocs
    }
  });
});
