
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Clock, DollarSign, CalendarDays, Euro } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type WorkDay = {
  date: Date;
  timeIn: string;
  timeOut: string;
  hoursWorked: number;
  earnings: number;
};

export const RestaurantCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(15.50);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeIn, setTimeIn] = useState<string>("");
  const [timeOut, setTimeOut] = useState<string>("");
  const [monthlyWorkDays, setMonthlyWorkDays] = useState<WorkDay[]>([]);

  const calculateHoursWorked = (timeIn: string, timeOut: string): number => {
    if (!timeIn || !timeOut) return 0;
    
    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);
    
    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    return Math.round((totalMinutes / 60) * 100) / 100;
  };

  const handleAddDay = () => {
    const hoursWorked = calculateHoursWorked(timeIn, timeOut);
    if (hoursWorked > 0) {
      const earnings = hoursWorked * hourlyRate;
      const newWorkDay: WorkDay = {
        date: selectedDate,
        timeIn,
        timeOut,
        hoursWorked,
        earnings
      };
      
      setMonthlyWorkDays([...monthlyWorkDays, newWorkDay]);
      setTimeIn("");
      setTimeOut("");
    }
  };

  const calculateMonthlyTotals = () => {
    const totalHours = monthlyWorkDays.reduce((sum, day) => sum + day.hoursWorked, 0);
    const totalEarnings = monthlyWorkDays.reduce((sum, day) => sum + day.earnings, 0);
    return { totalHours, totalEarnings };
  };

  const handleClearMonth = () => {
    setMonthlyWorkDays([]);
  };

  const { totalHours, totalEarnings } = calculateMonthlyTotals();

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-violet-900 mb-8">
          Work Hours & Salary Calculator
        </h1>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeIn">Time In</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="timeIn"
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeOut">Time Out</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="timeOut"
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-lg font-semibold">
                Today's Hours: {calculateHoursWorked(timeIn, timeOut)}
              </div>
              <div className="text-lg font-semibold mb-2">
                Today's Pay: ${(calculateHoursWorked(timeIn, timeOut) * hourlyRate).toFixed(2)}
              </div>
              <Button 
                onClick={handleAddDay}
                className="w-full"
              >
                Add Day to Monthly Total
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-violet-900 mb-4">Monthly Summary</h2>
          <div className="space-y-4">
            {monthlyWorkDays.length > 0 ? (
              <>
                <div className="space-y-2">
                  {monthlyWorkDays.map((workDay, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div className="space-y-1">
                        <div className="font-medium">{format(workDay.date, "MMM d, yyyy")}</div>
                        <div className="text-sm text-gray-500">
                          {workDay.timeIn} - {workDay.timeOut}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{workDay.hoursWorked} hours</div>
                        <div className="text-violet-600">${workDay.earnings.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      Monthly Hours: {totalHours.toFixed(2)}
                    </div>
                    <div className="text-lg font-semibold text-violet-600">
                      Monthly Total: ${totalEarnings.toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleClearMonth}
                    className="w-full mt-4"
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
