"use strict";

const config = window.__NORTHLINE__ || { shopName: "Northline", apiBase: "" };
const CART_KEY = "northline-cart";
const ORDER_KEY = "northline-order";

const PRODUCTS = [
  {
    id: "field-jacket",
    sku: "NL-104",
    name: "Field Jacket",
    category: "Outerwear",
    price: 248,
    sizes: ["S", "M", "L", "XL"],
    materials: "12oz cotton canvas, horn buttons, cotton twill",
    lead: "Waxed canvas that darkens where the weather hits.",
    copy: "A three-season jacket cut with a throat latch and two bellows pockets deep enough for a folded map. The horn buttons can be resewn with a needle. The canvas takes weather and keeps the shape.",
    tone: ["#24352b", "#e6d3b4", "#c4512c"],
    kind: "jacket"
  },
  {
    id: "watch-cap",
    sku: "NL-118",
    name: "Watch Cap",
    category: "Knitwear",
    price: 42,
    sizes: ["One"],
    materials: "Merino and lambswool",
    lead: "Double-knit wool. It stays put when the wind does not.",
    copy: "Ribbed, folded once, and knit tight enough to block a ridge wind. Soft enough for a long train ride. The brim holds a crease if you want one.",
    tone: ["#2a2724", "#7d3a2a", "#f0e6d8"],
    kind: "cap"
  },
  {
    id: "camp-mug",
    sku: "NL-207",
    name: "Camp Mug",
    category: "Camp",
    price: 36,
    sizes: [],
    materials: "Speckled enamel on steel",
    lead: "A rolled rim, a handle that fits a glove, twelve honest ounces.",
    copy: "The speckled ground hides soot. The rim is rolled so it does not bite. It stacks with its mates and rides in a side pocket.",
    tone: ["#243028", "#f4efe6", "#c4512c"],
    kind: "mug"
  },
  {
    id: "field-notebook",
    sku: "NL-221",
    name: "Field Notebook",
    category: "Stationery",
    price: 28,
    sizes: [],
    materials: "Vegetable-tanned leather, cream paper",
    lead: "A leather cover, lay-flat paper, and a pencil that lives in the spine.",
    copy: "Seventy-two pages that take pencil and a light rain. The cover scars in the shape of whatever you lean it on. There is no logo on the front.",
    tone: ["#6b412c", "#f6ecd9", "#241c16"],
    kind: "notebook"
  },
  {
    id: "brass-lantern",
    sku: "NL-310",
    name: "Brass Lantern",
    category: "Camp",
    price: 164,
    sizes: [],
    materials: "Spun brass, seeded glass, cotton wick",
    lead: "A small flame behind seeded glass. Warm light, no battery.",
    copy: "It burns lamp oil for about six hours. The bail folds flat against the top. The glass is thick enough to live in a pack beside a mug.",
    tone: ["#151922", "#e0b15a", "#f8e7b0"],
    kind: "lantern"
  },
  {
    id: "merino-crew",
    sku: "NL-126",
    name: "Merino Crew",
    category: "Knitwear",
    price: 98,
    sizes: ["S", "M", "L", "XL"],
    materials: "17.5 micron merino",
    lead: "Fine-gauge merino that works as a layer or a shirt.",
    copy: "Set-in sleeves and a neck that does not sag by the second season. Wear it under the jacket, or on its own when the day turns warm.",
    tone: ["#4e4036", "#f0e2d2", "#2a211c"],
    kind: "crew"
  },
  {
    id: "waxed-tote",
    sku: "NL-408",
    name: "Waxed Tote",
    category: "Carry",
    price: 128,
    sizes: [],
    materials: "Waxed canvas, leather base, brass snap",
    lead: "One compartment, a brass snap, and a strap that sits on the shoulder.",
    copy: "The strap is long enough to wear across the body. Inside, a sleeve holds the notebook. The leather base meets the ground so the canvas does not.",
    tone: ["#1d241c", "#5e6b52", "#d7b98a"],
    kind: "tote"
  },
  {
    id: "steel-bottle",
    sku: "NL-332",
    name: "Steel Bottle",
    category: "Carry",
    price: 46,
    sizes: [],
    materials: "Single-wall stainless, powder coat",
    lead: "Cold in the morning. Honest by noon. Wide mouth, no liner.",
    copy: "Twenty-one ounces of single-wall steel. It is not insulated, on purpose. The coat will chip into a map of the trips you actually take.",
    tone: ["#1b2328", "#d7e0e4", "#6d7c84"],
    kind: "bottle"
  }
];

