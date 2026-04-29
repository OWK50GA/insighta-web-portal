'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { searchProfiles } from '@/lib/api';
import { SearchResultsTable } from '@/components/search-results-table';

const exampleQueries = [
  'young males from Nigeria',
  'female adults',
  'seniors from the US',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      // TODO: calls GET /api/profiles/search?q=<query>
      // include header: X-API-Version: 1
      const data = await searchProfiles(q);
      setResults(data);
      setSearchQuery(q);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchClick = () => {
    handleSearch(query);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    handleSearch(example);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Natural Language Search
        </h1>
        <p className="text-slate-600">Search profiles using plain English</p>
      </div>

      {/* Search Input */}
      <Card className="p-6 mb-8 border border-slate-200">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder="e.g. young males from Nigeria, adults over 30, female seniors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-white border-slate-300 h-11"
            />
          </div>
          <Button
            onClick={handleSearchClick}
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Search
          </Button>
        </div>

        {/* Example Queries */}
        {!hasSearched && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-3">Try these queries:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-slate-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {hasSearched && (
        <div>
          {results && results.data.length === 0 ? (
            <Card className="p-12 text-center border border-slate-200">
              <p className="text-slate-600">
                No results found for <span className="font-semibold">"{searchQuery}"</span>
              </p>
              <Button
                onClick={() => {
                  setQuery('');
                  setResults(null);
                  setHasSearched(false);
                }}
                variant="link"
                className="mt-4"
              >
                Try another search
              </Button>
            </Card>
          ) : (
            <SearchResultsTable
              results={results}
              query={searchQuery}
              loading={loading}
            />
          )}
        </div>
      )}
    </div>
  );
}
