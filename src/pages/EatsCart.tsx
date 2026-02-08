/**
 * ZIVO Eats — Cart Page
 * Dark glass UI with price breakdown
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart } from "@/contexts/CartContext";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

function EatsCartContent() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();

  const subtotal = getSubtotal();
  const deliveryFee = 3.99;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + serviceFee + tax;

  const restaurantName = items.length > 0 ? items[0].restaurantName : "";

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <SEOHead title="Cart — ZIVO Eats" description="Your food order cart" />
        
        {/* Header */}
        <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">Your Cart</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center px-6 pt-32">
          <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 text-center mb-8">
            Add delicious food from our restaurants
          </p>
          <Button
            onClick={() => navigate("/eats")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 h-12 rounded-xl"
          >
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-40">
      <SEOHead title="Cart — ZIVO Eats" description="Review your food order" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Restaurant Name */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-bold">{restaurantName}</p>
            <p className="text-sm text-zinc-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-6 py-4 space-y-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-4"
          >
            <div className="flex gap-4">
              {/* Image */}
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <UtensilsCrossed className="w-6 h-6 text-orange-500/30" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {item.notes && (
                  <p className="text-xs text-zinc-500 mt-1">{item.notes}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-orange-400">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="px-6 py-4">
        <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <Button
          onClick={() => navigate("/eats/checkout")}
          className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl shadow-orange-500/20"
        >
          Proceed to Checkout · ${total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}

export default function EatsCart() {
  return (
    <CartProvider>
      <EatsCartContent />
    </CartProvider>
  );
}
