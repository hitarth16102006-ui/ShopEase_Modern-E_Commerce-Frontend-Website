(function () {
  function showSuccessMsg() {
    var successMsg = document.getElementById("successMsg");

    successMsg.classList.remove("show");
    void successMsg.offsetWidth;
    successMsg.classList.add("show");

    window.setTimeout(function () {
      successMsg.classList.remove("show");
    }, 1600);
  }

  function updateOrderStatus(orderPlaced, hasItems) {
    var orderStatusMessage = document.getElementById("orderStatusMessage");

    if (orderPlaced) {
      orderStatusMessage.textContent = "Order placed.";
      orderStatusMessage.classList.add("success");
      return;
    }

    if (hasItems) {
      orderStatusMessage.textContent = "Place your order to see the confirmation message.";
    } else {
      orderStatusMessage.textContent = "Add items to your cart to place an order.";
    }

    orderStatusMessage.classList.remove("success");
  }

  function renderEmptyState(container, app) {
    container.innerHTML = "";

    var emptyState = document.createElement("div");
    var browseLink = app.buildPageUrl("index.html");

    emptyState.className = "empty-cart";
    emptyState.innerHTML =
      "<h3>Your cart is empty.</h3><p>Start adding products from the catalog to see them here.</p><a class='btn btn-primary' href='" +
      browseLink +
      "'>Browse products</a>";

    container.appendChild(emptyState);
  }

  function createCartItem(entry, app) {
    var wrapper = document.createElement("div");
    var detailLink = app.buildProductUrl(entry.product.id);

    wrapper.className = "cart-one card";
    wrapper.id = "cart-" + entry.product.id;
    wrapper.innerHTML =
      "<img class='cart-pic' src='" +
      entry.product.image +
      "' alt='" +
      entry.product.name +
      "'>" +
      "<div class='cart-text'>" +
      "<div class='cart-head'><div><h3>" +
      entry.product.name +
      "</h3><p>" +
      entry.product.category +
      "</p></div><strong>" +
      app.getPriceText(entry.lineTotal) +
      "</strong></div>" +
      "<p class='cart-desc'>" +
      entry.product.description +
      "</p>" +
      "<div class='cart-foot'>" +
      "<div class='qty-row'>" +
      "<button type='button' class='qty-btn minus-btn'>-</button>" +
      "<span>" +
      entry.quantity +
      "</span>" +
      "<button type='button' class='qty-btn plus-btn'>+</button>" +
      "</div>" +
      "<div class='cart-links'>" +
      "<a class='text-link' href='" +
      detailLink +
      "'>View details</a>" +
      "<button type='button' class='text-button remove-btn'>Remove</button>" +
      "</div>" +
      "</div>" +
      "</div>";

    return wrapper;
  }

  function renderSummary(items, app) {
    var totals = app.calculateTotals(items);
    var freeShippingThreshold = app.shippingConfig.freeShippingThreshold;
    var shippingNote = "";

    document.getElementById("subtotalValue").textContent = app.getPriceText(totals.subtotal);
    document.getElementById("shippingValue").textContent = app.getPriceText(totals.shipping);
    document.getElementById("taxValue").textContent = app.getPriceText(totals.tax);
    document.getElementById("totalValue").textContent = app.getPriceText(totals.total);

    if (totals.subtotal === 0) {
      shippingNote = "Free shipping unlocks on orders over " + app.getPriceText(freeShippingThreshold) + ".";
    } else if (totals.subtotal >= freeShippingThreshold) {
      shippingNote = "You have unlocked free shipping.";
    } else {
      shippingNote =
        "Add " +
        app.getPriceText(freeShippingThreshold - totals.subtotal) +
        " more to get free shipping.";
    }

    document.getElementById("shippingNote").textContent = shippingNote;
  }

  function renderCartPage(orderPlaced) {
    var app = window.ShopEase;
    var container = document.getElementById("cartContent");
    var items = app.getDetailedCart();
    var index = 0;

    container.innerHTML = "";

    if (!items.length) {
      renderEmptyState(container, app);
      renderSummary(items, app);
      updateOrderStatus(orderPlaced, false);
      app.refreshLinks();
      return;
    }

    for (index = 0; index < items.length; index += 1) {
      container.appendChild(createCartItem(items[index], app));
    }

    renderSummary(items, app);
    updateOrderStatus(orderPlaced, true);
    app.refreshLinks();
  }

  function hasClassWord(element, className) {
    if (!element || !element.className) {
      return false;
    }

    return (" " + element.className + " ").indexOf(" " + className + " ") !== -1;
  }

  function findButtonByClass(element, className) {
    var current = element;

    while (current && current !== document.body) {
      if (hasClassWord(current, className)) {
        return current;
      }
      current = current.parentNode;
    }

    return null;
  }

  function findCartItem(element) {
    var current = element;

    while (current && current !== document.body) {
      if (hasClassWord(current, "cart-one")) {
        return current;
      }
      current = current.parentNode;
    }

    return null;
  }

  function initCartPage() {
    var app = window.ShopEase;
    var container = document.getElementById("cartContent");
    var clearButton = document.getElementById("clearCartButton");
    var checkoutButton = document.getElementById("checkoutButton");
    var orderPlaced = false;

    container.addEventListener("click", function (event) {
      var cartItem = findCartItem(event.target);
      var removeButton = null;
      var plusButton = null;
      var minusButton = null;
      var currentCart = [];
      var index = 0;
      var currentItem = null;
      var nextQuantity = 0;
      var productId = "";

      if (!cartItem) {
        return;
      }

      productId = cartItem.id.replace("cart-", "");
      removeButton = findButtonByClass(event.target, "remove-btn");

      if (removeButton) {
        orderPlaced = false;
        app.removeFromCart(productId);
        app.showToast("Item removed from cart.");
        renderCartPage(orderPlaced);
        return;
      }

      plusButton = findButtonByClass(event.target, "plus-btn");
      minusButton = findButtonByClass(event.target, "minus-btn");
      if (!plusButton && !minusButton) {
        return;
      }

      currentCart = app.getCart();
      for (index = 0; index < currentCart.length; index += 1) {
        if (currentCart[index].productId === productId) {
          currentItem = currentCart[index];
        }
      }

      if (!currentItem) {
        return;
      }

      if (plusButton) {
        nextQuantity = currentItem.quantity + 1;
      } else {
        nextQuantity = currentItem.quantity - 1;
      }

      orderPlaced = false;
      app.updateCartItem(productId, nextQuantity);
      renderCartPage(orderPlaced);
    });

    clearButton.addEventListener("click", function () {
      console.log("clicked!");
      orderPlaced = false;
      app.clearCart();
      app.showToast("Cart cleared.");
      renderCartPage(orderPlaced);
    });

    checkoutButton.addEventListener("click", function () {
      var items = app.getDetailedCart();

      if (!items.length) {
        if (items.length === 0) {
          console.log("clicked!");
        }
        app.showToast("Add a product before placing your order.");
        return;
      }

      console.log("clicked!");
      orderPlaced = true;
      app.clearCart();
      showSuccessMsg();
      renderCartPage(orderPlaced);
    });

    renderCartPage(orderPlaced);
  }

  document.addEventListener("DOMContentLoaded", initCartPage);
})();