const picked = {};
const draft = { name: "", email: "", address: "", city: "" };
let lastPath = "";
let toastTimer = 0;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function productById(id) {
  return PRODUCTS.find((item) => item.id === id);
}

function art(product) {
  const [a, b, c] = product.tone;
  const shapes = {
    jacket: `<path d="M58 62 100 34l42 28 16 168H44L58 62z" fill="${b}"/><path d="M86 78h28l8 146H78L86 78z" fill="${a}"/><circle cx="100" cy="112" r="3.2" fill="${c}"/><circle cx="100" cy="136" r="3.2" fill="${c}"/><circle cx="100" cy="160" r="3.2" fill="${c}"/>`,
    cap: `<path d="M46 156c6-70 102-70 108 0v8H46v-8z" fill="${b}"/><path d="M58 150c8-42 76-42 84 0" fill="${a}"/><rect x="34" y="162" width="132" height="22" rx="11" fill="${c}"/>`,
    mug: `<rect x="52" y="64" width="84" height="112" rx="12" fill="${b}"/><path d="M136 92h14a22 22 0 0 1 0 44h-14" fill="none" stroke="${a}" stroke-width="8"/><circle cx="78" cy="104" r="4" fill="${c}"/><circle cx="104" cy="128" r="3.5" fill="${c}"/><circle cx="88" cy="150" r="3" fill="${a}"/>`,
    notebook: `<rect x="58" y="40" width="96" height="164" rx="3" fill="${b}"/><rect x="48" y="40" width="18" height="164" fill="${c}"/><path d="M86 78h52M86 100h52M86 122h34" stroke="${c}" stroke-width="3" fill="none"/>`,
    lantern: `<rect x="78" y="34" width="44" height="12" rx="2" fill="${b}"/><path d="M88 50h24l8 28H80l8-28z" fill="${c}"/><rect x="68" y="78" width="64" height="92" rx="6" fill="${b}"/><circle cx="100" cy="124" r="16" fill="${c}"/><rect x="92" y="170" width="16" height="28" fill="${b}"/>`,
    crew: `<path d="M46 84 74 60h52l28 24-14 20h-16v116H76V104H60L46 84z" fill="${b}"/><path d="M84 60h32l8 24H76l8-24z" fill="${c}"/>`,
    tote: `<path d="M54 96h92l-8 112H62L54 96z" fill="${b}"/><path d="M74 96c0-26 52-26 52 0" fill="none" stroke="${c}" stroke-width="8"/><rect x="78" y="132" width="44" height="8" rx="2" fill="${c}"/>`,
    bottle: `<rect x="84" y="36" width="32" height="16" rx="4" fill="${c}"/><rect x="90" y="52" width="20" height="14" fill="${b}"/><rect x="70" y="68" width="60" height="146" rx="28" fill="${b}"/><rect x="80" y="102" width="40" height="26" rx="4" fill="${a}"/>`
  };
  return `<svg viewBox="0 0 200 250" aria-hidden="true"><rect width="200" height="250" fill="${a}"/>${shapes[product.kind] || ""}</svg>`;
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line) => line && productById(line.id) && Number.isInteger(line.qty) && line.qty > 0)
      .map((line) => ({ id: line.id, size: line.size || "", qty: Math.min(8, line.qty) }));
  } catch (err) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function lines() {
  return loadCart();
}

function count() {
  return lines().reduce((sum, line) => sum + line.qty, 0);
}

function total() {
  return lines().reduce((sum, line) => sum + productById(line.id).price * line.qty, 0);
}

function parseRoute() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const qIndex = raw.indexOf("?");
  const path = qIndex === -1 ? raw : raw.slice(0, qIndex);
  const query = qIndex === -1 ? "" : raw.slice(qIndex + 1);
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  if (!parts.length) return { name: "home" };
  const head = parts[0];
  if (head === "shop") return { name: "shop", category: params.get("c") || "All" };
  if (head === "product") return { name: "product", id: decodeURIComponent(parts[1] || "") };
  if (head === "cart" || head === "checkout" || head === "order" || head === "notes") return { name: head };
  return { name: "missing" };
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("show"), 2200);
}

