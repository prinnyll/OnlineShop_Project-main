const stripe = require("stripe");

const Order = require("../models/order.model");
const User = require("../models/user.model");

const stripeObj = stripe("sk_test_wU7nrJCZspk1NPDxiQgAF05q");

async function getOrders(req, res) {
  try {
    const orders = await Order.findAllForUser(res.locals.uid);
    res.render("customer/orders/all-orders", {
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function addOrder(req, res, next) {
  const cart = res.locals.cart;

  let userDocument;
  try {
    userDocument = await User.findById(res.locals.uid);
  } catch (error) {
    return next(error);
  }

  const order = new Order(cart, userDocument);

  try {
    await order.save();
  } catch (error) {
    next(error);
    return;
  }

  req.session.cart = null;

  const session = await stripeObj.checkout.sessions.create({
    line_items: cart.items.map(function (item) {
      return {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.title,
          },
          unit_amount: +item.product.price.toFixed(2) * 100,
          //unit_amount: cart.totalPrice * 100,
        },
        quantity: item.quantity,
      };
    }),
    mode: "payment",
    success_url: `https://onlineshop-project-h5dd.onrender.com/orders/success`,
    cancel_url: `https://onlineshop-project-h5dd.onrender.com/orders/failure`,

    // success_url: `http://localhost:3000/orders/success`,
    // cancel_url: `http://localhost:3000/orders/failure`,
  });

  res.redirect(303, session.url);
}

const getSuccess = async (req, res) => {
  const orders = await Order.findAllForUser(res.locals.uid);
  res.render("customer/orders/success", { orders: orders });
};

const getFailure = async (req, res) => {
  const orders = await Order.findAllForUser(res.locals.uid);
  res.render("customer/orders/failure", { orders: orders });
};

module.exports = {
  addOrder: addOrder,
  getOrders: getOrders,
  getSuccess: getSuccess,
  getFailure: getFailure,
};
