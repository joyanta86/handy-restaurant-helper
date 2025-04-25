
import React from 'react';
import { Button } from "@/components/ui/button";

interface CalculatorProps {
  currentValue: string;
  onResult: (value: string) => void;
  onAddItem: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currentValue,
  onResult,
  onAddItem,
}) => {
  const handleButtonClick = (value: string) => {
    let newValue = currentValue;

    switch (value) {
      case 'C':
        newValue = '0';
        break;
      case '=':
        try {
          newValue = eval(currentValue).toString();
        } catch {
          newValue = 'Error';
        }
        break;
      case '.':
        if (!currentValue.includes('.')) {
          newValue = currentValue + '.';
        }
        break;
      default:
        newValue = currentValue === '0' ? value : currentValue + value;
    }

    onResult(newValue);
  };

  const calculatorButtons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="bg-violet-50 rounded-lg p-4 mb-4">
        <div className="text-right text-3xl font-mono text-violet-900">
          {currentValue}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          className="col-span-2 bg-red-100 hover:bg-red-200 border-red-200"
          onClick={() => handleButtonClick('C')}
        >
          Clear
        </Button>
        <Button
          variant="outline"
          className="col-span-2 bg-violet-100 hover:bg-violet-200 border-violet-200"
          onClick={onAddItem}
        >
          Add Item
        </Button>
        {calculatorButtons.map((btn) => (
          <Button
            key={btn}
            variant="outline"
            className={`aspect-square text-lg ${
              ['+', '-', '*', '/', '='].includes(btn)
                ? 'bg-violet-100 hover:bg-violet-200 border-violet-200'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleButtonClick(btn)}
          >
            {btn}
          </Button>
        ))}
      </div>
    </div>
  );
};
