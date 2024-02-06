const mongoose = require('mongoose');
// const Tour = require('./tourModel');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
    maxlength: [
      1000,
      'A product name must have less or equal than 1000 characters'
    ],
    minlength: [5, 'A product name must have more or equal than 5 characters']
  },
  amountAvailable: {
    type: Number,
    required: [true, 'A product must have an amount available'],
    min: [0, 'Amount available must be above 0']
  },
  cost: {
    type: Number,
    required: [true, 'A product must have a cost'],
    min: [0, 'Cost must be above 0']
  },
  sellerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A product must belong to a seller']
  }
});
productSchema.index({ productName: 1, sellerId: 1 }, { unique: true });
// for calling the calcAverageRatings function after creating a new product
// productSchema.post('save', function() {
//   // this points to current product
//   // this.constructor points to the current model
//   this.constructor.calcAverageRatings(this.tour);
// });
// productSchema.pre(/^find/, function(next) {
//   // this.populate({
//   //   path: 'user', // the field that we want to populate
//   //   select: 'name photo' // the fields that we want to exclude from the output
//   // }).populate({
//   //   path: 'tour', // the field that we want to populate
//   //   select: 'name' // the fields that we want to exclude from the output
//   // });
//   this.populate({
//     path: 'user', // the field that we want to populate
//     select: 'name photo' // the fields that we want to exclude from the output
//   });
//   next();
// });
// for updating the average rating , total number of ratings of a tour after updating or deleting a product
// we will use the pre query middleware
//  findOneAnd will work for both findByIdAndUpdate and findByIdAndDelete
// productSchema.pre(/^findOneAnd/, async function(next) {
//   // print the current query filter
//   // console.log(this.getFilter());
//   // const r = await this.findOne(); // this.findOne() will return the document before the update or delete operation
//   this.r = await this.findOne(); // this.r will be used in the post query middleware
// });
// productSchema.post(/^findOneAnd/, async function() {
//   // await this.findOne(); does NOT work here, query has already executed
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// });

const Product = mongoose.model('Product', productSchema); // create in the database a collection named 'Product' with the schema 'ProductSchema'
module.exports = Product;
