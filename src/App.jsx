import { useState, useEffect } from "react";

// ============================================================
// CONFIGURACIÓN — cambiar por el número real del negocio
// Formato: código país + número sin espacios ni +
// ============================================================
const WA_NUMBER = "5491100000000";
const ADMIN_PASS = "mv2024";

const ACCENT = "#C8873A";
const BG = "#0e0b08";
const SURFACE = "#160f0a";
const SURFACE2 = "#1e140d";
const BORDER = "rgba(200,135,58,0.18)";
const TEXT = "#f0e6d3";
const MUTED = "#a0856b";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Bandolera Clásica", category: "Bolsos", price: 18500, colors: ["Camel", "Negro"], description: "Bandolera artesanal en cuero genuino con correa ajustable.", emoji: "👜", tag: "Más vendido", featured: true, available: true },
  { id: 2, name: "Neceser Grande", category: "Neceseres", price: 12000, colors: ["Camel", "Negro"], description: "Neceser acolchado con cierre reforzado. Ideal para viajes.", emoji: "🧳", tag: null, featured: false, available: true },
  { id: 3, name: "Billetera Hombre", category: "Billeteras", price: 7500, colors: ["Marrón", "Negro", "Azul"], description: "Billetera slim con tarjetero. Cuero vacuno de primera calidad.", emoji: "💼", tag: "Nuevo", featured: false, available: true },
  { id: 4, name: "Bolso Casual", category: "Bolsos", price: 22000, colors: ["Camel", "Marrón"], description: "Bolso crossbody con múltiples compartimentos internos.", emoji: "🎒", tag: null, featured: false, available: true },
  { id: 5, name: "Neceser Compacto", category: "Neceseres", price: 9000, colors: ["Negro", "Camel"], description: "Tamaño ideal para el día a día. Forro interior impermeable.", emoji: "🧴", tag: null, featured: false, available: true },
  { id: 6, name: "Billetera Mujer", category: "Billeteras", price: 8200, colors: ["Camel", "Marrón", "Negro"], description: "Billetera compacta con monedero y múltiples bolsillos.", emoji: "👛", tag: "Nuevo", featured: true, available: true },
  { id: 7, name: "Bandolera XL", category: "Bolsos", price: 26000, colors: ["Negro", "Marrón"], description: "Bolso grande ideal para uso diario o trabajo.", emoji: "🗃️", tag: null, featured: false, available: false },
  { id: 8, name: "Tarjetero Slim", category: "Billeteras", price: 4500, colors: ["Marrón", "Negro", "Camel"], description: "Tarjetero minimalista para hasta 8 tarjetas.", emoji: "🪪", tag: null, featured: false, available: true },
];

const CATEGORIES = ["Todos", "Bolsos", "Neceseres", "Billeteras"];
const COLOR_DOTS = { Camel: "#C8873A", Negro: "#1a1a1a", Marrón: "#6B3A2A", Azul: "#2A3A6B" };
const EMOJIS = ["👜","🧳","💼","🎒","🧴","👛","🗃️","🪪","👝","💍","🧣","🎩"];

const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

