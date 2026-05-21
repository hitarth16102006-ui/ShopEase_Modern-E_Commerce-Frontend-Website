(function () {
  var app = window.ShopEase || {};
  window.ShopEase = app;

  app.state = {
    cart: [],
    currentUser: null
  };

  function formatIndianNumber(value) {
    var numberValue = Math.round(Number(value) || 0);
    var negative = numberValue < 0;
    var text = String(Math.abs(numberValue));
    var lastThree = "";
    var remaining = "";
    var result = "";

    if (text.length <= 3) {
      return (negative ? "-" : "") + text;
    }

    lastThree = text.substring(text.length - 3);
    remaining = text.substring(0, text.length - 3);

    while (remaining.length > 2) {
      result = "," + remaining.substring(remaining.length - 2) + result;
      remaining = remaining.substring(0, remaining.length - 2);
    }

    if (remaining.length > 0) {
      result = remaining + result;
    }

    return (negative ? "-" : "") + result + "," + lastThree;
  }

  function getPriceText(p) {
    return "Rs. " + formatIndianNumber(p);
  }

  function getQueryValue(keyName) {
    var search = window.location.search;
    var queryText = "";
    var pairs = [];
    var index = 0;
    var pieces = [];

    if (!search || search.length <= 1) {
      return "";
    }

    queryText = search.substring(1);
    pairs = queryText.split("&");

    for (index = 0; index < pairs.length; index += 1) {
      pieces = pairs[index].split("=");
      if (pieces[0] === keyName) {
        return pieces.length > 1 ? pieces.slice(1).join("=") : "";
      }
    }

    return "";
  }

  function getProductById(productId) {
    var products = app.products || [];
    var index = 0;

    for (index = 0; index < products.length; index += 1) {
      if (products[index].id === productId) {
        return products[index];
      }
    }

    return null;
  }

  function normalizeCartItems(cartItems) {
    var normalizedItems = [];
    var index = 0;
    var item = null;
    var quantity = 0;

    if (!cartItems || typeof cartItems.length === "undefined") {
      return normalizedItems;
    }

    for (index = 0; index < cartItems.length; index += 1) {
      item = cartItems[index];
      if (!item) {
        continue;
      }

      quantity = Math.floor(Number(item.quantity) || 0);

      if (getProductById(item.productId) && quantity > 0) {
        normalizedItems.push({
          productId: item.productId,
          quantity: quantity
        });
      }
    }

    return normalizedItems;
  }

  function getStorageItem(keyName) {
    try {
      return window.localStorage.getItem(keyName);
    } catch (error) {
      console.warn("Could not read local storage.");
      return "";
    }
  }

  function setStorageItem(keyName, value) {
    try {
      window.localStorage.setItem(keyName, value);
      return true;
    } catch (error) {
      console.warn("Could not save local storage.");
      return false;
    }
  }

  function removeStorageItem(keyName) {
    try {
      window.localStorage.removeItem(keyName);
    } catch (error) {
      console.warn("Could not clear local storage.");
    }
  }

  function normalizeEmail(emailText) {
    return String(emailText || "").trim().toLowerCase();
  }

  function normalizeUsers(userList) {
    var cleanUsers = [];
    var index = 0;
    var item = null;
    var name = "";
    var email = "";
    var password = "";

    if (!userList || typeof userList.length === "undefined") {
      return cleanUsers;
    }

    for (index = 0; index < userList.length; index += 1) {
      item = userList[index];

      if (!item) {
        continue;
      }

      name = String(item.name || "").trim();
      email = normalizeEmail(item.email);
      password = String(item.password || "");

      if (name !== "" && email !== "" && password !== "") {
        cleanUsers.push({
          name: name,
          email: email,
          password: password
        });
      }
    }

    return cleanUsers;
  }

  function getSavedUsers() {
    var rawUsers = getStorageItem("shopEaseUsers");
    var parsedUsers = [];

    if (!rawUsers) {
      return [];
    }

    try {
      parsedUsers = JSON.parse(rawUsers);
    } catch (error) {
      console.warn("Could not read user list.");
      parsedUsers = [];
    }

    return normalizeUsers(parsedUsers);
  }

  function saveUsers(userList) {
    var cleanUsers = normalizeUsers(userList);
    return setStorageItem("shopEaseUsers", JSON.stringify(cleanUsers));
  }

  function findUserByEmail(emailText) {
    var users = getSavedUsers();
    var email = normalizeEmail(emailText);
    var index = 0;

    for (index = 0; index < users.length; index += 1) {
      if (users[index].email === email) {
        return users[index];
      }
    }

    return null;
  }

  function getCurrentUser() {
    var rawUser = getStorageItem("shopEaseCurrentUser");
    var parsedUser = null;
    var email = "";
    var matchedUser = null;

    if (!rawUser) {
      return null;
    }

    try {
      parsedUser = JSON.parse(rawUser);
    } catch (error) {
      console.warn("Could not read current user.");
      return null;
    }

    email = normalizeEmail(parsedUser.email);

    if (email === "") {
      return null;
    }

    matchedUser = findUserByEmail(email);

    if (matchedUser) {
      return {
        name: matchedUser.name,
        email: matchedUser.email
      };
    }

    return {
      name: String(parsedUser.name || "User").trim() || "User",
      email: email
    };
  }

  function setCurrentUser(userData) {
    var matchedUser = null;
    var nextUser = null;

    if (!userData) {
      return false;
    }

    matchedUser = findUserByEmail(userData.email);

    if (matchedUser) {
      nextUser = {
        name: matchedUser.name,
        email: matchedUser.email
      };
    } else if (normalizeEmail(userData.email) !== "") {
      nextUser = {
        name: String(userData.name || "User").trim() || "User",
        email: normalizeEmail(userData.email)
      };
    }

    if (!nextUser) {
      return false;
    }

    if (!setStorageItem("shopEaseCurrentUser", JSON.stringify(nextUser))) {
      return false;
    }

    app.state.currentUser = nextUser;
    renderAuthSlots();
    return true;
  }

  function clearCurrentUser() {
    app.state.currentUser = null;
    removeStorageItem("shopEaseCurrentUser");
    renderAuthSlots();
  }

  function getShortName(fullName) {
    var text = String(fullName || "").trim();
    var firstSpace = text.indexOf(" ");

    if (text === "") {
      return "User";
    }

    if (firstSpace === -1) {
      return text;
    }

    return text.substring(0, firstSpace);
  }

  function updateHomeUserText() {
    var signupLink = document.getElementById("homeSignupLink");

    if (!signupLink) {
      return;
    }

    if (app.state.currentUser) {
      signupLink.style.display = "none";
    } else {
      signupLink.style.display = "";
    }
  }

  function readCartFromQuery() {
    var rawCart = getQueryValue("cart");
    var parsedCart = [];

    if (!rawCart) {
      return [];
    }

    try {
      parsedCart = JSON.parse(decodeURIComponent(rawCart));
    } catch (error) {
      console.warn("Could not read cart text.");
      parsedCart = [];
    }

    return normalizeCartItems(parsedCart);
  }

  function getCartQueryText() {
    if (!app.state.cart.length) {
      return "";
    }

    return "cart=" + encodeURIComponent(JSON.stringify(app.state.cart));
  }

  function buildPageUrl(pageName, productId) {
    var url = pageName;
    var queryParts = [];
    var cartQuery = getCartQueryText();

    if (pageName === "product.html" && productId) {
      queryParts.push("id=" + encodeURIComponent(productId));
    }

    if (cartQuery) {
      queryParts.push(cartQuery);
    }

    if (queryParts.length) {
      url += "?" + queryParts.join("&");
    }

    return url;
  }

  function getProductIdFromHref(hrefValue) {
    var idIndex = hrefValue.indexOf("id=");
    var textAfterId = "";
    var ampIndex = -1;

    if (idIndex === -1) {
      return "";
    }

    textAfterId = hrefValue.substring(idIndex + 3);
    ampIndex = textAfterId.indexOf("&");

    if (ampIndex !== -1) {
      textAfterId = textAfterId.substring(0, ampIndex);
    }

    return decodeURIComponent(textAfterId);
  }

  function getHashText(hrefValue) {
    var hashIndex = hrefValue.indexOf("#");

    if (hashIndex === -1) {
      return "";
    }

    return hrefValue.substring(hashIndex);
  }

  function hasClassWord(element, className) {
    if (!element || !element.className) {
      return false;
    }

    return (" " + element.className + " ").indexOf(" " + className + " ") !== -1;
  }

  function setLinkTargets() {
    var links = document.querySelectorAll("a[href]");
    var index = 0;
    var link = null;
    var baseHref = "";
    var hashText = "";

    for (index = 0; index < links.length; index += 1) {
      link = links[index];
      baseHref = link.oldHrefValue;
      hashText = "";

      if (!baseHref) {
        baseHref = link.getAttribute("href");
        link.oldHrefValue = baseHref;
      }

      if (!baseHref || !baseHref || baseHref.charAt(0) === "#") {
        continue;
      }

      if (baseHref.indexOf("product.html") === 0) {
        link.setAttribute("href", buildPageUrl("product.html", getProductIdFromHref(baseHref)));
      } else if (baseHref.indexOf("cart.html") === 0) {
        link.setAttribute("href", buildPageUrl("cart.html"));
      } else if (baseHref.indexOf("login.html") === 0) {
        link.setAttribute("href", buildPageUrl("login.html"));
      } else if (baseHref.indexOf("signup.html") === 0) {
        link.setAttribute("href", buildPageUrl("signup.html"));
      } else if (baseHref.indexOf("shop.html") === 0) {
        link.setAttribute("href", buildPageUrl("shop.html"));
      } else if (baseHref.indexOf("index.html") === 0) {
        hashText = getHashText(baseHref);
        link.setAttribute("href", buildPageUrl("index.html") + hashText);
      }
    }
  }

  function getCart() {
    return app.state.cart;
  }

  function setCart(cartItems) {
    app.state.cart = normalizeCartItems(cartItems);
    syncCartCount();
    setLinkTargets();
  }

  function addToCart(productId, quantity) {
    var nextCart = normalizeCartItems(app.state.cart);
    var amount = Math.max(1, Math.floor(Number(quantity) || 1));
    var index = 0;
    var found = false;

    for (index = 0; index < nextCart.length; index += 1) {
      if (nextCart[index].productId === productId) {
        nextCart[index].quantity += amount;
        found = true;
        break;
      }
    }

    if (!found) {
      nextCart.push({
        productId: productId,
        quantity: amount
      });
    }

    setCart(nextCart);
    return nextCart;
  }

  function updateCartItem(productId, quantity) {
    var nextCart = normalizeCartItems(app.state.cart);
    var nextQuantity = Math.floor(Number(quantity) || 0);
    var index = 0;

    if (nextQuantity <= 0) {
      return removeFromCart(productId);
    }

    for (index = 0; index < nextCart.length; index += 1) {
      if (nextCart[index].productId === productId) {
        nextCart[index].quantity = nextQuantity;
      }
    }

    setCart(nextCart);
    return nextCart;
  }

  function removeFromCart(productId) {
    var nextCart = [];
    var currentCart = app.state.cart;
    var index = 0;

    for (index = 0; index < currentCart.length; index += 1) {
      if (currentCart[index].productId !== productId) {
        nextCart.push({
          productId: currentCart[index].productId,
          quantity: currentCart[index].quantity
        });
      }
    }

    setCart(nextCart);
    return nextCart;
  }

  function clearCart() {
    app.state.cart = [];
    syncCartCount();
    setLinkTargets();
  }

  function getDetailedCart() {
    var details = [];
    var currentCart = app.state.cart;
    var index = 0;
    var product = null;

    for (index = 0; index < currentCart.length; index += 1) {
      product = getProductById(currentCart[index].productId);

      if (product) {
        details.push({
          product: product,
          quantity: currentCart[index].quantity,
          lineTotal: product.price * currentCart[index].quantity
        });
      }
    }

    return details;
  }

  function calculateTotals(items) {
    var subtotal = 0;
    var shipping = 0;
    var tax = 0;
    var index = 0;

    for (index = 0; index < items.length; index += 1) {
      subtotal += items[index].lineTotal;
    }

    if (subtotal > 0 && subtotal < app.shippingConfig.freeShippingThreshold) {
      shipping = app.shippingConfig.standardShipping;
    }

    tax = subtotal * 0.08;

    return {
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: subtotal + shipping + tax
    };
  }

  function syncCartCount() {
    var totalItems = 0;
    var cart = app.state.cart;
    var index = 0;
    var elements = document.querySelectorAll(".count");
    var elementIndex = 0;

    for (index = 0; index < cart.length; index += 1) {
      totalItems += cart[index].quantity;
    }

    for (elementIndex = 0; elementIndex < elements.length; elementIndex += 1) {
      elements[elementIndex].textContent = totalItems;
    }
  }

  function createStars(rating) {
    var stars = "";
    var filled = Math.round(rating);
    var index = 0;

    for (index = 0; index < 5; index += 1) {
      if (index < filled) {
        stars += "*";
      } else {
        stars += "-";
      }
    }

    return stars;
  }

  function createProductCard(product) {
    var box = document.createElement("div");
    var visual = document.createElement("a");
    var image = document.createElement("img");
    var content = document.createElement("div");
    var metaRow = document.createElement("div");
    var category = document.createElement("span");
    var shipping = document.createElement("span");
    var title = document.createElement("h3");
    var description = document.createElement("p");
    var rating = document.createElement("p");
    var priceRow = document.createElement("div");
    var price = document.createElement("strong");
    var original = document.createElement("span");
    var actions = document.createElement("div");
    var detailsLink = document.createElement("a");
    var cartButton = document.createElement("button");

    box.className = "item box card";

    visual.className = "item-pic";
    visual.href = buildPageUrl("product.html", product.id);

    image.src = product.image;
    image.alt = product.name;
    visual.appendChild(image);

    content.className = "item-body";
    metaRow.className = "item-top";

    category.className = "item-cat";
    category.textContent = product.category;

    shipping.className = "item-ship";
    shipping.textContent = product.shippingLabel;

    metaRow.appendChild(category);
    metaRow.appendChild(shipping);

    title.className = "item-title";
    title.textContent = product.name;

    description.className = "item-desc";
    description.textContent = product.description;

    rating.className = "item-rate";
    rating.textContent = createStars(product.rating) + " " + product.rating.toFixed(1);

    priceRow.className = "item-price-row";

    price.className = "item-price";
    price.textContent = getPriceText(product.price);

    original.className = "item-old";
    original.textContent = getPriceText(product.originalPrice);

    priceRow.appendChild(price);
    priceRow.appendChild(original);

    actions.className = "item-buttons";

    detailsLink.className = "btn btn-secondary";
    detailsLink.href = buildPageUrl("product.html", product.id);
    detailsLink.textContent = "View details";

    cartButton.className = "btn btn-primary add-btn";
    cartButton.type = "button";
    cartButton.value = product.id;
    cartButton.textContent = "Add to cart";

    actions.appendChild(detailsLink);
    actions.appendChild(cartButton);

    content.appendChild(metaRow);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(rating);
    content.appendChild(priceRow);
    content.appendChild(actions);

    box.appendChild(visual);
    box.appendChild(content);

    return box;
  }

  function renderAuthSlots() {
    var slots = document.querySelectorAll(".user-area");
    var index = 0;
    var slot = null;
    var loginLink = null;
    var signupLink = null;
    var currentUser = app.state.currentUser;
    var userText = null;
    var logoutButton = null;

    if (!currentUser) {
      currentUser = getCurrentUser();
      app.state.currentUser = currentUser;
    }

    for (index = 0; index < slots.length; index += 1) {
      slot = slots[index];
      slot.innerHTML = "";

      if (currentUser) {
        userText = document.createElement("span");
        userText.className = "user-name";
        userText.textContent = "Hi, " + currentUser.name;

        logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "btn btn-secondary btn-small logout-btn";
        logoutButton.textContent = "Logout";

        slot.appendChild(userText);
        slot.appendChild(logoutButton);
        continue;
      }

      loginLink = document.createElement("a");
      loginLink.className = "text-link";
      loginLink.href = buildPageUrl("login.html");
      loginLink.textContent = "Login";

      signupLink = document.createElement("a");
      signupLink.className = "btn btn-primary btn-small";
      signupLink.href = buildPageUrl("signup.html");
      signupLink.textContent = "Signup";

      slot.appendChild(loginLink);
      slot.appendChild(signupLink);
    }

    updateHomeUserText();
    setLinkTargets();
  }

  function showToast(message) {
    var toast = document.querySelector(".toast");

    if (!toast) {
      // TODO: maybe make this look better later.
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function setCurrentYear() {
    var elements = document.querySelectorAll(".current-year");
    var index = 0;

    for (index = 0; index < elements.length; index += 1) {
      elements[index].textContent = new Date().getFullYear();
    }
  }

  function handleGlobalClicks(event) {
    var target = event.target;
    var nav = null;

    while (target && target !== document.body) {
      if (hasClassWord(target, "add-btn")) {
        console.log("clicked!");
        addToCart(target.value, 1);
        showToast("Product added to cart.");
        return;
      }

      if (hasClassWord(target, "logout-btn")) {
        console.log("clicked!");
        clearCurrentUser();
        showToast("Logged out.");
        return;
      }

      if (hasClassWord(target, "menu-btn")) {
        nav = document.getElementById("nav");
        console.log("clicked!");

        if (nav && nav.classList.contains("open")) {
          nav.classList.remove("open");
        } else {
          if (nav) {
            nav.classList.add("open");
          }
        }

        return;
      }

      target = target.parentNode;
    }
  }

  function initLayout() {
    app.state.cart = readCartFromQuery();
    app.state.currentUser = getCurrentUser();
    setCurrentYear();
    renderAuthSlots();
    syncCartCount();
    setLinkTargets();
    document.addEventListener("click", handleGlobalClicks);
  }

  app.getQueryValue = getQueryValue;
  app.getPriceText = getPriceText;
  app.buildPageUrl = buildPageUrl;
  app.buildProductUrl = function (productId) {
    return buildPageUrl("product.html", productId);
  };
  app.getProductById = getProductById;
  app.getSavedUsers = getSavedUsers;
  app.saveUsers = saveUsers;
  app.findUserByEmail = findUserByEmail;
  app.getCurrentUser = getCurrentUser;
  app.setCurrentUser = setCurrentUser;
  app.clearCurrentUser = clearCurrentUser;
  app.refreshHomeUserText = updateHomeUserText;
  app.getCart = getCart;
  app.setCart = setCart;
  app.addToCart = addToCart;
  app.updateCartItem = updateCartItem;
  app.removeFromCart = removeFromCart;
  app.clearCart = clearCart;
  app.getDetailedCart = getDetailedCart;
  app.calculateTotals = calculateTotals;
  app.syncCartCount = syncCartCount;
  app.createProductCard = createProductCard;
  app.showToast = showToast;
  app.refreshLinks = setLinkTargets;

  document.addEventListener("DOMContentLoaded", initLayout);
})();
