(function () {
  function createSpecList(specs) {
    var fragment = document.createDocumentFragment();
    var label = "";
    var item = null;
    var title = null;
    var detail = null;

    for (label in specs) {
      if (Object.prototype.hasOwnProperty.call(specs, label)) {
        item = document.createElement("div");
        item.className = "spec-one";

        title = document.createElement("span");
        title.textContent = label;

        detail = document.createElement("strong");
        detail.textContent = specs[label];

        item.appendChild(title);
        item.appendChild(detail);
        fragment.appendChild(item);
      }
    }

    return fragment;
  }

  function createHighlights(items) {
    var list = document.createElement("ul");
    var index = 0;
    var listItem = null;

    list.className = "point-list";

    for (index = 0; index < items.length; index += 1) {
      listItem = document.createElement("li");
      listItem.textContent = items[index];
      list.appendChild(listItem);
    }

    return list;
  }

  function renderProductDetails(product) {
    var app = window.ShopEase;
    var root = document.getElementById("productDetailRoot");
    var wrapper = null;
    var visual = null;
    var details = null;
    var titleBlock = null;
    var priceRow = null;
    var purchasePanel = null;
    var highlights = null;
    var specs = null;
    var quantity = 1;
    var quantityValue = null;
    var goToCartLink = "";

    root.innerHTML = "";

    if (!product) {
      var missingState = document.createElement("div");
      missingState.className = "missing-box box";
      missingState.innerHTML =
        "<h1>Product not found</h1><p>The selected product could not be loaded. Return to the catalog and choose another item.</p><a class='btn btn-primary' href='" +
        app.buildPageUrl("index.html") +
        "'>Back to catalog</a>";
      root.appendChild(missingState);
      return;
    }

    document.title = "ShopEase | " + product.name;

    wrapper = document.createElement("section");
    wrapper.className = "item-layout";

    visual = document.createElement("div");
    visual.className = "img-side box";
    visual.innerHTML =
      "<div class='path'><a href='" +
      app.buildPageUrl("index.html") +
      "'>Home</a><span>/</span><span>" +
      product.category +
      "</span></div>" +
      "<div class='big-pic'><img src='" +
      product.image +
      "' alt='" +
      product.name +
      "'></div>";

    details = document.createElement("div");
    details.className = "info-side box card";

    titleBlock = document.createElement("div");
    titleBlock.className = "info-top";
    titleBlock.innerHTML =
      "<span class='tag'>" +
      product.shippingLabel +
      "</span>" +
      "<h1>" +
      product.name +
      "</h1>" +
      "<p class='big-text'>" +
      product.longDescription +
      "</p>" +
      "<div class='rate-text'>Rating: " +
      product.rating.toFixed(1) +
      " / 5</div>";

    priceRow = document.createElement("div");
    priceRow.className = "price-line";
    priceRow.innerHTML =
      "<strong>" +
      app.getPriceText(product.price) +
      "</strong><span>" +
      app.getPriceText(product.originalPrice) +
      "</span>";

    goToCartLink = app.buildPageUrl("cart.html");
    purchasePanel = document.createElement("div");
    purchasePanel.className = "buy-line";
    purchasePanel.innerHTML =
      "<div class='qty-box'>" +
      "<button type='button' id='detailQtyDecrease'>-</button>" +
      "<span id='detailQtyValue'>1</span>" +
      "<button type='button' id='detailQtyIncrease'>+</button>" +
      "</div>" +
      "<button class='btn btn-primary' type='button' id='detailAddToCart'>Add to cart</button>" +
      "<a class='btn btn-secondary' id='detailCartLink' href='" +
      goToCartLink +
      "'>Go to cart</a>";

    highlights = document.createElement("div");
    highlights.className = "small-box";
    highlights.innerHTML = "<h2>Highlights</h2>";
    highlights.appendChild(createHighlights(product.highlights));

    specs = document.createElement("div");
    specs.className = "small-box";
    specs.innerHTML = "<h2>Specifications</h2><div class='spec-list' id='specGrid'></div>";
    specs.querySelector("#specGrid").appendChild(createSpecList(product.specs));

    details.appendChild(titleBlock);
    details.appendChild(priceRow);
    details.appendChild(purchasePanel);
    details.appendChild(highlights);
    details.appendChild(specs);

    wrapper.appendChild(visual);
    wrapper.appendChild(details);
    root.appendChild(wrapper);

    quantityValue = document.getElementById("detailQtyValue");

    document.getElementById("detailQtyIncrease").addEventListener("click", function () {
      quantity += 1;
      quantityValue.textContent = quantity;
    });

    document.getElementById("detailQtyDecrease").addEventListener("click", function () {
      quantity = Math.max(1, quantity - 1);
      quantityValue.textContent = quantity;
    });

    document.getElementById("detailAddToCart").addEventListener("click", function () {
      console.log("clicked!");
      app.addToCart(product.id, quantity);
      document.getElementById("detailCartLink").setAttribute("href", app.buildPageUrl("cart.html"));
      app.showToast("Added " + quantity + " item(s) to cart.");
    });
  }

  function renderRelatedProducts(currentProduct) {
    var root = document.getElementById("relatedProducts");
    var products = window.ShopEase.products;
    var index = 0;
    var added = 0;
    var product = null;

    root.innerHTML = "";

    for (index = 0; index < products.length; index += 1) {
      product = products[index];

      if (product.id === currentProduct.id) {
        continue;
      }

      if (product.category === currentProduct.category || product.rating >= 4.7) {
        root.appendChild(window.ShopEase.createProductCard(product));
        added += 1;
      }

      if (added === 3) {
        break;
      }
    }
  }

  function initProductPage() {
    var productId = window.ShopEase.getQueryValue("id");
    var product = window.ShopEase.getProductById(productId);

    renderProductDetails(product);

    if (product) {
      renderRelatedProducts(product);
    }
  }

  document.addEventListener("DOMContentLoaded", initProductPage);
})();
