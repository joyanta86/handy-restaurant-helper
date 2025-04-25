
import React, { useState } from 'react';
import { Calculator } from './Calculator';
import { OrderSummary } from './OrderSummary';

export const RestaurantCalculator = () => {
  const [total, setTotal] = useState<string>('0');
  const [calculations, setCalculations] = useState<string[]>([]);

  const handleResult = (value: string) => {
    setTotal(value);
  };

  const handleAddToSummary = () => {
    if (total !== '0') {
      setCalculations([...calculations, total]);
      setTotal('0');
    }
  };

  const handleClearSummary = () => {
    setCalculations([]);
    setTotal('0');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-violet-900 mb-8">
          Restaurant Calculator
        </h1>
        <OrderSummary items={calculations} onClear={handleClearSummary} />
        <Calculator 
          currentValue={total} 
          onResult={handleResult}
          onAddItem={handleAddToSummary}
        />
      </div>
    </div>
  );
};
