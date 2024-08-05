import { productsData } from "./products.js";

const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDom = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonDoms = [];
//get products
class Products {
  getProducts() {
    return productsData;
  }
}

//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<div class="product">
          <div class="img-container">
            <img src=${product.imageUrl} class="product-img" />
          </div>
          <div class="product-desc">
            <p class="product-price">$ ${product.price}</p>
            <p class="product-title">${product.title}</p>
          </div>
          <button class="btn add-to-cart" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to cart
          </button>
        </div>`;
      productsDom.innerHTML = result;
    });
  }
  getCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonDoms = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        cart = [...cart, addedProduct];
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItems(addedProduct);
      });
    });
  }
  setCartValue(cart) {
    let countItem = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      countItem += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `total price : ${totalPrice.toFixed(2)} $`;
    cartItems.innerText = countItem;
  }
  addCartItems(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<div><img class="cart-item-img" src=${cartItem.imageUrl} /></div>
 <div class="cart-item-desc">
   <h4>${cartItem.title}</h4>
   <h5>$ ${cartItem.price}</h5>
 </div>
 <div class="cart-item-conteoller">
   <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
   <p class="item-quantity">${cartItem.quantity}</p>
   <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
 </div>
 <i class="fas fa-trash remove-item" data-id=${cartItem.id}></i>
 `;
    cartContent.appendChild(div);
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    cart.forEach((cartItem) => {
      this.addCartItems(cartItem);
    });
  }
  cartLogic() {
    clearCart.addEventListener("click", () => this.clearCart());

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up")) {
        const addQuantity = event.target;
        const addedItem = cart.find(
          (item) => item.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash")) {
        const removeItem = event.target;
        const _removedItem = cart.find(
          (item) => item.id == removeItem.dataset.id
        );
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const decItem = cart.find((item) => item.id == subQuantity.dataset.id);
        if (decItem.quantity === 1) {
          this.removeItem(subQuantity.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
        }
        decItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = decItem.quantity;
      }
    });
  }
  clearCart() {
    cart.forEach((cartItem) => this.removeItem(cartItem.id));
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }
  removeItem(id) {
    cart = cart.filter((citem) => citem.id != id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    this.getSingleBtn(id);
  }
  getSingleBtn(id) {
    const button = buttonDoms.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerHTML = '<i class="fas fa-shopping-cart"></i> add to cart';
    button.classList.add("btn", "add-to-cart");
    button.disabled = false;
  }
}

//save products on local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"))
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});

function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);
