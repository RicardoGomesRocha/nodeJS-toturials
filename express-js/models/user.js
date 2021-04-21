const {ObjectId} = require('mongodb');
const { getDb } = require('../util/database');

class User { 
    constructor(username, email, id, cart) {
        this.username = username;
        this.email = email;
        this._id = ObjectId(id);
        this.cart = cart;
    }

    async getCartItems() {
        const db = getDb();
        const productIds = this.cart.items.map((item => item.productId))
        const products = await db.collection('products').find({_id: {$in: productIds}}).toArray();
        return products.map((product) => {
            return {
            ...product, 
            quantity: this.cart.items.find(i => i.productId.toString() === product._id.toString()).quantity
            }
        });
    }

    async save() {
        const db = getDb();
        let user;
        if (this._id) {
            user = await db.collection('users').updateOne({_id: this._id }, {$set: this});
        } else {
            user = await db.collection('users').insertOne(this);
        }
        return product;
    }

    async addToCart(product) {
        const index = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());
        
        let quantity = 1;
        const items = [...this.cart.items];
        
        if (index > -1) {
            quantity = ++this.cart.items[index].quantity;
            items[index].quantity = quantity;
        } else {
            items.push({
                productId: ObjectId(product._id),
                quantity
            })
        }

        const cart = {items};
        const db = getDb();
        await db.collection('users').updateOne({_id: this._id }, {$set: {cart}});
    }

    static async findById(id) {
        const db = getDb();
        return db.collection('users').find({_id: ObjectId(id)}).next();
    }
    
}

module.exports = User;