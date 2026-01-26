'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilters, setSortBy, setSortOrder } from '@/store/slices/transactionUi-Slice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Filter, ArrowUpDown } from 'lucide-react';



export function TransactionFilters() {
  const dispatch = useAppDispatch();
  const { filters, sortBy, sortOrder } = useAppSelector(state => state.transactionsUi);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) =>
                  dispatch(setFilters({
                    ...filters,
                    type: value as any || undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) =>
                  dispatch(setFilters({
                    ...filters,
                    status: value as any || undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  dispatch(setFilters({
                    ...filters,
                    dateFrom: e.target.value || undefined,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  dispatch(setFilters({
                    ...filters,
                    dateTo: e.target.value || undefined,
                  }))
                }
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => dispatch(setFilters({}))}
            >
              Clear Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))
        }
        className="gap-2"
      >
        <ArrowUpDown className="h-4 w-4" />
        {sortOrder === 'asc' ? 'Asc' : 'Desc'}
      </Button>

      <Select value={sortBy} onValueChange={(value) => dispatch(setSortBy(value as any))}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Sort by Date</SelectItem>
          <SelectItem value="amount">Sort by Amount</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
