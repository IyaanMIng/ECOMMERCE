document.addEventListener("DOMContentLoaded", () => { 
    let cartIcon = document.querySelector("#cart-icon");
    let cart = document.querySelector(".cart");
    let closeCart = document.querySelector("#close-cart");
    let cartContent = document.querySelector(".cart-content");
    let totalPriceElement = document.querySelector(".total-price");
    let emptyCartMessage = document.querySelector(".empty-cart-message");

    // Ensure the error message element is selected correctly
    let errorMessage = document.getElementById("error-message");  // Change here

    // Initialize cart items array to track added items
    let cartItems = [];

    // Load cart items from localStorage on page load
    function loadCartItems() {
        let storedCartItems = localStorage.getItem("cartItems");
        if (storedCartItems) {
            cartItems = JSON.parse(storedCartItems);
            updateCart();
        }
    }

    // Save cart items to localStorage
    function saveCartItems() {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }

    // Update the cart display
    function updateCart() {
        if (cartItems.length === 0) {
            emptyCartMessage.style.display = "block";
            cartContent.innerHTML = `<p class="empty-cart-message">Your cart is empty.</p>`;
            totalPriceElement.textContent = "$0.00";
        } else {
            emptyCartMessage.style.display = "none";
            cartContent.innerHTML = ""; // Clear the cart content
            let totalPrice = 0;

            cartItems.forEach(item => {
                const cartBox = document.createElement("div");
                cartBox.classList.add("cart-box");

                cartBox.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" class="cart-img" />
                    <div class="detail-box">
                        <div class="cart-product-title">${item.title}</div>
                        <div class="cart-price">${item.price}</div>
                        <input type="number" value="${item.quantity}" class="cart-quantity" data-title="${item.title}" />
                    </div>
                    <i class="bx bx-trash-alt cart-remove"></i>`;

                cartContent.append(cartBox);

                // Add event listeners to the remove button and quantity input
                cartBox.querySelector(".cart-remove").addEventListener("click", () => removeCartItem(item));
                cartBox.querySelector(".cart-quantity").addEventListener("change", (event) => quantityChanged(event));

                totalPrice += parseFloat(item.price.replace("$", "")) * item.quantity;
            });

            totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        }

        // Update the cart icon with the total quantity of items
        updateCartIcon();
        saveCartItems();
    }

    // Handle adding items to the cart
    function addCartClicked(event) {
        let button = event.target;
        let shopProducts = button.parentElement;
        let title = shopProducts.querySelector(".product-title").innerText;
        let price = shopProducts.querySelector(".price").innerText;
        let img = shopProducts.querySelector(".product-img").src;

        // Check if the item is already in the cart
        const existingItemIndex = cartItems.findIndex(item => item.title === title);
        if (existingItemIndex !== -1) {
            // Show the error message
            errorMessage.style.display = "block";  // Show error message
            setTimeout(() => {
                errorMessage.style.display = "none"; // Hide the error message after 2 seconds
            }, 2000);
            return;
        }

        // Add item to the cart
        cartItems.push({ title, price, img, quantity: 1 });
        updateCart();
    }

    // Handle removing items from the cart
    function removeCartItem(item) {
        cartItems = cartItems.filter(cartItem => cartItem !== item);
        updateCart();
    }

    // Handle the cart quantity change
    function quantityChanged(event) {
        const input = event.target;
        const title = input.getAttribute("data-title");
        const newQuantity = parseInt(input.value);

        if (isNaN(newQuantity) || newQuantity <= 0) {
            input.value = 1; // Set quantity to 1 if invalid input
        }

        const itemIndex = cartItems.findIndex(item => item.title === title);
        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity = newQuantity; // Update the quantity of the item
        }

        updateCart();
    }

    // Update the cart icon with the total quantity of items
    function updateCartIcon() {
        const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartIcon.setAttribute("data-quantity", totalQuantity);
    }

    // Add event listeners to product add buttons
    let addCartButtons = document.querySelectorAll(".add-cart");
    addCartButtons.forEach(button => {
        button.addEventListener("click", addCartClicked);
    });

    // Cart icon and close functionality
    cartIcon.onclick = () => cart.classList.add("active");
    closeCart.onclick = () => cart.classList.remove("active");

    // Load initial cart state from localStorage
    loadCartItems();
});
// Clear Cart Item After Successful Payment
function clearCart(){
    var cartContent = document.getElementsByClassName("cart-content")[0];
    cartContent.innerHTML = "";
    updatetotal();
    localStorage.removeItem("cartItems");
}