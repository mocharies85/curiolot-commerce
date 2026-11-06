import { NextResponse } from "next/server";
import { 
  getAllProducts, 
  getPublicProducts, 
  getProductBySlug,
  addProduct,
  updateProductStatus, 
  deleteProduct 
} from "@/lib/products";

// GET: Mengambil daftar produk atau produk spesifik berdasarkan slug
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "aries";
  const slug = searchParams.get("slug");
  const isPublic = searchParams.get("public") === "true";

  if (slug) {
    const product = getProductBySlug(username, slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  const products = isPublic ? getPublicProducts(username) : getAllProducts(username);
  return NextResponse.json(products);
}

// POST: Menyimpan produk baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body.username || "aries";
    const newProduct = addProduct(username, body);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Failed to save product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PATCH: Mengubah status aktif / sembunyi
export async function PATCH(request: Request) {
  try {
    const { id, isActive } = await request.json();
    const updated = updateProductStatus(id, isActive);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE: Menghapus produk
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const success = deleteProduct(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}