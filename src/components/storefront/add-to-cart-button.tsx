"use client";

import React, { useState } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Props {
  product: {
    id:          string;
    name:        string;
    slug:        string;
    images:      string[];
    basePrice:   number;
    stock:       number;
    vendorId:    string;
    vendorName?: string | null;
  };
}

export function AddToCartButton({ product }: Props) {
  const [qty, setQty]       = useState(1);
  const [added, setAdded]   = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    if (product.stock === 0) return;
    addItem({
      productId:  product.id,
      name:       product.name,
      image:      (product.images as string[])[0],
      price:      product.basePrice,
      quantity:   qty,
      vendorId:   product.vendorId ?? "",
      vendorName: product.vendorName ?? "",
      stock:      product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Quantity */}
      <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
        <button onClick={() => setQty(Math.max(1, qty - 1))}
          className="w-10 h-11 flex items-center justify-center hover:bg-muted transition-colors text-foreground font-bold">
          <Minus size={16} />
        </button>
        <span className="w-12 text-center font-poppins font-bold text-base text-foreground">{qty}</span>
        <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
          disabled={qty >= product.stock}
          className="w-10 h-11 flex items-center justify-center hover:bg-muted transition-colors text-foreground font-bold disabled:opacity-40">
          <Plus size={16} />
        </button>
      </div>

      {/* Add button */}
      <Button
        fullWidth
        onClick={handleAdd}
        disabled={product.stock === 0}
        className={cn("transition-all", added && "bg-success hover:bg-success")}
        leftIcon={added ? <Check size={18} /> : <ShoppingCart size={18} />}
        size="lg"
      >
        {product.stock === 0 ? "Rupture de stock" : added ? "Ajouté !" : "Ajouter au panier"}
      </Button>
    </div>
  );
}
