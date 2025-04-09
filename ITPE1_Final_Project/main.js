
let cart = [];
let cartCount = 0;

// DOM Elements
const cartCountElement = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const continueShoppingBtn = document.getElementById('continue-shopping');
const checkoutBtn = document.getElementById('checkout-btn');
const cartIcon = document.querySelector('.cart-icon');
const newsletterForm = document.getElementById('newsletter-form');


function init() {
    
    loadCart();
    
    // Add event listeners
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.id;
            const productName = productCard.dataset.name;
            const productPrice = parseFloat(productCard.dataset.price);
            const productImage = productCard.querySelector('img').src;
            
            addToCart(productId, productName, productPrice, productImage);
            showNotification(`${productName} added to cart!`);
        });
    });
    
    // Cart modal events
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeCartModal);
    }
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', closeCartModal);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                showNotification('Thank you for subscribing!');
                this.reset();
            }
        });
    }
    
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchInput = document.querySelector('.search-box input').value;
            if (searchInput.trim() !== '') {
                showNotification(`Searching for: ${searchInput}`);
                // In a real application, this would redirect to search results
            }
        });
    }
}

// Add product to cart
function addToCart(id, name, price, image) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    // Update cart count and storage
    updateCartCount();
    saveCart();
}

// Remove product from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartCount();
    updateCartUI();
    saveCart();
}

// Update item quantity
function updateQuantity(id, newQuantity) {
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            removeFromCart(id);
        }
        
        updateCartCount();
        updateCartUI();
        saveCart();
    }
}

// Update cart count display
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = cartCount;
    
    // Show/hide cart count
    if (cartCount > 0) {
        cartCountElement.style.display = 'flex';
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Save cart to local storage
function saveCart() {
    localStorage.setItem('shopEasyCart', JSON.stringify(cart));
}

// Load cart from local storage
function loadCart() {
    const savedCart = localStorage.getItem('shopEasyCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}


function openCartModal() {
    updateCartUI();
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}


function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = '';
}


function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotalPrice.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                <button class="quantity-btn increase">+</button>
            </div>
            <div class="remove-item">
                <i class="fas fa-trash"></i>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
        
        // Add event listeners for quantity buttons
        const decreaseBtn = cartItemElement.querySelector('.decrease');
        const increaseBtn = cartItemElement.querySelector('.increase');
        const quantityInput = cartItemElement.querySelector('.quantity-input');
        const removeBtn = cartItemElement.querySelector('.remove-item');
        
        decreaseBtn.addEventListener('click', () => {
            updateQuantity(item.id, item.quantity - 1);
        });
        
        increaseBtn.addEventListener('click', () => {
            updateQuantity(item.id, item.quantity + 1);
        });
        
        quantityInput.addEventListener('change', () => {
            const newQuantity = parseInt(quantityInput.value);
            if (!isNaN(newQuantity)) {
                updateQuantity(item.id, newQuantity);
            }
        });
        
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id);
        });
    });
    
    // Update total price
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    alert('Ordered successfully!'); 

    showNotification('Thank you for your purchase at ShopEasy.');
    
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', init);