(function () {
  function copyProducts(products) {
    var copiedProducts = [];
    var index = 0;

    for (index = 0; index < products.length; index += 1) {
      copiedProducts.push(products[index]);
    }

    return copiedProducts;
  }

  function sortProducts(products, sortValue) {
    var sortedProducts = copyProducts(products);

    switch (sortValue) {
      case "price-low":
        sortedProducts.sort(function (a, b) {
          return a.price - b.price;
        });
        break;
      case "price-high":
        sortedProducts.sort(function (a, b) {
          return b.price - a.price;
        });
        break;
      case "rating":
        sortedProducts.sort(function (a, b) {
          return b.rating - a.rating;
        });
        break;
      case "name":
        sortedProducts.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });
        break;
      default:
        sortedProducts.sort(function (a, b) {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }

          return a.price - b.price;
        });
    }

    return sortedProducts;
  }

  function renderCategoryFilters(categories, activeCategory) {
    var filtersRoot = document.getElementById("categoryFilters");
    var button = null;
    var index = 0;

    filtersRoot.innerHTML = "";

    button = document.createElement("button");
    button.type = "button";
    button.className = "cat-btn";
    button.value = "All";
    button.textContent = "All";
    if (activeCategory === "All") {
      button.classList.add("active");
    }
    filtersRoot.appendChild(button);

    for (index = 0; index < categories.length; index += 1) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "cat-btn";
      button.value = categories[index];
      button.textContent = categories[index];

      if (categories[index] === activeCategory) {
        button.classList.add("active");
      }

      filtersRoot.appendChild(button);
    }
  }

  function renderProducts(products) {
    var grid = document.getElementById("productGrid");
    var resultsCount = document.getElementById("resultsCount");
    var empty = null;
    var index = 0;

    grid.innerHTML = "";

    if (products.length === 1) {
      resultsCount.textContent = "Showing 1 product";
    } else {
      resultsCount.textContent = "Showing " + products.length + " products";
    }

    if (!products.length) {
      empty = document.createElement("div");
      empty.className = "empty-box box card";
      empty.innerHTML =
        "<h3>No products match your search.</h3><p>Try a different keyword or switch back to the All category.</p>";
      grid.appendChild(empty);
      return;
    }

    for (index = 0; index < products.length; index += 1) {
      grid.appendChild(window.ShopEase.createProductCard(products[index]));
    }
  }

  function productMatchesSearch(product, searchText) {
    var lowerSearch = searchText.toLowerCase();
    var tagIndex = 0;

    if (product.name.toLowerCase().indexOf(lowerSearch) !== -1) {
      return true;
    }

    if (product.category.toLowerCase().indexOf(lowerSearch) !== -1) {
      return true;
    }

    for (tagIndex = 0; tagIndex < product.tags.length; tagIndex += 1) {
      if (product.tags[tagIndex].toLowerCase().indexOf(lowerSearch) !== -1) {
        return true;
      }
    }

    return false;
  }

  function findCategoryButton(element) {
    var current = element;

    while (current && current !== document.body) {
      if (current.tagName === "BUTTON" && (" " + current.className + " ").indexOf(" cat-btn ") !== -1) {
        return current;
      }

      current = current.parentNode;
    }

    return null;
  }

  function initHomePage() {
    var app = window.ShopEase;
    var state = {
      searchQuery: "",
      category: "All",
      sort: "featured"
    };
    var searchInput = document.getElementById("searchInput");
    var sortSelect = document.getElementById("sortSelect");
    var filtersRoot = document.getElementById("categoryFilters");

    function updateView() {
      var filtered = [];
      var products = app.products;
      var index = 0;
      var product = null;
      var normalizedQuery = state.searchQuery.trim();

      for (index = 0; index < products.length; index += 1) {
        product = products[index];

        if (state.category !== "All" && product.category !== state.category) {
          continue;
        }

        if (normalizedQuery !== "" && !productMatchesSearch(product, normalizedQuery)) {
          continue;
        }

        filtered.push(product);
      }

      renderCategoryFilters(app.categories, state.category);
      renderProducts(sortProducts(filtered, state.sort));
    }

    searchInput.addEventListener("input", function (event) {
      state.searchQuery = event.target.value;
      updateView();
    });

    sortSelect.addEventListener("change", function (event) {
      state.sort = event.target.value;
      updateView();
    });

    filtersRoot.addEventListener("click", function (event) {
      var button = findCategoryButton(event.target);

      if (!button) {
        return;
      }

      state.category = button.value;
      updateView();
    });

    updateView();
  }

  document.addEventListener("DOMContentLoaded", initHomePage);
})();
