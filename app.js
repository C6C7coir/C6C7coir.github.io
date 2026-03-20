window.CocoStore = (() => {
  const GROUP_NAME = "Green Husk Collective";

  const PRODUCTS = [
    { id: 1, name: "Coco Bag", price: 249, category: "Lifestyle", badge: "New", image: "images/Coco_Bag.jpg", desc: "Eco-friendly utility bag made from coconut coir fibers." },
    { id: 2, name: "Coco Brush", price: 179, category: "Home", badge: "Trending", image: "images/Coco_Brush.jpg", desc: "Durable natural-fiber brush for home and garden cleaning." },
    { id: 3, name: "Coco Leaf Pot", price: 199, category: "Garden", badge: "Best Seller", image: "images/Coco_Leaf_Pot.jpg", desc: "Biodegradable planting pot ideal for seedlings and decor." },
    { id: 4, name: "Coco Mat", price: 349, category: "Home", badge: "Best Seller", image: "images/Coco_Mat.jpg", desc: "Natural coir mat that works well as a door or floor mat." },
    { id: 5, name: "Coco Pad", price: 159, category: "Garden", badge: "Popular", image: "images/Coco_Pad.jpg", desc: "Useful liner pad for gardening and moisture support." },
    { id: 6, name: "Coco Pot", price: 219, category: "Garden", badge: "New", image: "images/Coco_Pot.jpg", desc: "Simple coir pot for small indoor or outdoor plants." },
    { id: 7, name: "Coco Rope", price: 129, category: "Utility", badge: "Trending", image: "images/Coco_Rope.jpg", desc: "Strong natural rope for tying, gardening, and decor." },
    { id: 8, name: "Coco Sponge", price: 99, category: "Home", badge: "Popular", image: "images/Coco_Sponge.jpg", desc: "Natural scrubbing sponge with a rustic sustainable touch." },
    { id: 9, name: "Husk Chips", price: 189, category: "Garden", badge: "Best Seller", image: "images/Husk_Chips.jpg", desc: "Great as a growing medium and soil conditioner." },
    { id: 10, name: "Pig Pot", price: 229, category: "Garden", badge: "Cute Pick", image: "images/Pig_Pot.jpg", desc: "Fun decorative coir pot for playful plant styling." }
  ];

  const KEY_USERS = "coco_users";
  const KEY_SESSION = "coco_session";
  const KEY_CART = "coco_cart";
  const KEY_TX = "coco_transactions";

  const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const seed = () => {
    if (!localStorage.getItem(KEY_USERS)) write(KEY_USERS, []);
    if (!localStorage.getItem(KEY_CART)) write(KEY_CART, []);
    if (!localStorage.getItem(KEY_TX)) write(KEY_TX, []);
  };

  const getUsers = () => read(KEY_USERS, []);
  const getCurrentUser = () => read(KEY_SESSION, null);
  const setCurrentUser = (user) => write(KEY_SESSION, user);
  const logout = () => localStorage.removeItem(KEY_SESSION);

  const register = (payload) => {
    const users = getUsers();
    const exists = users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) return { ok: false, message: "Email is already registered." };
    users.push(payload);
    write(KEY_USERS, users);
    setCurrentUser(payload);
    return { ok: true, message: "Registration successful." };
  };

  const login = (email, password) => {
    const user = getUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, message: "Invalid email or password." };
    setCurrentUser(user);
    return { ok: true, message: "Login successful." };
  };

  const updateProfile = (updated) => {
    const users = getUsers();
    const current = getCurrentUser();
    if (!current) return { ok: false, message: "No active session." };
    const idx = users.findIndex(u => u.email === current.email);
    if (idx === -1) return { ok: false, message: "User not found." };
    users[idx] = { ...users[idx], ...updated };
    write(KEY_USERS, users);
    setCurrentUser(users[idx]);
    return { ok: true, message: "Profile updated." };
  };

  const getCart = () => read(KEY_CART, []);
  const saveCart = (cart) => write(KEY_CART, cart);

  const addToCart = (productId) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return false; 
    
    const cart = getCart();
    const found = cart.find(item => item.id === productId);
    
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    
    saveCart(cart);
    return true; // Added this so the UI knows it worked
  };

  const updateQty = (productId, delta) => {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    cart = cart.filter(i => i.qty > 0);
    saveCart(cart);
  };

  const removeFromCart = (productId) => {
    const cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
  };

  const clearCart = () => saveCart([]);

  const cartTotal = (cart = getCart()) => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const getTransactions = () => read(KEY_TX, []);

  const checkout = ({ paymentMethod, fulfillment, address }) => {
    const user = getCurrentUser();
    const cart = getCart();
    if (!user) return { ok: false, message: "Please log in first." };
    if (!cart.length) return { ok: false, message: "Cart is empty." };

    const txs = getTransactions();
    txs.unshift({
      id: "TX" + Date.now(),
      date: new Date().toLocaleString(),
      userEmail: user.email,
      customerName: user.fullName,
      items: cart,
      total: cartTotal(cart),
      paymentMethod,
      fulfillment,
      address,
      status: "Processing"
    });
    write(KEY_TX, txs);
    clearCart();
    return { ok: true, message: "Checkout successful." };
  };

  const requireAuth = () => {
    if (!getCurrentUser()) {
      window.location.href = "login.html";
    }
  };

  const pageName = () => location.pathname.split("/").pop() || "index.html";

  const setupInteractiveCards = () => {
    document.querySelectorAll(".interactive-card").forEach(card => {
      card.addEventListener("focusin", () => card.classList.add("is-active"));
      card.addEventListener("focusout", () => {
        setTimeout(() => {
          if (!card.contains(document.activeElement)) {
            card.classList.remove("is-active");
          }
        }, 60);
      });
      card.addEventListener("mouseenter", () => card.classList.add("is-active"));
      card.addEventListener("mouseleave", () => {
        if (!card.contains(document.activeElement)) {
          card.classList.remove("is-active");
        }
      });
    });
  };

  seed();

  return {
    GROUP_NAME,
    PRODUCTS,
    register,
    login,
    logout,
    getUsers,
    getCurrentUser,
    updateProfile,
    getCart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    getTransactions,
    checkout,
    requireAuth,
    pageName,
    setupInteractiveCards
  };
})();