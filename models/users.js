const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
 
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {

            const cartProductIndex = this.cart.items.findIndex(cp=> {
            return cp.productId.toString() === product._id.toString()
        })

        let newquantity = 1;
        const updatedCartItems = [...this.cart.items]; 

        if(cartProductIndex >= 0 ){
            newquantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newquantity;
        }else{
            updatedCartItems.push({ productId : product._id, quantity : newquantity})   
        }
        const updatedCart = {
            items : updatedCartItems
        }
        this.cart = updatedCart;
        
        return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart = {item: []};
  return this.save();
}

module.exports = mongoose.model('User', userSchema);
// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb')
// const ObjectID = mongodb.ObjectID
// class User {
//     constructor(name , email , cart , id){
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }
//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//         .then(result=>{
//             console.log(result);
//         })
//         .catch(err=>console.log(err));
//     };

//     addToCart(product) {

//         const cartProductIndex = this.cart.items.findIndex(cp=> {
//             return cp.productId.toString() === product._id.toString()
//         })

//         let newquantity = 1;
//         const updatedCartItems = [...this.cart.items]; 

//         if(cartProductIndex >= 0 ){
//             newquantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newquantity;
//         }else{
//             updatedCartItems.push({ productId : new ObjectID(product._id) , quantity : newquantity})   
//         }
//         const updatedCart = {
//             items : updatedCartItems
//         }

//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne(
//             {_id : new ObjectID(this._id)},
//             {$set :{cart : updatedCart}}

//         )
//     }
    

//     getCart() {
//        const db = getDb();
//        const productIds = this.cart.items.map(i=>{
//            return i.productId;
//        });
//        return db
//        .collection('products')
//        .find({_id : {$in: productIds }})
//        .toArray()
//        .then(products =>{
//            return products.map(p =>{
//                return {
//                    ...p,
//                 quantity : this.cart.items.find(i=>{
//                     return i.productId.toString() === p._id.toString();
//                 }).quantity
//             };
//            });
//        });
//     }

//     deleteItemfromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             item.productId.toString() !== productId.toString();
//         })
//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne(
//             {_id : new ObjectID(this._id)},
//             {$set :{cart : {items : updatedCartItems} }}

//         )
//      }
    
//     addOrder() {
//         const db  = getDb();
//         return this.getCart().then(products=>{
//             const order = {
//                 items:products,
//                 user : {
//                     _id : new ObjectID(this._id),
//                     name : this.name
//                  }
//             }
//         return db.collection('orders')
//         .insertOne(order) 

//         })
//         .then(result=>{
//             this.cart.items = {items : []}
//         })
//         return db
//         .collection('users')
//         .updateOne(
//             {_id : new ObjectID(this._id)},
//             {$set :{cart : {items : [] }}}
//          )
//     } 
  
//     getOrders(){
//         const db = getDb();
//         return db.collection('orders')
//         .find({'user._id' : new ObjectID(this._id)})
//         .toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne
//         ({_id : new ObjectID(userId)})
//         .then(user=>{
//             console.log(user);
//             return user
//         })
//         .catch(err=>console.log(err))
//     }
// }

// module.exports = User