function card(product) {
  const index = String(PRODUCTS.findIndex((item) => item.id === product.id) + 1).padStart(2, "0");
  const size = product.sizes[0] || "";
  return `<article class="card">
    <a class="card-art" href="#/product/${product.id}" tabindex="-1" aria-hidden="true">${art(product)}</a>
    <div class="card-body">
      <p class="eyebrow">${esc(product.category)} · ${index}</p>
      <h3><a href="#/product/${product.id}">${esc(product.name)}</a></h3>
      <p class="lead">${esc(product.lead)}</p>
      <div class="card-row">
        <span class="price">${money(product.price)}</span>
        <button class="btn small" type="button" data-action="add" data-id="${product.id}" data-size="${esc(size)}">Add</button>
      </div>
    </div>
  </article>`;
}

function marquee() {
  const text = "Canvas  ·  Merino  ·  Brass  ·  Enamel  ·  Leather  ·  Steel  ·  Horn  ·  Lamp oil";
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track"><span>${text}</span><span>${text}</span></div></div>`;
}

function home() {
  const jacket = productById("field-jacket");
  const lantern = productById("brass-lantern");
  const featured = ["field-jacket", "brass-lantern", "merino-crew", "waxed-tote"]
    .map((id) => card(productById(id)))
    .join("");
  const categories = [...new Set(PRODUCTS.map((item) => item.category))];
  const bands = categories.map((category) => {
    const n = PRODUCTS.filter((item) => item.category === category).length;
    return `<a class="band" href="#/shop?c=${encodeURIComponent(category)}"><strong>${esc(category)}</strong><span>${n} ${n === 1 ? "piece" : "pieces"}</span></a>`;
  }).join("");
  return `<section class="hero wrap">
      <div>
        <p class="eyebrow">Late autumn · eight pieces</p>
        <h1>Goods for the<br><em>long way</em> home.</h1>
        <p class="deck">Canvas, wool, brass, and steel. Pieces we expect you to keep, scuff, and hand down.</p>
        <div class="actions">
          <a class="btn" href="#/shop">Shop the collection</a>
          <a class="btn ghost" href="#/notes">Read the field note</a>
        </div>
        <div class="stats">
          <div><strong>8</strong><span>pieces</span></div>
          <div><strong>5</strong><span>materials</span></div>
          <div><strong>1</strong><span>way to carry them</span></div>
        </div>
      </div>
      <div class="still">
        <div class="still-back">${art(lantern)}</div>
        <div class="still-front">
          ${art(jacket)}
          <div class="still-caption"><span>${esc(jacket.sku)}</span><strong>${esc(jacket.name)}</strong></div>
        </div>
      </div>
    </section>
    ${marquee()}
    <section class="wrap section">
      <div class="section-head"><h2>Start here</h2><a href="#/shop">View all</a></div>
      <div class="grid">${featured}</div>
    </section>
    <section class="wrap section">
      <div class="section-head"><h2>By use</h2></div>
      <div class="bands">${bands}</div>
      <div class="journal">
        <div>
          <p class="eyebrow">Field notes · 07</p>
          <h2>Why the jacket still has horn buttons.</h2>
        </div>
        <div>
          <p>Plastic snaps are faster to fit. Horn can be resewn on a bench with a needle you already own. That was the whole argument.</p>
          <div class="actions"><a class="btn" href="#/notes">Read it</a></div>
        </div>
      </div>
    </section>`;
}

function shop(route) {
  const categories = ["All", ...new Set(PRODUCTS.map((item) => item.category))];
  const active = categories.includes(route.category) ? route.category : "All";
  const visible = PRODUCTS.filter((item) => active === "All" || item.category === active);
  const chips = categories.map((category) => {
    const href = category === "All" ? "#/shop" : `#/shop?c=${encodeURIComponent(category)}`;
    const on = category === active ? " is-on" : "";
    return `<a class="chip${on}" href="${href}">${esc(category)}</a>`;
  }).join("");
  const grid = visible.length
    ? `<div class="grid">${visible.map(card).join("")}</div>`
    : `<div class="empty-state"><h2>Nothing in that category.</h2></div>`;
  return `<section class="wrap section">
      <div class="toolbar">
        <h1>The shop</h1>
        <div class="chips">${chips}</div>
      </div>
      ${grid}
    </section>`;
}

