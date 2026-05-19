// Firebase & Cloudinary Service for MV Marroquinería
// Basado en el motor de sincronización de LC1 Goalkeeper

let db = null;
let isFirebaseActive = false;

// Inicializar Firebase si las credenciales son válidas
try {
    const config = window.firebaseConfig;
    if (config && config.apiKey && config.apiKey !== "TU_API_KEY_AQUÍ" && config.apiKey !== "") {
        firebase.initializeApp(config);
        db = firebase.firestore();
        isFirebaseActive = true;
        console.log("🔥 [Firebase] Conexión establecida con éxito en la nube.");
    } else {
        console.warn("⚠️ [Firebase] Corriendo en modo Local / Sandbox. Configura las credenciales reales en firebase-config.js para conectar la base de datos en la nube.");
    }
} catch (error) {
    console.error("❌ [Firebase] Error al inicializar Firebase:", error);
}

const FirebaseService = {
    // --- Diagnóstico de Conexión ---
    isCloudActive() {
        return isFirebaseActive;
    },

    // --- Autosiembra (Seeding) ---
    // Si la base de datos está vacía, se inicializa automáticamente con los valores por defecto
    async autoSeedDatabase(initialProducts, initialZones, initialCoupons, initialConfig) {
        if (!isFirebaseActive) return;
        try {
            const productSnapshot = await db.collection("products").limit(1).get();
            if (productSnapshot.empty) {
                console.log("🌱 [Firebase] Inicializando base de datos vacía con productos por defecto...");
                for (const p of initialProducts) {
                    await db.collection("products").doc(String(p.id)).set(p);
                }
                for (const z of initialZones) {
                    await db.collection("shipping_zones").doc(String(z.id)).set(z);
                }
                for (const c of initialCoupons) {
                    await db.collection("coupons").doc(String(c.code)).set(c);
                }
                await db.collection("settings").doc("main").set(initialConfig);
                console.log("🌱 [Firebase] Base de datos inicializada exitosamente.");
            }
        } catch (error) {
            console.error("❌ [Firebase] Error durante el proceso de autosiembra:", error);
        }
    },

    // --- PRODUCTOS ---
    async getProducts() {
        if (!isFirebaseActive) {
            // Modo local: Leer de localStorage
            const local = localStorage.getItem("mv_products");
            return local ? JSON.parse(local) : null;
        }
        try {
            console.log("[Firebase] Obteniendo productos de Firestore...");
            const snapshot = await db.collection("products").get();
            return snapshot.docs.map(doc => ({ id: Number(doc.id) || doc.id, ...doc.data() }));
        } catch (error) {
            console.error("[Firebase] Error al obtener productos:", error);
            throw error;
        }
    },

    async saveProduct(product) {
        if (!isFirebaseActive) return;
        try {
            const id = String(product.id);
            console.log("[Firebase] Guardando producto:", id);
            await db.collection("products").doc(id).set(product);
        } catch (error) {
            console.error("[Firebase] Error al guardar producto:", error);
        }
    },

    async deleteProduct(id) {
        if (!isFirebaseActive) return;
        try {
            console.log("[Firebase] Eliminando producto:", id);
            await db.collection("products").doc(String(id)).delete();
        } catch (error) {
            console.error("[Firebase] Error al eliminar producto:", error);
        }
    },

    // --- ZONAS DE ENVÍO ---
    async getShippingZones() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("mv_shipping_zones");
            return local ? JSON.parse(local) : null;
        }
        try {
            const snapshot = await db.collection("shipping_zones").get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("[Firebase] Error al obtener zonas:", error);
            return null;
        }
    },

    async saveShippingZone(zone) {
        if (!isFirebaseActive) return;
        try {
            await db.collection("shipping_zones").doc(String(zone.id)).set(zone);
        } catch (error) {
            console.error("[Firebase] Error al guardar zona:", error);
        }
    },

    // --- CUPONES ---
    async getCoupons() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("mv_coupons");
            return local ? JSON.parse(local) : null;
        }
        try {
            const snapshot = await db.collection("coupons").get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("[Firebase] Error al obtener cupones:", error);
            return null;
        }
    },

    async saveCoupon(coupon) {
        if (!isFirebaseActive) return;
        try {
            await db.collection("coupons").doc(String(coupon.code)).set(coupon);
        } catch (error) {
            console.error("[Firebase] Error al guardar cupón:", error);
        }
    },

    async deleteCoupon(code) {
        if (!isFirebaseActive) return;
        try {
            await db.collection("coupons").doc(String(code)).delete();
        } catch (error) {
            console.error("[Firebase] Error al eliminar cupón:", error);
        }
    },

    // --- CONFIGURACIÓN GLOBAL (BANNER) ---
    async getConfig() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("mv_config");
            return local ? JSON.parse(local) : null;
        }
        try {
            const doc = await db.collection("settings").doc("main").get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error("[Firebase] Error al obtener configuración:", error);
            return null;
        }
    },

    async saveConfig(config) {
        if (!isFirebaseActive) return;
        try {
            await db.collection("settings").doc("main").set(config);
        } catch (error) {
            console.error("[Firebase] Error al guardar configuración:", error);
        }
    },

    // --- PEDIDOS (ORDERS) ---
    async getOrders() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("mv_orders");
            return local ? JSON.parse(local) : [];
        }
        try {
            const snapshot = await db.collection("orders").orderBy("date", "desc").get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("[Firebase] Error al obtener pedidos:", error);
            return [];
        }
    },

    async saveOrder(order) {
        if (!isFirebaseActive) return;
        try {
            await db.collection("orders").doc(String(order.id)).set(order);
        } catch (error) {
            console.error("[Firebase] Error al guardar pedido:", error);
        }
    },

    // --- CLIENTES (CUSTOMERS) ---
    async getCustomers() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("mv_customers");
            return local ? JSON.parse(local) : [];
        }
        try {
            const snapshot = await db.collection("customers").get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("[Firebase] Error al obtener clientes:", error);
            return [];
        }
    },

    async saveCustomer(customer) {
        if (!isFirebaseActive) return;
        try {
            await db.collection("customers").doc(String(customer.phone)).set(customer);
        } catch (error) {
            console.error("[Firebase] Error al guardar cliente:", error);
        }
    },

    // --- SUBIDA DE IMÁGENES A CLOUDINARY ---
    async uploadImage(file) {
        console.log("[Cloudinary] Iniciando subida a Cloudinary...");
        
        // Usamos las credenciales configuradas en LC1 Goalkeeper
        const cloudName = "dgb5o9y0v";
        const uploadPreset = "ugda3w5p";
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Error al subir la imagen");
            }

            const data = await response.json();
            console.log("[Cloudinary] Imagen subida exitosamente:", data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error("[Cloudinary] Error crítico al subir imagen:", error);
            throw error;
        }
    }
};

// Exportar para uso global
window.FirebaseService = FirebaseService;
