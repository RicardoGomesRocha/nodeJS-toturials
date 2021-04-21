const Product = require('../models/product');
const Order = require('../models/order');
exports.getProducts = async (request, response) => {
    const products = await Product.find();
    response.render('shop/product-list', { 
        products, 
        title: 'All Products', 
        path:'/products'
    });
}

exports.getProduct = async(request, response) => {
    const productId = request.params.productId;
    const product = await Product.findById(productId);
    response.render('shop/product-detail',  { 
        product,
        title: product.title,
        path: '/products' 
    });
}


exports.getIndex = async (request, response) => {
    const products = await Product.find();
    response.render('shop/index', { 
        products, 
        title: 'Shop', 
        path:'/'
    });
}


exports.getCart = async (request, response) => {
    const user = await request.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;
    response.render('shop/cart', { 
        title: 'Your cart', 
        path:'/cart', 
        products
    });
}

exports.postCart = async (request, response) => {
    const productId = request.body.productId;
    const product = await Product.findById(productId);
    await request.user.addToCart(product);
    response.redirect('/cart');
}

exports.getCheckout = (request, response) => {
    response.render('shop/checkout', { 
        title: 'Your cart', 
        path:'/checkout', 
    });
}

exports.postCartDeleteProduct = async(request, response) => {
    const productId = request.body.productId;
    await request.user.removeFromCart(productId);
    response.redirect('/cart');
}

exports.postOrder = async (request, response) => {
    const user = await request.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items.map((item) => {
        return {quantity: item.quantity, product: { ...item.productId.toObject() }};
    });
    const order = new Order({
        user: {
            name: user.username,
            userId: user
        },
        products,

    });
    await order.save();
    await user.clearCart();
    response.redirect('/orders');
}

exports.getOrders = async (request, response) => {
    const orders = await Order.find({'user.userId': request.user._id});
    response.render('shop/orders', { 
        title: 'Your orders', 
        path:'/orders',
        orders
    });
}


