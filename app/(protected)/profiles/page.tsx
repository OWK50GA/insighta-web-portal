'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';
import { ProfilesTable } from '@/components/profiles-table';
import { ProfileFilters } from '@/lib/api';

const genderOptions = ['All', 'Male', 'Female'];
const ageGroupOptions = ['All', 'Child', 'Teenager', 'Adult', 'Senior'];
const sortOptions = ['name', 'age', 'gender_probability', 'country_probability'];

export default function ProfilesPage() {
  const [filters, setFilters] = useState<ProfileFilters>({
    gender: 'All',
    age_group: 'All',
    country: '',
    min_age: undefined,
    max_age: undefined,
    sort_by: 'name',
    order: 'asc',
    page: 1,
    limit: 10,
  });

  const [appliedFilters, setAppliedFilters] = useState<ProfileFilters>(filters);

  const handleFilterChange = (key: keyof ProfileFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared = {
      gender: 'All',
      age_group: 'All',
      country: '',
      min_age: undefined,
      max_age: undefined,
      sort_by: 'name',
      order: 'asc' as const,
      page: 1,
      limit: 10,
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const handleExportCSV = () => {
    // TODO: calls GET /api/profiles/export?format=csv with current filters applied
    // triggers file download
    alert('Export CSV functionality - TODO: integrate with backend');
  };

  const handlePageChange = (page: number) => {
    setAppliedFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profiles</h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse and manage all profiles in the system
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2 border-slate-300"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-6 mb-8 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gender
            </label>
            <Select
              value={filters.gender || 'All'}
              onValueChange={(value) => handleFilterChange('gender', value)}
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Age Group
            </label>
            <Select
              value={filters.age_group || 'All'}
              onValueChange={(value) => handleFilterChange('age_group', value)}
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ageGroupOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Country
            </label>
            <Input
              placeholder="e.g. NG, US"
              value={filters.country || ''}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="border-slate-300 bg-white"
            />
          </div>

          {/* Min Age */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Min Age
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.min_age || ''}
              onChange={(e) =>
                handleFilterChange('min_age', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="border-slate-300 bg-white"
            />
          </div>

          {/* Max Age */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Age
            </label>
            <Input
              type="number"
              placeholder="100"
              value={filters.max_age || ''}
              onChange={(e) =>
                handleFilterChange('max_age', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="border-slate-300 bg-white"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sort By
            </label>
            <Select
              value={filters.sort_by || 'name'}
              onValueChange={(value) => handleFilterChange('sort_by', value)}
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Order
            </label>
            <Select
              value={filters.order || 'asc'}
              onValueChange={(value) =>
                handleFilterChange('order', value as 'asc' | 'desc')
              }
            >
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleApplyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </Button>
          <button
            onClick={handleClearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Clear
          </button>
        </div>
      </Card>

      {/* Profiles Table */}
      <ProfilesTable filters={appliedFilters} onPageChange={handlePageChange} />
    </div>
  );
}
