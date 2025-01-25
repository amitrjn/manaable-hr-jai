import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

interface LeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export function LeaveRequestList() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leave`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leave requests');
        }

        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError('Failed to fetch leave requests');
      }
    };

    fetchRequests();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user?.role === 'manager' ? 'All Leave Requests' : 'My Leave Requests'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.user.firstName} {request.user.lastName}
                  </TableCell>
                  <TableCell className="capitalize">{request.type}</TableCell>
                  <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
