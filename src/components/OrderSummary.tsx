
import React from 'react';
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  items: string[];
  onClear: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, onClear }) => {
  const total = items.reduce((sum, item) => sum + parseFloat(item), 0).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-violet-900">Order Summary</h2>
        {items.length > 0 && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={onClear}
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-100"
          >
            <span className="text-gray-600">Item {index + 1}</span>
            <span className="font-mono">${parseFloat(item).toFixed(2)}</span>
          </div>
        ))}
        {items.length > 0 && (
          <div className="flex justify-between items-center pt-4 font-semibold">
            <span>Total</span>
            <span className="font-mono text-lg text-violet-900">${total}</span>
          </div>
        )}
        {items.length === 0 && (
          <p className="text-gray-500 text-center py-4">No items added yet</p>
        )}
      </div>
    </div>
  );
};