function productView(id) {
  const product = productById(id);
  if (!product) return missing();
  const selected = picked[product.id] || product.sizes[0] || "";
  const sizes = product.sizes.length
    ? `<div class="sizes" role="group" aria-label="Size">${product.sizes.map((size) => {
        const on = size === selected ? " is-on" : "";
        return `<button class="size${on}" type="button" data-action="size" data-id="${product.id}" data-size="${esc(size)}" aria-pressed="${size === selected}">${esc(size)}</button>`;
      }).join("")}</div>`
    : "";
  return `<section class="wrap section product">
      <div class="product-stage">${art(product)}</div>
      <div>
        <p class="kicker eyebrow"><a href="#/shop?c=${encodeURIComponent(product.category)}">${esc(product.category)}</a> · ${esc(product.sku)}</p>
        <h1>${esc(product.name)}</h1>
        <p class="copy">${esc(product.copy)}</p>
        <p class="materials">${esc(product.materials)}</p>
        ${sizes}
        <div class="actions">
          <button class="btn" type="button" data-action="add" data-id="${product.id}" data-size="${esc(selected)}">Add to cart · ${money(product.price)}</button>
        </div>
      </div>
    </section>`;
}

function lineMarkup(line, wide) {
  const product = productById(line.id);
  const size = line.size ? `${esc(line.size)} · ` : "";
  return `<article class="line">
      <div class="line-art">${art(product)}</div>
      <div>
        <h3>${esc(product.name)}</h3>
        <p class="muted">${size}${money(product.price)}</p>
        <div class="stepper">
          <button type="button" data-action="dec" data-id="${esc(line.id)}" data-size="${esc(line.size)}" aria-label="Decrease ${esc(product.name)}">−</button>
          <span>${line.qty}</span>
          <button type="button" data-action="inc" data-id="${esc(line.id)}" data-size="${esc(line.size)}" aria-label="Increase ${esc(product.name)}">+</button>
        </div>
      </div>
      ${wide ? `<div class="line-side"><strong>${money(product.price * line.qty)}</strong><button class="text-btn" type="button" data-action="remove" data-id="${esc(line.id)}" data-size="${esc(line.size)}">Remove</button></div>` : ""}
    </article>`;
}

function cartView() {
  const cart = lines();
  if (!cart.length) {
    return `<section class="wrap empty-state"><p class="eyebrow">Cart</p><h1>Nothing packed yet.</h1><p class="deck">The shop is eight pieces deep.</p><a class="btn" href="#/shop">Browse the shop</a></section>`;
  }
  return `<section class="wrap section checkout">
      <div>
        <h1>Cart</h1>
        <div class="stack">${cart.map((line) => lineMarkup(line, true)).join("")}</div>
      </div>
      <aside class="summary">
        <h2>Parcel</h2>
        <div class="total"><span>Total</span><strong>${money(total())}</strong></div>
        <p class="muted">Shipping is included. This checkout writes a demo receipt and charges nothing.</p>
        <a class="btn full" href="#/checkout">Checkout</a>
      </aside>
    </section>`;
}

function checkoutView() {
  const cart = lines();
  if (!cart.length) {
    return `<section class="wrap empty-state"><h1>The cart is empty.</h1><a class="btn" href="#/shop">Browse the shop</a></section>`;
  }
  const rows = cart.map((line) => {
    const product = productById(line.id);
    const size = line.size ? ` · ${esc(line.size)}` : "";
    return `<li><span>${esc(product.name)}${size} × ${line.qty}</span><span>${money(product.price * line.qty)}</span></li>`;
  }).join("");
  return `<section class="wrap section checkout">
      <form id="checkout-form">
        <h1>Checkout</h1>
        <label>Name<input name="name" data-field="name" autocomplete="name" required value="${esc(draft.name)}" /></label>
        <label>Email<input name="email" data-field="email" type="email" autocomplete="email" required value="${esc(draft.email)}" /></label>
        <label>Street<textarea name="address" data-field="address" autocomplete="street-address" required>${esc(draft.address)}</textarea></label>
        <label>City<input name="city" data-field="city" autocomplete="address-level2" required value="${esc(draft.city)}" /></label>
        <p class="form-error" role="alert"></p>
        <button class="btn" type="submit">Place a demo order</button>
      </form>
      <aside class="summary">
        <h2>Parcel</h2>
        <ul class="mini-lines">${rows}</ul>
        <div class="total"><span>Total</span><strong>${money(total())}</strong></div>
        <p class="muted">Nothing is charged. You get a receipt in this browser only.</p>
      </aside>
    </section>`;
}

