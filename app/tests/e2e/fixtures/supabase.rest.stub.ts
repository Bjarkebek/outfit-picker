import { Page } from "@playwright/test";
import { stubSupabaseAuth } from './auth.stub';

// Lille in-memory “DB” så POST/INSERT afspejles i efterfølgende GETs:
function seedDB() {
  // typer matcher dine heuristikker i generate/page.tsx (shirt/pants/sneakers osv.)
  const items = [
    { id: "i-top-1", category: "top", description: "Blue blouse", brand: "Zara", type: "blouse", active: true, statement_piece: false, image_url: null },
    { id: "i-bottom-1", category: "bottom", description: "Black pants", brand: "COS", type: "pants", active: true, statement_piece: false, image_url: null },
    { id: "i-shoes-1", category: "shoes", description: "White sneakers", brand: "Nike", type: "sneakers", active: true, statement_piece: false, image_url: null },
    { id: "i-jacket-1", category: "jacket", description: "Denim jacket", brand: "Levi's", type: "denim", active: true, statement_piece: false, image_url: null },
    { id: "i-jewel-1", category: "jewelry", description: "Pearl earrings", brand: "H&M", type: "earrings", active: true, statement_piece: false, image_url: null },
    { id: "i-hair-1", category: "hairclip", description: "Black clip", brand: "Muji", type: null, active: true, statement_piece: false, image_url: null },
  ];
  const outfits: any[] = [];
  const outfititems: any[] = [];
  return { items, outfits, outfititems };
}

/**
 * Stubber alle væsentlige REST/Storage-kald mod:
 * - /rest/v1/item, /rest/v1/outfit, /rest/v1/outfititem
 * - /storage/v1/object/outfit-images
 * Matcher dine aktuelle sider (Items, Outfits, Generate).
 */
export async function stubSupabaseData(page: Page) {
  const db = seedDB();

  // Helper til at parse query
  const isGET = (r: any) => r.request().method() === "GET";
  const isPOST = (r: any) => r.request().method() === "POST";

  // -------- ITEM --------
  // GET /rest/v1/item?select=*&... (evt. eq=active.true)
  await page.route(/\/rest\/v1\/item(\?.*)?$/, async (route) => {
    const req = route.request();
    if (isGET(route)) {
      // eq=active.true -> filtrer aktive
      const url = new URL(req.url());
      const hasActive = url.searchParams.get("active")?.includes(".true");
      const data = hasActive ? db.items.filter(i => i.active) : db.items;
      return route.fulfill({ status: 200, json: data });
    }

    if (isPOST(route)) {
      let body: any = {};
      try { body = JSON.parse(req.postData() || "{}"); } catch {}
      const rec = Array.isArray(body) ? body[0] : body;
      const id = rec.id || `i-${Math.random().toString(36).slice(2, 8)}`;
      const newItem = { id, ...rec };
      db.items.unshift(newItem);
      return route.fulfill({ status: 201, json: { id, category: newItem.category } });
    }

    return route.fallback();
  });

  // Subtype endpoints du kalder i Items (vi accepterer inserts/upserts med 201/204)
  for (const table of ["top", "bottom", "jacket", "shoe", "jewelry", "hairclip"]) {
    await page.route(new RegExp(`/rest/v1/${table}(\\?.*)?$`), async (route) => {
      if (isPOST(route)) return route.fulfill({ status: 201, json: {} });
      // upsert i edit-mode
      if (route.request().method() === "UPSERT" || route.request().method() === "PATCH" || route.request().method() === "PUT") {
        return route.fulfill({ status: 204, body: "" });
      }
      // GET til subtype i loadItems() -> svar med tom liste for simpelt seed (du kan udvide)
      if (isGET(route)) return route.fulfill({ status: 200, json: [] });
      return route.fallback();
    });
  }

  // -------- OUTFIT --------
  await page.route(/\/rest\/v1\/outfit(\?.*)?$/, async (route) => {
    const req = route.request();

    if (isGET(route)) {
      const data = db.outfits.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
      return route.fulfill({ status: 200, json: data });
    }

    if (isPOST(route)) {
      let body: any = {};
      try { body = JSON.parse(req.postData() || "{}"); } catch {}
      const rec = Array.isArray(body) ? body[0] : body;
      const id = rec.id || `o-${Math.random().toString(36).slice(2, 8)}`;
      const row = { id, created_at: Date.now(), ...rec };
      db.outfits.unshift(row);
      return route.fulfill({ status: 201, json: row });
    }

    // UPDATE
    if (["PATCH", "PUT"].includes(req.method())) {
      return route.fulfill({ status: 204, body: "" });
    }

    // DELETE
    if (req.method() === "DELETE") {
      const url = new URL(req.url());
      const eqId = url.searchParams.get("id") || ""; // supabase bruger ?id=eq.xxx
      const id = eqId.replace(/^eq\./, "");
      const idx = db.outfits.findIndex(o => o.id === id);
      if (idx >= 0) db.outfits.splice(idx, 1);
      return route.fulfill({ status: 204, body: "" });
    }

    return route.fallback();
  });

  // /rest/v1/outfititem
  await page.route(/\/rest\/v1\/outfititem(\?.*)?$/, async (route) => {
    const req = route.request();

    if (isGET(route)) {
      // bruges på outfits/page.tsx med select=role,item_id,item:item(...)
      // returnér simple rows, item embed håndterer vi ikke — siden tåler nulls
      const url = new URL(req.url());
      const eqOutfit = url.searchParams.get("outfit_id") || "";
      const outfitId = eqOutfit.replace(/^eq\./, "");
      const rows = db.outfititems.filter(oi => oi.outfit_id === outfitId);
      return route.fulfill({ status: 200, json: rows });
    }

    if (isPOST(route)) {
      let body: any = {};
      try { body = JSON.parse(req.postData() || "{}"); } catch {}
      const rows = Array.isArray(body) ? body : [body];
      rows.forEach((r: any) => db.outfititems.push(r));
      return route.fulfill({ status: 201, json: rows });
    }

    if (req.method() === "DELETE") {
      const url = new URL(req.url());
      const eqOutfit = url.searchParams.get("outfit_id") || "";
      const eqRole = url.searchParams.get("role") || "";
      const eqItem = url.searchParams.get("item_id") || "";
      const outfitId = eqOutfit.replace(/^eq\./, "");
      const role = eqRole.replace(/^eq\./, "");
      const itemId = eqItem.replace(/^eq\./, "");

      // slet efter givne filters (enkle varianter)
      let rows = db.outfititems;
      rows = outfitId ? rows.filter(r => !(r.outfit_id === outfitId && (!role || r.role === role) && (!itemId || r.item_id === itemId))) : rows;
      db.outfititems.length = 0;
      db.outfititems.push(...rows);
      return route.fulfill({ status: 204, body: "" });
    }

    return route.fallback();
  });

  // -------- STORAGE UPLOAD --------
  await page.route(/\/storage\/v1\/object\/outfit-images\/.*/, async (route) => {
    return route.fulfill({ status: 200, json: { Key: "outfit-images/mock.jpg" } });
  });
}

export async function stubAuthAndData(page: Page) {
  await stubSupabaseAuth(page);
  await stubSupabaseData(page);
}
