import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';

export function LeaveRequestForm() {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Date validation is now handled directly in the onChange handlers

  // Reset form
  useEffect(() => {
    setStartDate('');
    setEndDate('');
    setType('');
    setReason('');
    setError('');
    setSuccess(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess(false);
      
      // Validate all required fields
      if (!startDate || !endDate || !type || !reason?.trim()) {
        const missingFields = [];
        if (!startDate) missingFields.push('Start Date');
        if (!endDate) missingFields.push('End Date');
        if (!type) missingFields.push('Leave Type');
        if (!reason?.trim()) missingFields.push('Reason');
        
        const errorMessage = `Please fill in the following fields: ${missingFields.join(', ')}`;
        setError(errorMessage);
        return;
      }

      // Validate date format and range
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Check if dates are valid
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        setError('Please enter valid dates');
        return;
      }

      // Validate year range (2024-2025)
      const startYear = startDateObj.getFullYear();
      const endYear = endDateObj.getFullYear();
      
      if (startYear < 2024 || startYear > 2025 || endYear < 2024 || endYear > 2025) {
        setError('Please select dates between 2024 and 2025');
        return;
      }

      // Validate date range
      if (endDateObj < startDateObj) {
        setError('End date must be after or equal to start date');
        return;
      }

      // Format dates for API
      const formattedStartDate = startDateObj.toISOString();
      const formattedEndDate = endDateObj.toISOString();
      
      console.log('Submitting leave request with formatted dates:', { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate, 
        type, 
        reason 
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          type,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Leave request failed:', errorData);
        throw new Error('Failed to submit leave request');
      }

      const data = await response.json();
      console.log('Leave request submitted successfully:', data);

      setSuccess(true);
      setStartDate('');
      setEndDate('');
      setType('');
      setReason('');
      setError('');
    } catch (err) {
      console.error('Leave request error:', err);
      setError('Failed to submit leave request');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Start date input value:', value);
                  setStartDate(value);
                  setError('');
                }}
                min="2024-01-01"
                max="2025-12-31"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('End date input value:', value);
                  setEndDate(value);
                  setError('');
                }}
                min="2024-01-01"
                max="2025-12-31"
                required
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Leave Type</label>
            <Select 
              value={type} 
              onValueChange={(value) => {
                console.log('Selected leave type:', value);
                setType(value);
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Please provide a reason for your leave request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">Leave request submitted successfully!</p>}
          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