function orderView() {
  let order = null;
  try {
    order = JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null");
  } catch (err) {
    order = null;
  }
  if (!order || !order.id) {
    return `<section class="wrap empty-state"><h1>No receipt yet.</h1><a class="btn" href="#/shop">Return to the shop</a></section>`;
  }
  const rows = order.lines.map((line) => {
    const size = line.size ? ` · ${esc(line.size)}` : "";
    return `<li><span>${esc(line.name)}${size} × ${line.qty}</span><span>${money(line.price * line.qty)}</span></li>`;
  }).join("");
  return `<section class="wrap section">
      <article class="receipt">
        <p class="eyebrow">Demo receipt</p>
        <p class="receipt-id">${esc(order.id)}</p>
        <p>Packed for ${esc(order.name)} in ${esc(order.city)}. Nothing was charged and nothing will ship.</p>
        <ol>${rows}</ol>
        <div class="total"><span>Total</span><strong>${money(order.total)}</strong></div>
        <a class="btn" href="#/shop">Back to the shop</a>
      </article>
    </section>`;
}

function notes() {
  return `<article class="wrap section note">
      <p class="eyebrow">Field notes · 07</p>
      <h1>Why the jacket still has horn buttons.</h1>
      <p class="pull">A button that can be replaced with a needle is a button worth having.</p>
      <p>We tried snaps. They are faster on a production line, and they look tidy in a photograph. The first time one cracked on a cold morning, the jacket was done until a shop could press a new snap. Horn is slower. It is also a button you can sew back on wherever you are.</p>
      <p>The same rule picked the rest of the shop. The bottle is single-wall steel because a liner eventually smells like the last thing you put in it. The lantern takes oil because a battery is a second supply chain. The notebook has no logo because the cover should end up looking like your pockets, not ours.</p>
      <p>Eight pieces is the whole collection on purpose. If a thing does not earn its place in a pack, it does not get a page.</p>
      <p><a href="#/product/field-jacket">See the field jacket</a></p>
    </article>`;
}

function missing() {
  return `<section class="wrap empty-state"><p class="eyebrow">404</p><h1>That page is not on the map.</h1><a class="btn" href="#/">Go home</a></section>`;
}

function render() {
  const route = parseRoute();
  const view = document.getElementById("view");
  const pages = {
    home: home,
    shop: () => shop(route),
    product: () => productView(route.id),
    cart: cartView,
    checkout: checkoutView,
    order: orderView,
    notes: notes,
    missing: missing
  };
  view.innerHTML = (pages[route.name] || missing)();
  const product = route.name === "product" ? productById(route.id) : null;
  const pageTitle = {
    home: `${config.shopName} — Goods for the long way`,
    missing: `Not found — ${config.shopName}`
  };
  document.title = product
    ? `${product.name} — ${config.shopName}`
    : pageTitle[route.name] || `${route.name[0].toUpperCase()}${route.name.slice(1)} — ${config.shopName}`;
  updateChrome();
  const path = location.hash || "#/";
  if (path !== lastPath) {
    window.scrollTo(0, 0);
    lastPath = path;
  }
}

function updateChrome() {
  document.getElementById("cart-count").textContent = String(count());
  const route = parseRoute().name;
  const current = route === "product" ? "shop" : route;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const source = document.getElementById("catalog-source");
  source.textContent = config.apiBase ? `Live catalog ${config.apiBase}` : "Eight pieces, held in the page.";
}

