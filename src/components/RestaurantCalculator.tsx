
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";

export const RestaurantCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(15);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [monthlyHours, setMonthlyHours] = useState<number[]>([]);

  const calculateDailyPay = () => {
    return (hourlyRate * hoursWorked).toFixed(2);
  };

  const calculateMonthlyPay = () => {
    const totalHours = monthlyHours.reduce((sum, hours) => sum + hours, 0);
    return (hourlyRate * totalHours).toFixed(2);
  };

  const handleAddDay = () => {
    if (hoursWorked > 0) {
      setMonthlyHours([...monthlyHours, hoursWorked]);
      setHoursWorked(0);
    }
  };

  const handleClearMonth = () => {
    setMonthlyHours([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-violet-900 mb-8">
          Hours & Salary Calculator
        </h1>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="hourlyRate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Hours Worked Today</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="hoursWorked"
                  type="number"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-lg font-semibold">
                Daily Pay: ${calculateDailyPay()}
              </div>
              <Button 
                onClick={handleAddDay}
                className="w-full mt-2"
              >
                Add Day to Monthly Total
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-violet-900 mb-4">Monthly Summary</h2>
          <div className="space-y-4">
            {monthlyHours.length > 0 ? (
              <>
                <div className="space-y-2">
                  {monthlyHours.map((hours, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <span>Day {index + 1}: {hours} hours</span>
                      <span>${(hours * hourlyRate).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="text-lg font-semibold">
                    Monthly Total: ${calculateMonthlyPay()}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleClearMonth}
                    className="w-full mt-2"
                  >
                    Clear Monthly Data
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No days added to monthly total yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
