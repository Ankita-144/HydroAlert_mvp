import React from 'react';
import { WaterTest } from '@/types/water';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RecentTestsTableProps {
  tests: WaterTest[];
}

export function RecentTestsTable({ tests }: RecentTestsTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold font-display text-lg">Recent Tests</h3>
        <p className="text-sm text-muted-foreground">Latest water quality test results</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">pH</TableHead>
              <TableHead className="font-semibold">Chlorine</TableHead>
              <TableHead className="font-semibold">Tested By</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{test.sourceName}</TableCell>
                <TableCell>
                  <StatusBadge status={test.status} size="sm" />
                </TableCell>
                <TableCell>{test.phLevel?.toFixed(1) ?? '-'}</TableCell>
                <TableCell>{test.chlorine?.toFixed(1) ?? '-'} ppm</TableCell>
                <TableCell className="text-muted-foreground">{test.testedBy}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(test.testDate, 'MMM d, h:mm a')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