function paintDrawer() {
  const cart = lines();
  const body = document.getElementById("drawer-body");
  if (!cart.length) {
    body.innerHTML = `<div class="drawer-scroll"><p>The cart is empty. The shop is not.</p></div>
      <div class="drawer-foot"><a class="btn full" href="#/shop" data-action="close-drawer">Browse the shop</a></div>`;
    return;
  }
  body.innerHTML = `<div class="drawer-scroll stack">${cart.map((line) => lineMarkup(line, false)).join("")}</div>
    <div class="drawer-foot">
      <div class="total"><span>Total</span><strong>${money(total())}</strong></div>
      <a class="btn full" href="#/checkout" data-action="close-drawer">Checkout</a>
      <a href="#/cart" data-action="close-drawer">Review the full cart</a>
    </div>`;
}

function openDrawer() {
  const drawer = document.getElementById("drawer");
  paintDrawer();
  drawer.hidden = false;
  document.body.classList.add("lock");
  window.requestAnimationFrame(() => {
    drawer.classList.add("is-open");
    const close = drawer.querySelector("[aria-label='Close cart']");
    if (close) close.focus();
  });
}

function closeDrawer() {
  const drawer = document.getElementById("drawer");
  if (drawer.hidden) return;
  drawer.classList.remove("is-open");
  document.body.classList.remove("lock");
  window.setTimeout(() => {
    if (!drawer.classList.contains("is-open")) drawer.hidden = true;
  }, 280);
}

function afterCartChange() {
  updateChrome();
  paintDrawer();
  const name = parseRoute().name;
  if (name === "cart" || name === "checkout") render();
}

function addToCart(id, size) {
  const product = productById(id);
  if (!product) return;
  const cart = loadCart();
  const found = cart.find((line) => line.id === id && line.size === size);
  if (found && found.qty >= 8) {
    toast("Eight is the limit for one parcel");
    openDrawer();
    return;
  }
  if (found) found.qty += 1;
  else cart.push({ id, size, qty: 1 });
  saveCart(cart);
  afterCartChange();
  openDrawer();
  toast(`${product.name} added`);
}

function changeQty(id, size, delta) {
  const cart = loadCart();
  const index = cart.findIndex((line) => line.id === id && line.size === size);
  if (index < 0) return;
  if (delta > 0 && cart[index].qty >= 8) {
    toast("Eight is the limit for one parcel");
    return;
  }
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(cart);
  afterCartChange();
}

function removeLine(id, size) {
  saveCart(loadCart().filter((line) => !(line.id === id && line.size === size)));
  afterCartChange();
}

function validate() {
  if (!draft.name.trim()) return "Add the name for the parcel.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return "That email does not look complete.";
  if (!draft.address.trim() || !draft.city.trim()) return "Add a street and a city.";
  return "";
}

function placeOrder(form) {
  const data = new FormData(form);
  ["name", "email", "address", "city"].forEach((key) => {
    draft[key] = String(data.get(key) || "");
  });
  const message = validate();
  const box = form.querySelector(".form-error");
  if (message) {
    box.textContent = message;
    return;
  }
  const cart = lines();
  if (!cart.length) return;
  const order = {
    id: `NL-${Math.floor(1000 + Math.random() * 9000)}`,
    name: draft.name.trim(),
    city: draft.city.trim(),
    total: total(),
    lines: cart.map((line) => {
      const product = productById(line.id);
      return { name: product.name, size: line.size, qty: line.qty, price: product.price };
    })
  };
  sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
  saveCart([]);
  draft.name = "";
  draft.email = "";
  draft.address = "";
  draft.city = "";
  closeDrawer();
  location.hash = "#/order";
  toast("Receipt written");
}

function onClick(event) {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const id = el.dataset.id || "";
  const size = el.dataset.size || "";
  switch (el.dataset.action) {
    case "add":
      addToCart(id, size);
      break;
    case "inc":
      changeQty(id, size, 1);
      break;
    case "dec":
      changeQty(id, size, -1);
      break;
    case "remove":
      removeLine(id, size);
      break;
    case "size":
      picked[id] = size;
      render();
      break;
    case "open-drawer":
      openDrawer();
      break;
    case "close-drawer":
      closeDrawer();
      break;
    default:
      break;
  }
}

document.querySelectorAll("[data-shop-name]").forEach((el) => {
  el.textContent = config.shopName;
});
document.addEventListener("click", onClick);
document.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (field) draft[field] = event.target.value;
});
document.addEventListener("submit", (event) => {
  if (event.target.id !== "checkout-form") return;
  event.preventDefault();
  placeOrder(event.target);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});
window.addEventListener("hashchange", render);
render();