function loadProducts() {
  try {
    const saved = localStorage.getItem("mv_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  } catch { return INITIAL_PRODUCTS; }
}
function saveProducts(products) {
  try { localStorage.setItem("mv_products", JSON.stringify(products)); } catch {}
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("shop"); // "shop" | "admin"
  const [authOpen, setAuthOpen] = useState(false);
  const [products, setProducts] = useState(loadProducts);

  const updateProducts = (next) => { setProducts(next); saveProducts(next); };

  if (view === "admin") return (
    <AdminPanel
      products={products}
      updateProducts={updateProducts}
      onExit={() => setView("shop")}
    />
  );

  return (
    <Shop
      products={products}
      onOpenAuth={() => setAuthOpen(true)}
    >
      {authOpen && (
        <AuthModal
          onSuccess={() => { setAuthOpen(false); setView("admin"); }}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </Shop>
  );
}

// ─────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────
function AuthModal({ onSuccess, onClose }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (pass === ADMIN_PASS) { onSuccess(); }
    else {
      setError(true); setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{ ...s.authBox, animation: shake ? "shake 0.4s ease" : "scaleIn 0.25s ease" }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontFamily:"'Cinzel Decorative',serif", color: ACCENT, fontSize: 18, letterSpacing: 4, marginBottom: 24 }}>MV ADMIN</p>
        <input
          type="password"
          placeholder="Contraseña..."
          value={pass}
          onChange={e => { setPass(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ ...s.authInput, borderColor: error ? "#f87171" : BORDER }}
          autoFocus
        />
        {error && <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>Contraseña incorrecta</p>}
        <button style={s.goldBtn} onClick={submit}>ENTRAR</button>
        <button style={s.ghostBtnSm} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHOP
// ─────────────────────────────────────────────
function Shop({ products, onOpenAuth, children }) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem("mv_cart") || "[]"); } catch { return []; } });
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState({});
  const [addedId, setAddedId] = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);
  useEffect(() => { try { localStorage.setItem("mv_cart", JSON.stringify(cart)); } catch {} }, [cart]);

  const visibleProducts = products.filter(p => p.available !== false);
  const filtered = activeCategory === "Todos" ? visibleProducts : visibleProducts.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    const color = selectedColors[product.id] || product.colors[0];
    const key = `${product.id}-${color}`;
    setCart(prev => {
      const exists = prev.find(i => i.key === key);
      if (exists) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, color, key, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, delta) => setCart(prev =>
    prev.map(i => i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
  );

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const checkoutWA = () => {
    if (!cart.length) return;
    const lines = cart.map(i => `• ${i.name} (${i.color}) x${i.qty} — ${fmt(i.price * i.qty)}`).join("%0A");
    const msg = `¡Hola! 👋 Quiero hacer el siguiente pedido:%0A%0A${lines}%0A%0A*Total: ${fmt(total)}*%0A%0A¿Podrían confirmarme disponibilidad? 🙏`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", background: BG, color: TEXT, minHeight:"100vh", overflowX:"hidden" }}>
      <style>{shopCSS}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navLogo}>
            <span style={s.logoM}>MV</span>
            <span style={s.logoText}>MARROQUINERÍA</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap: 16 }}>
            <span style={{ fontSize:11, color: MUTED, letterSpacing:2 }}>Artesanal · Calidad · Tradición</span>
            <button style={s.cartBtn} onClick={() => setCartOpen(true)} className="cart-btn">
              🛒 {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header style={{ ...s.hero, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(24px)" }}>
        <div style={s.heroGrain} />
        <div style={{ position:"relative", zIndex:2, maxWidth:600 }}>
          <p style={{ fontSize:12, letterSpacing:4, color: ACCENT, textTransform:"uppercase", marginBottom:20, fontFamily:"sans-serif" }}>— Zona Oeste, Merlo —</p>
          <h1 style={{ fontSize:"clamp(48px,8vw,88px)", fontWeight:300, lineHeight:1.05, margin:"0 0 24px", color: TEXT }}>
            Cuero que<br /><em style={{ color: ACCENT }}>dura para siempre</em>
          </h1>
          <p style={{ fontSize:16, color: MUTED, lineHeight:1.7, marginBottom:36, fontFamily:"sans-serif", fontWeight:300 }}>
            Bolsos, billeteras y accesorios hechos a mano.<br />Envíos a domicilio · Efectivo y transferencia
          </p>
          <button className="cta-btn" style={s.goldBtn} onClick={() => document.getElementById("productos").scrollIntoView({ behavior:"smooth" })}>
            VER PRODUCTOS
          </button>
        </div>
        <div style={{ position:"absolute", right:-100, top:"50%", transform:"translateY(-50%)", width:500, height:500, borderRadius:"50%", border:"1px solid rgba(200,135,58,0.1)" }} />
      </header>

      {/* PRODUCTS */}
      <section id="productos" style={{ maxWidth:1200, margin:"0 auto", padding:"60px 24px" }}>
        <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:300, marginBottom:24 }}>Nuestros Productos</h2>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:36 }}>
          {CATEGORIES.map(c => (
            <button key={c} style={{ ...s.catBtn, ...(activeCategory === c ? s.catBtnActive : {}) }} onClick={() => setActiveCategory(c)} className="cat-btn">{c}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 }}>
          {filtered.map((p, i) => (
            <div key={p.id} style={{ ...s.card, animationDelay:`${i*60}ms` }} className="product-card">
              {p.featured && <span style={s.featuredBadge}>⭐ DESTACADO</span>}
              {p.tag && !p.featured && <span style={s.tagBadge}>{p.tag}</span>}
              <div style={{ fontSize:64, display:"flex", alignItems:"center", justifyContent:"center", height:140, background:"rgba(200,135,58,0.06)", borderBottom:`1px solid ${BORDER}` }}>{p.emoji}</div>
              <div style={{ padding:20 }}>
                <span style={{ fontSize:10, letterSpacing:3, color: ACCENT, textTransform:"uppercase", fontFamily:"sans-serif" }}>{p.category}</span>
                <h3 style={{ fontSize:20, fontWeight:600, margin:"6px 0 8px" }}>{p.name}</h3>
                <p style={{ fontSize:13, color:"#7a6550", lineHeight:1.6, marginBottom:14, fontFamily:"sans-serif" }}>{p.description}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  {p.colors.map(c => (
                    <button key={c} title={c} style={{ width:18, height:18, borderRadius:"50%", border:"none", cursor:"pointer", background: COLOR_DOTS[c] || "#999", outline: (selectedColors[p.id] || p.colors[0]) === c ? `2px solid ${ACCENT}` : "2px solid transparent", outlineOffset:2 }}
                      onClick={() => setSelectedColors(s => ({ ...s, [p.id]: c }))} />
                  ))}
                  <span style={{ fontSize:12, color: MUTED, fontFamily:"sans-serif" }}>{selectedColors[p.id] || p.colors[0]}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:22, fontWeight:700, color: ACCENT }}>{fmt(p.price)}</span>
                  <button className="add-btn" style={{ ...s.addBtn, ...(addedId === p.id ? s.addBtnDone : {}) }} onClick={() => addToCart(p)}>
                    {addedId === p.id ? "✓ Agregado" : "+ Agregar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STRIP */}
      <div style={{ borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, background:"rgba(200,135,58,0.04)", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"0 40px", padding:"18px 24px" }}>
        {["🚚 Envíos a domicilio","💳 Efectivo y transferencia","📍 Zona Oeste, Merlo","✂️ Hecho a mano"].map(t => (
          <span key={t} style={{ fontSize:13, color: MUTED, letterSpacing:1, fontFamily:"sans-serif" }}>{t}</span>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign:"center", padding:"48px 24px", display:"flex", flexDirection:"column", gap:8, alignItems:"center" }}>
        <span style={{ fontSize:20, letterSpacing:6, color: ACCENT, fontFamily:"'Cinzel Decorative',serif" }}>MV MARROQUINERÍA</span>
        <span style={{ fontSize:12, color:"#4a3828", letterSpacing:3 }}>Artesanal · Calidad · Tradición</span>
        <a href="https://www.instagram.com/mvmarroquineria.accesorios" target="_blank" rel="noreferrer" style={{ fontSize:13, color: MUTED, textDecoration:"none", marginTop:4 }}>📸 @mvmarroquineria.accesorios</a>
        <button onClick={onOpenAuth} style={{ marginTop:20, background:"none", border:"none", color:"rgba(255,255,255,0.15)", fontSize:11, cursor:"pointer", textDecoration:"underline", fontFamily:"sans-serif" }}>acceso privado</button>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div style={s.overlay} onClick={() => setCartOpen(false)}>
          <div style={s.drawer} onClick={e => e.stopPropagation()} className="drawer">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:`1px solid ${BORDER}` }}>
              <h2 style={{ fontSize:22, fontWeight:400, margin:0 }}>Tu carrito</h2>
              <button style={{ background:"none", border:"none", color: MUTED, fontSize:18, cursor:"pointer" }} onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                <span style={{ fontSize:48 }}>🛒</span>
                <p style={{ color: MUTED, fontFamily:"sans-serif" }}>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
                  {cart.map(item => (
                    <div key={item.key} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 24px", borderBottom:`1px solid rgba(200,135,58,0.08)` }}>
                      <span style={{ fontSize:32, flexShrink:0 }}>{item.emoji}</span>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
                        <span style={{ fontSize:15, fontWeight:500 }}>{item.name}</span>
                        <span style={{ fontSize:11, color: MUTED, fontFamily:"sans-serif" }}>{item.color}</span>
                        <span style={{ fontSize:14, color: ACCENT, fontFamily:"sans-serif" }}>{fmt(item.price)}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <button style={s.qtyBtn} onClick={() => updateQty(item.key, -1)}>−</button>
                        <span style={{ fontSize:15, minWidth:20, textAlign:"center", fontFamily:"sans-serif" }}>{item.qty}</span>
                        <button style={s.qtyBtn} onClick={() => updateQty(item.key, 1)}>+</button>
                      </div>
                      <button style={{ background:"none", border:"none", color:"#4a3828", fontSize:14, cursor:"pointer" }} onClick={() => removeFromCart(item.key)}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"20px 24px", borderTop:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontSize:14, color: MUTED, fontFamily:"sans-serif", letterSpacing:2, textTransform:"uppercase" }}>Total</span>
                    <span style={{ fontSize:28, fontWeight:700 }}>{fmt(total)}</span>
                  </div>
                  <button className="wa-btn" style={{ background:"#25D366", color:"#fff", border:"none", borderRadius:8, padding:16, fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"sans-serif" }} onClick={checkoutWA}>
                    💬 Pedir por WhatsApp
                  </button>
                  <p style={{ fontSize:11, color:"#4a3828", textAlign:"center", lineHeight:1.5, fontFamily:"sans-serif", margin:0 }}>Te contactaremos para confirmar disponibilidad y coordinar el pago.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      {cartCount > 0 && !cartOpen && (
        <button className="fab" style={s.fab} onClick={() => setCartOpen(true)}>
          🛒 <span style={{ background: BG, color: ACCENT, borderRadius:"50%", width:22, height:22, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" }}>{cartCount}</span>
        </button>
      )}

      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────
function AdminPanel({ products, updateProducts, onExit }) {
  const [editModal, setEditModal] = useState(null); // null | product | "new"
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Todos");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const toggleFeatured = (id) => {
    updateProducts(products.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
    showToast("✓ Destacado actualizado");
  };
  const toggleAvailable = (id) => {
    updateProducts(products.map(p => p.id === id ? { ...p, available: !p.available } : p));
    showToast("✓ Disponibilidad actualizada");
  };
  const deleteProduct = (id) => {
    updateProducts(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
    showToast("🗑 Producto eliminado");
  };
  const saveProduct = (data) => {
    if (editModal === "new") {
      updateProducts([...products, { ...data, id: Date.now(), featured: false, available: true }]);
      showToast("✓ Producto creado");
    } else {
      updateProducts(products.map(p => p.id === data.id ? data : p));
      showToast("✓ Cambios guardados");
    }
    setEditModal(null);
  };

  const filtered = products
    .filter(p => filterCat === "Todos" || p.category === filterCat)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background: BG, color: TEXT, minHeight:"100vh" }}>
      <style>{adminCSS}</style>

      {/* ADMIN NAV */}
      <nav style={{ background: SURFACE, borderBottom:`1px solid ${BORDER}`, padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:18, color: ACCENT, fontWeight:700 }}>MV</span>
          <span style={{ fontSize:11, letterSpacing:4, color: MUTED, textTransform:"uppercase" }}>ADMIN</span>
          <span style={{ width:1, height:20, background: BORDER, margin:"0 8px" }} />
          <span style={{ fontSize:13, color: MUTED }}>Gestión de productos</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color: MUTED, background: SURFACE2, border:`1px solid ${BORDER}`, borderRadius:20, padding:"6px 14px", fontFamily:"sans-serif" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
            Administrador
          </div>
          <button style={{ background:"none", border:`1px solid rgba(248,113,113,0.3)`, color:"#f87171", borderRadius:6, padding:"7px 16px", cursor:"pointer", fontSize:12, fontFamily:"sans-serif" }} onClick={onExit}>
            ← Volver a la tienda
          </button>
        </div>
      </nav>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, padding:"28px 32px 0" }}>
        {[
          { label:"Total productos", value: products.length, color:"#C8873A" },
          { label:"Disponibles", value: products.filter(p => p.available).length, color:"#4ade80" },
          { label:"Destacados", value: products.filter(p => p.featured).length, color:"#fbbf24" },
          { label:"Sin stock", value: products.filter(p => !p.available).length, color:"#f87171" },
        ].map(st => (
          <div key={st.label} style={{ background: SURFACE, border:`1px solid ${BORDER}`, borderRadius:12, padding:20 }} className="stat-card">
            <div style={{ fontSize:28, fontWeight:700, color: st.color, fontFamily:"'Cormorant Garamond',serif" }}>{st.value}</div>
            <div style={{ fontSize:12, color: MUTED, marginTop:4, fontFamily:"sans-serif" }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 32px 16px", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background: SURFACE, border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px" }}>
            <span style={{ color: MUTED }}>⌕</span>
            <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} style={{ background:"none", border:"none", outline:"none", color: TEXT, fontSize:13, fontFamily:"sans-serif", width:180 }} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {CATEGORIES.map(c => (
              <button key={c} style={{ ...s.catBtn, ...(filterCat === c ? s.catBtnActive : {}), padding:"6px 14px", fontSize:12 }} onClick={() => setFilterCat(c)} className="cat-btn">{c}</button>
            ))}
          </div>
        </div>
        <button style={{ ...s.goldBtn, padding:"10px 22px", fontSize:13 }} className="primary-btn" onClick={() => setEditModal("new")}>
          + Nuevo producto
        </button>
      </div>

      {/* PRODUCT GRID */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20, padding:"0 32px 40px" }}>
        {filtered.map((p, i) => (
          <div key={p.id} style={{ background: SURFACE, border:`1px solid ${p.featured ? "rgba(200,135,58,0.5)" : BORDER}`, borderRadius:12, overflow:"hidden", opacity: p.available ? 1 : 0.6, animationDelay:`${i*40}ms` }} className="admin-card">

            {/* IMAGE AREA */}
            <div style={{ position:"relative", height:160, background:"rgba(200,135,58,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:64 }}>
              {p.emoji}
              <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:6 }}>
                {p.featured && <span style={{ background: ACCENT, color:"#000", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4, letterSpacing:1 }}>⭐ DESTACADO</span>}
                {!p.available && <span style={{ background:"#331a1a", color:"#f87171", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4 }}>AGOTADO</span>}
              </div>
              {p.tag && <span style={{ position:"absolute", top:12, right:12, background:"#000", color:"#fff", fontSize:10, padding:"3px 8px", borderRadius:4 }}>{p.tag}</span>}
            </div>

            {/* INFO */}
            <div style={{ padding:"16px 20px 12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <span style={{ fontSize:10, letterSpacing:3, color: ACCENT, textTransform:"uppercase", fontFamily:"sans-serif" }}>{p.category}</span>
                <span style={{ fontSize:11, color: MUTED, fontFamily:"sans-serif" }}>ID #{p.id}</span>
              </div>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 6px", color: TEXT, fontFamily:"'Cormorant Garamond',serif", textTransform:"uppercase" }}>{p.name}</h3>
              <p style={{ fontSize:12, color:"#6b4f36", lineHeight:1.5, marginBottom:10, fontFamily:"sans-serif" }}>{p.description}</p>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                {p.colors.map(c => <span key={c} title={c} style={{ width:14, height:14, borderRadius:"50%", background: COLOR_DOTS[c] || "#999", display:"inline-block" }} />)}
                <span style={{ fontSize:11, color: MUTED, fontFamily:"sans-serif" }}>{p.colors.join(", ")}</span>
              </div>
              <div style={{ fontSize:22, fontWeight:700, color: ACCENT, fontFamily:"'Cormorant Garamond',serif" }}>{fmt(p.price)}</div>
            </div>

            {/* ACTIONS */}
            <div style={{ padding:"12px 20px 16px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:8 }}>
              <button style={s.actionBtnPrimary} onClick={() => setEditModal(p)} className="action-btn-primary">
                ✎ EDITAR
              </button>
              <button
                title={p.featured ? "Quitar destacado" : "Destacar"}
                style={{ ...s.actionBtnIcon, background: p.featured ? ACCENT : SURFACE2, color: p.featured ? "#000" : MUTED, border: p.featured ? `1px solid ${ACCENT}` : `1px solid ${BORDER}` }}
                onClick={() => toggleFeatured(p.id)}
                className="action-icon-btn"
              >⭐</button>
              <button
                title={p.available ? "Marcar agotado" : "Marcar disponible"}
                style={{ ...s.actionBtnIcon, background: p.available ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", color: p.available ? "#4ade80" : "#f87171", border: `1px solid ${p.available ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}` }}
                onClick={() => toggleAvailable(p.id)}
                className="action-icon-btn"
                title={p.available ? "Disponible" : "Agotado"}
              >{p.available ? "✓" : "✕"}</button>
              <button
                title="Eliminar producto"
                style={{ ...s.actionBtnIcon, color:"#f87171", border:`1px solid rgba(248,113,113,0.2)`, background:"rgba(248,113,113,0.06)" }}
                onClick={() => setDeleteConfirm(p.id)}
                className="delete-btn"
              >🗑</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 0", color: MUTED, fontFamily:"sans-serif" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>◈</div>
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* EDIT / NEW MODAL */}
      {editModal && (
        <EditModal
          product={editModal === "new" ? null : editModal}
          onSave={saveProduct}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.authBox, maxWidth:380 }} onClick={e => e.stopPropagation()} className="modal-in">
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontSize:20, margin:"0 0 8px", fontFamily:"'Cormorant Garamond',serif" }}>¿Eliminar producto?</h3>
            <p style={{ fontSize:13, color: MUTED, fontFamily:"sans-serif", marginBottom:24, lineHeight:1.6 }}>Esta acción no se puede deshacer. El producto será removido del catálogo.</p>
            <div style={{ display:"flex", gap:12 }}>
              <button style={{ flex:1, padding:12, background:"#2a2a2a", border:"none", color: TEXT, borderRadius:8, cursor:"pointer", fontFamily:"sans-serif" }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ flex:1, padding:12, background:"#331a1a", border:"1px solid #f87171", color:"#f87171", borderRadius:8, cursor:"pointer", fontWeight:700, fontFamily:"sans-serif" }} onClick={() => deleteProduct(deleteConfirm)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, right:28, background: SURFACE, border:`1px solid ${BORDER}`, borderLeft:`4px solid ${ACCENT}`, padding:"14px 22px", borderRadius:8, fontSize:14, fontFamily:"sans-serif", color: TEXT, boxShadow:"0 10px 30px rgba(0,0,0,0.5)", zIndex:9999, animation:"slideIn 0.3s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────
function EditModal({ product, onSave, onClose }) {
  const isNew = !product;
  const [form, setForm] = useState(product ? { ...product, colorsStr: product.colors.join(", ") } : {
    name: "", category: "Bolsos", price: "", description: "", colorsStr: "Camel, Negro",
    emoji: "👜", tag: "", featured: false, available: true
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.price) return;
    const colors = form.colorsStr.split(",").map(c => c.trim()).filter(Boolean);
    onSave({ ...form, price: Number(form.price), colors, id: product?.id });
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.editDrawer} onClick={e => e.stopPropagation()} className="drawer">
        {/* HEADER */}
        <div style={{ padding:"24px 28px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Cormorant Garamond',serif", fontWeight:400 }}>
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h2>
          <button style={{ background:"none", border:"none", color: MUTED, fontSize:20, cursor:"pointer" }} onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>
          {/* EMOJI PICKER */}
          <div>
            <label style={s.label}>ÍCONO DEL PRODUCTO</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => set("emoji", e)} style={{ fontSize:24, padding:8, background: form.emoji === e ? "rgba(200,135,58,0.2)" : SURFACE2, border:`1px solid ${form.emoji === e ? ACCENT : BORDER}`, borderRadius:8, cursor:"pointer" }}>{e}</button>
              ))}
            </div>
          </div>

          {/* NOMBRE + PRECIO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={s.label}>NOMBRE *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Bandolera Clásica" style={s.input} />
            </div>
            <div>
              <label style={s.label}>PRECIO ($) *</label>
              <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="18500" style={s.input} />
            </div>
          </div>

          {/* CATEGORÍA + TAG */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={s.label}>CATEGORÍA</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={s.input}>
                {["Bolsos","Billeteras","Neceseres","Accesorios"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>ETIQUETA (opcional)</label>
              <input value={form.tag || ""} onChange={e => set("tag", e.target.value || null)} placeholder="Ej: Nuevo, Top, Oferta" style={s.input} />
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label style={s.label}>DESCRIPCIÓN</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...s.input, resize:"vertical", lineHeight:1.6 }} placeholder="Material, medidas, características..." />
          </div>

          {/* COLORES */}
          <div>
            <label style={s.label}>COLORES (separados por coma)</label>
            <input value={form.colorsStr} onChange={e => set("colorsStr", e.target.value)} placeholder="Camel, Negro, Marrón" style={s.input} />
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              {form.colorsStr.split(",").map(c => c.trim()).filter(Boolean).map(c => (
                <span key={c} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color: MUTED, fontFamily:"sans-serif" }}>
                  <span style={{ width:12, height:12, borderRadius:"50%", background: COLOR_DOTS[c] || "#999", display:"inline-block" }} />{c}
                </span>
              ))}
            </div>
          </div>

          {/* CHECKBOXES */}
          <div style={{ display:"flex", gap:24 }}>
            {[["featured","⭐ Destacado"],["available","✓ Disponible"]].map(([k, label]) => (
              <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, fontFamily:"sans-serif", color: TEXT }}>
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)}
                  style={{ width:16, height:16, accentColor: ACCENT }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding:"20px 28px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:12 }}>
          <button style={{ flex:1, padding:14, background:"#2a2a2a", border:"none", color: TEXT, borderRadius:8, cursor:"pointer", fontFamily:"sans-serif" }} onClick={onClose}>Cancelar</button>
          <button style={{ flex:2, padding:14, background: ACCENT, border:"none", color:"#000", borderRadius:8, cursor:"pointer", fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontFamily:"sans-serif" }} onClick={submit} className="primary-btn">
            {isNew ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", justifyContent:"flex-end" },
  authBox: { position:"fixed", inset:0, margin:"auto", width:"90%", maxWidth:360, height:"fit-content", background: SURFACE, border:`1px solid ${BORDER}`, borderRadius:16, padding:"36px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:12, textAlign:"center", zIndex:1001 },
  authInput: { width:"100%", padding:"14px", background:"#000", border:`1px solid ${BORDER}`, color: TEXT, borderRadius:8, fontSize:15, fontFamily:"sans-serif", textAlign:"center", outline:"none" },
  goldBtn: { background: ACCENT, color:"#000", border:"none", borderRadius:6, padding:"13px 32px", fontWeight:700, cursor:"pointer", fontSize:13, letterSpacing:2, textTransform:"uppercase", width:"100%", fontFamily:"sans-serif" },
  ghostBtnSm: { background:"none", border:"none", color: MUTED, cursor:"pointer", fontSize:13, fontFamily:"sans-serif", marginTop:4 },
  nav: { position:"sticky", top:0, zIndex:100, background:"rgba(14,11,8,0.92)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${BORDER}` },
  navInner: { maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" },
  navLogo: { display:"flex", alignItems:"center", gap:10 },
  logoM: { fontFamily:"'Cinzel Decorative',serif", fontSize:22, fontWeight:700, color: ACCENT, letterSpacing:2 },
  logoText: { fontSize:13, fontWeight:600, letterSpacing:4, color: TEXT, textTransform:"uppercase" },
  cartBtn: { background:"none", border:`1px solid rgba(200,135,58,0.4)`, borderRadius:8, padding:"6px 14px", cursor:"pointer", position:"relative", display:"flex", alignItems:"center", gap:6, color: TEXT, fontSize:18 },
  cartBadge: { position:"absolute", top:-6, right:-6, background: ACCENT, color: BG, borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" },
  hero: { position:"relative", minHeight:"85vh", display:"flex", alignItems:"center", padding:"80px 24px", transition:"opacity 0.8s ease, transform 0.8s ease", overflow:"hidden" },
  heroGrain: { position:"absolute", inset:0, backgroundImage:`radial-gradient(ellipse at 60% 50%, rgba(200,135,58,0.12) 0%, transparent 60%)`, pointerEvents:"none" },
  catBtn: { background:"none", border:`1px solid rgba(200,135,58,0.3)`, color: MUTED, padding:"7px 18px", borderRadius:4, cursor:"pointer", fontSize:13, letterSpacing:1, fontFamily:"sans-serif" },
  catBtnActive: { background: ACCENT, borderColor: ACCENT, color:"#0e0b08", fontWeight:700 },
  card: { background:"rgba(255,255,255,0.03)", border:`1px solid rgba(200,135,58,0.15)`, borderRadius:12, overflow:"hidden", position:"relative", animation:"fadeUp 0.5s both" },
  featuredBadge: { position:"absolute", top:14, left:14, background: ACCENT, color:"#000", fontSize:10, fontWeight:700, letterSpacing:1, padding:"4px 10px", borderRadius:3, textTransform:"uppercase", fontFamily:"sans-serif", zIndex:2 },
  tagBadge: { position:"absolute", top:14, right:14, background:"#000", color:"#fff", fontSize:10, fontWeight:700, letterSpacing:1, padding:"4px 10px", borderRadius:3, textTransform:"uppercase", fontFamily:"sans-serif", zIndex:2 },
  addBtn: { background:"none", border:`1px solid ${ACCENT}`, color: ACCENT, padding:"8px 16px", borderRadius:4, cursor:"pointer", fontSize:12, fontWeight:700, letterSpacing:1, fontFamily:"sans-serif" },
  addBtnDone: { background: ACCENT, color:"#0e0b08" },
  qtyBtn: { width:26, height:26, background:"rgba(200,135,58,0.15)", border:`1px solid rgba(200,135,58,0.3)`, borderRadius:4, color: ACCENT, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" },
  fab: { position:"fixed", bottom:24, right:24, background: ACCENT, color: BG, border:"none", borderRadius:50, padding:"14px 20px", fontSize:20, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(200,135,58,0.4)", display:"flex", alignItems:"center", gap:8, zIndex:150 },
  actionBtnPrimary: { flex:1, padding:"9px 0", background: SURFACE2, border:`1px solid ${ACCENT}`, color: ACCENT, fontWeight:700, borderRadius:8, cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase", fontFamily:"sans-serif" },
  actionBtnIcon: { width:36, height:36, borderRadius:8, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  editDrawer: { width:"min(520px,100vw)", background: SURFACE, borderLeft:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", height:"100vh", animation:"slideIn 0.3s ease" },
  label: { display:"block", fontSize:11, fontWeight:700, color: MUTED, marginBottom:8, letterSpacing:2, textTransform:"uppercase", fontFamily:"sans-serif" },
  input: { width:"100%", background: SURFACE2, border:`1px solid rgba(200,135,58,0.25)`, borderRadius:8, padding:"11px 14px", color: TEXT, fontSize:14, fontFamily:"sans-serif", outline:"none" },
};

const shopCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Cinzel+Decorative:wght@700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
  .product-card:hover { transform:translateY(-4px); border-color:rgba(200,135,58,0.4) !important; }
  .add-btn:hover { background:#C8873A !important; color:#0e0b08 !important; }
  .cta-btn:hover { opacity:0.85; }
  .cart-btn:hover { border-color:#C8873A !important; }
  .wa-btn:hover { opacity:0.9; }
  .fab:hover { transform:scale(1.05); }
  .cat-btn:hover { color:#C8873A !important; border-color:#C8873A !important; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(200,135,58,0.3); border-radius:2px; }
`;

const adminCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=DM+Sans:wght@400;500;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes slideIn { from{transform:translateX(100%);} to{transform:translateX(0);} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.94);} to{opacity:1;transform:scale(1);} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
  .admin-card { transition:transform 0.25s, border-color 0.25s; animation:fadeUp 0.4s both; }
  .admin-card:hover { transform:translateY(-3px); border-color:rgba(200,135,58,0.4) !important; }
  .stat-card { transition:border-color 0.2s; }
  .stat-card:hover { border-color:rgba(200,135,58,0.4) !important; }
  .action-btn-primary:hover { background:#C8873A !important; color:#000 !important; }
  .action-icon-btn:hover { opacity:0.8; transform:scale(1.1); }
  .delete-btn:hover { background:rgba(248,113,113,0.15) !important; border-color:#f87171 !important; }
  .primary-btn:hover { opacity:0.88; }
  .modal-in { animation:scaleIn 0.25s ease; }
  .cat-btn:hover { color:#C8873A !important; border-color:#C8873A !important; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(200,135,58,0.3); border-radius:2px; }
  input:focus, select:focus, textarea:focus { border-color:rgba(200,135,58,0.5) !important; }
`;
