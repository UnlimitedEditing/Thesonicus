import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, BookOpen, Music, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import termsData from './data/terms.json';

interface Term {
  name: string;
  definition: string;
}

interface Subcategory {
  name: string;
  terms: Term[];
}

interface Category {
  label: string;
  color: string;
  subs: Subcategory[];
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = termsData;

  // Calculate total stats
  const totalStats = useMemo(() => {
    let totalTerms = 0;
    let totalCategories = categories.length;
    let totalSubcategories = 0;
    categories.forEach(cat => {
      cat.subs.forEach(sub => {
        totalTerms += sub.terms.length;
        totalSubcategories++;
      });
    });
    return { totalTerms, totalCategories, totalSubcategories };
  }, [categories]);

  // Filter terms based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      subs: cat.subs.map(sub => ({
        ...sub,
        terms: sub.terms.filter(term => 
          term.name.toLowerCase().includes(query) || 
          term.definition.toLowerCase().includes(query)
        )
      })).filter(sub => sub.terms.length > 0)
    })).filter(cat => cat.subs.length > 0);
  }, [categories, searchQuery]);

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allCategories = new Set(filteredData.map(c => c.label));
      setExpandedCategories(allCategories);
    }
  }, [searchQuery, filteredData]);

  const toggleCategory = (label: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categories.map(c => c.label)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setSearchQuery('');
  };

  // Count matched terms
  const matchedStats = useMemo(() => {
    let matchedTerms = 0;
    let matchedCategories = filteredData.length;
    filteredData.forEach(cat => {
      cat.subs.forEach(sub => {
        matchedTerms += sub.terms.length;
      });
    });
    return { matchedTerms, matchedCategories };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Musical Terminology Index
                </h1>
                <p className="text-xs text-slate-400">
                  {totalStats.totalTerms} terms • {totalStats.totalCategories} categories • {totalStats.totalSubcategories} subcategories
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search terms, definitions, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-slate-900/50 border-slate-700 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats Bar */}
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                {matchedStats.matchedTerms} terms matched
              </Badge>
              <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20">
                {matchedStats.matchedCategories} categories
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300">No terms found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.map((category) => (
              <Card 
                key={category.label} 
                className="bg-slate-900/50 border-slate-800 overflow-hidden hover:border-slate-700 transition-colors"
              >
                <CardHeader 
                  className="p-4 cursor-pointer select-none"
                  onClick={() => toggleCategory(category.label)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-sm font-semibold text-slate-200 flex-1">
                      {category.label}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {category.subs.reduce((acc, sub) => acc + sub.terms.length, 0)}
                      </span>
                      <ChevronRight 
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          expandedCategories.has(category.label) ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                {expandedCategories.has(category.label) && (
                  <CardContent className="px-4 pb-4 pt-0">
                    <ScrollArea className="h-auto max-h-[400px]">
                      <div className="space-y-4">
                        {category.subs.map((sub) => (
                          <div key={sub.name}>
                            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                              {sub.name}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {sub.terms.map((term) => {
                                const isHighlighted = searchQuery && 
                                  (term.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   term.definition.toLowerCase().includes(searchQuery.toLowerCase()));
                                return (
                                  <button
                                    key={term.name}
                                    onClick={() => {
                                      setSelectedTerm(term);
                                      setSelectedCategory(category.label);
                                    }}
                                    className={`px-2.5 py-1 text-xs rounded-full border transition-all duration-150 text-left ${
                                      isHighlighted
                                        ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                                    }`}
                                  >
                                    {term.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Term Detail Dialog */}
      <Dialog open={!!selectedTerm} onOpenChange={() => setSelectedTerm(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedCategory && (
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: categories.find(c => c.label === selectedCategory)?.color 
                  }}
                />
              )}
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {selectedCategory}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              {selectedTerm?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-300 leading-relaxed pt-2">
              {selectedTerm?.definition}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Use this term in your prompts to describe specific musical characteristics.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            Musical Terminology Index • {totalStats.totalTerms} terms for music production and composition
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Designed for prompting AI music generators
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
