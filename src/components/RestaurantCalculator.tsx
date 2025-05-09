
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Clock, 
  Euro, 
  CalendarDays, 
  Save, 
  Download, 
  Upload, 
  FileSpreadsheet 
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedHourlyRate = localStorage.getItem("hourlyRate");
    const savedWorkDays = localStorage.getItem("workDays");
    
    if (savedHourlyRate) {
      setHourlyRate(Number(savedHourlyRate));
    }
    
    if (savedWorkDays) {
      try {
        const parsedWorkDays = JSON.parse(savedWorkDays).map((day: any) => ({
          ...day,
          date: new Date(day.date)
        }));
        setMonthlyWorkDays(parsedWorkDays);
      } catch (error) {
        console.error("Error parsing saved work days", error);
      }
    }
  }, []);

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem("hourlyRate", hourlyRate.toString());
    localStorage.setItem("workDays", JSON.stringify(monthlyWorkDays));
    toast.success("Data saved successfully");
  };

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
      
      const updatedWorkDays = [...monthlyWorkDays, newWorkDay];
      setMonthlyWorkDays(updatedWorkDays);
      
      // Auto-save when adding a new day
      localStorage.setItem("workDays", JSON.stringify(updatedWorkDays));
      
      setTimeIn("");
      setTimeOut("");
      toast.success("Workday added successfully");
    } else {
      toast.error("Please enter valid time values");
    }
  };

  const calculateMonthlyTotals = () => {
    const totalHours = monthlyWorkDays.reduce((sum, day) => sum + day.hoursWorked, 0);
    const totalEarnings = monthlyWorkDays.reduce((sum, day) => sum + day.earnings, 0);
    return { totalHours, totalEarnings };
  };

  const handleClearMonth = () => {
    setMonthlyWorkDays([]);
    localStorage.removeItem("workDays");
    toast.info("Monthly data cleared");
  };

  const handleHourlyRateChange = (value: number) => {
    setHourlyRate(value);
    localStorage.setItem("hourlyRate", value.toString());
  };

  // Download data as CSV file
  const handleDownloadCSV = () => {
    if (monthlyWorkDays.length === 0) {
      toast.error("No data to download");
      return;
    }

    // Create CSV content
    const headers = ["Date", "Time In", "Time Out", "Hours Worked", "Earnings (€)"];
    const rows = monthlyWorkDays.map(day => [
      format(day.date, "yyyy-MM-dd"),
      day.timeIn,
      day.timeOut,
      day.hoursWorked.toFixed(2),
      day.earnings.toFixed(2)
    ]);
    
    // Add totals row
    const { totalHours, totalEarnings } = calculateMonthlyTotals();
    rows.push(["TOTAL", "", "", totalHours.toFixed(2), totalEarnings.toFixed(2)]);
    
    // Create CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `work-schedule-${format(new Date(), "yyyy-MM")}.csv`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    toast.success("Download successful");
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const rows = csvData.split('\n');
        
        // Skip header row and last row (totals)
        const dataRows = rows.slice(1, rows.length - 1);
        
        const parsedWorkDays: WorkDay[] = dataRows
          .filter(row => row.trim() !== '') // Filter out empty rows
          .map(row => {
            const [dateStr, timeIn, timeOut, hoursStr, earningsStr] = row.split(',');
            
            return {
              date: new Date(dateStr),
              timeIn,
              timeOut,
              hoursWorked: parseFloat(hoursStr),
              earnings: parseFloat(earningsStr)
            };
          });

        if (parsedWorkDays.length > 0) {
          setMonthlyWorkDays(parsedWorkDays);
          localStorage.setItem("workDays", JSON.stringify(parsedWorkDays));
          toast.success(`Imported ${parsedWorkDays.length} work days`);
        } else {
          toast.error("No valid data found in the file");
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse the uploaded file");
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  onChange={(e) => handleHourlyRateChange(Number(e.target.value))}
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
                Today's Pay: €{(calculateHoursWorked(timeIn, timeOut) * hourlyRate).toFixed(2)}
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
                        <div className="text-violet-600">€{workDay.earnings.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="space-y-2 mb-4">
                    <div className="text-lg font-semibold">
                      Monthly Hours: {totalHours.toFixed(2)}
                    </div>
                    <div className="text-lg font-semibold text-violet-600">
                      Monthly Total: €{totalEarnings.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Button 
                      variant="outline"
                      onClick={handleClearMonth}
                      className="w-full"
                    >
                      Clear Monthly Data
                    </Button>
                    <Button 
                      onClick={saveData}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Data
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleDownloadCSV}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                    
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="outline"
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload CSV
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Upload Work Schedule</SheetTitle>
                          <SheetDescription>
                            Import your work schedule from a CSV file. The file should have the same format as the downloaded CSV.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50" onClick={handleUploadClick}>
                            <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              Click to select a CSV file or drag and drop it here
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              File should be a CSV with columns: Date, Time In, Time Out, Hours Worked, Earnings
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          
                          <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">CSV Format Example:</h3>
                            <div className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[100px]">Date</TableHead>
                                    <TableHead>Time In</TableHead>
                                    <TableHead>Time Out</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Earnings (€)</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>2025-05-01</TableCell>
                                    <TableCell>09:00</TableCell>
                                    <TableCell>17:00</TableCell>
                                    <TableCell>8.00</TableCell>
                                    <TableCell>124.00</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>2025-05-02</TableCell>
                                    <TableCell>10:00</TableCell>
                                    <TableCell>18:30</TableCell>
                                    <TableCell>8.50</TableCell>
                                    <TableCell>131.75</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
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
