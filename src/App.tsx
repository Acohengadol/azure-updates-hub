import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { 
  MagnifyingGlass, 
  Funnel, 
  X, 
  CalendarBlank, 
  SquaresFour,
  CheckCircle,
  Flask,
  Warning,
  Archive,
  Database,
  CloudArrowUp,
  ShieldCheck,
  Cpu,
  NetworkX,
  ChartLineUp,
  CodeBlock,
  Cube,
  GlobeHemisphereWest,
  BracketsAngle,
  Toolbox,
  CirclesThreePlus,
  Sparkle
} from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import type { AzureUpdate, DomainCategory, ViewMode, UpdateStatus } from '@/lib/types';

const DOMAIN_ICONS: Record<DomainCategory, typeof Database> = {
  'Compute': Cpu,
  'Networking': NetworkX,
  'Storage': Database,
  'Databases': Database,
  'AI + Machine Learning': Sparkle,
  'Security': ShieldCheck,
  'Developer Tools': CodeBlock,
  'Integration': CirclesThreePlus,
  'Analytics': ChartLineUp,
  'Containers': Cube,
  'Management': Toolbox,
  'Web': GlobeHemisphereWest,
  'IoT': NetworkX,
  'Mixed Reality': BracketsAngle,
};

const STATUS_CONFIG: Record<UpdateStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  GA: { color: 'bg-green-500', icon: CheckCircle, label: 'Generally Available' },
  Preview: { color: 'bg-blue-500', icon: Flask, label: 'Preview' },
  Deprecated: { color: 'bg-orange-500', icon: Warning, label: 'Deprecated' },
  Retired: { color: 'bg-red-500', icon: Archive, label: 'Retired' },
  New: { color: 'bg-accent', icon: Sparkle, label: 'New' },
};

function App() {
  const [updates] = useKV<AzureUpdate[]>('azure-updates', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory | null>(null);
  const [viewMode, setViewMode] = useKV<ViewMode>('view-mode', 'grid');
  const [showFilters, setShowFilters] = useState(true);

  const allDomains = useMemo(() => {
    const domains = new Set<DomainCategory>();
    (updates || []).forEach(update => {
      update.domain.forEach(d => domains.add(d));
    });
    return Array.from(domains).sort();
  }, [updates]);

  const filteredUpdates = useMemo(() => {
    return (updates || []).filter(update => {
      const matchesSearch = searchQuery.trim() === '' || 
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = !selectedDomain || update.domain.includes(selectedDomain);
      
      return matchesSearch && matchesDomain;
    });
  }, [updates, searchQuery, selectedDomain]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, AzureUpdate[]> = {};
    filteredUpdates.forEach(update => {
      const date = new Date(update.date);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(update);
    });
    return groups;
  }, [filteredUpdates]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDomain(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedDomain !== null;

  return (
    <div className="min-h-screen mesh-background grid-pattern">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CloudArrowUp weight="bold" className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Azure Updates
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    Stay informed about the latest Azure services and features
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <SquaresFour weight="bold" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className="gap-2"
                >
                  <CalendarBlank weight="bold" />
                  Timeline
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  size={20} 
                  weight="bold"
                />
                <Input
                  type="text"
                  placeholder="Search updates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-11 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={18} weight="bold" />
                  </button>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 h-11"
              >
                <Funnel weight="bold" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-1 px-1.5 min-w-5 h-5 flex items-center justify-center">
                    {(searchQuery ? 1 : 0) + (selectedDomain ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="p-6 mb-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Funnel weight="bold" className="text-primary" />
                    Filter by Domain
                  </h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <X weight="bold" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {allDomains.map((domain) => {
                    const Icon = DOMAIN_ICONS[domain];
                    const isActive = selectedDomain === domain;
                    return (
                      <Button
                        key={domain}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDomain(isActive ? null : domain)}
                        className="gap-2"
                      >
                        <Icon weight="bold" size={16} />
                        {domain}
                      </Button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground font-semibold">{filteredUpdates.length}</span> update{filteredUpdates.length !== 1 ? 's' : ''}
            {selectedDomain && <span> in <span className="text-primary font-semibold">{selectedDomain}</span></span>}
          </p>
          
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <SquaresFour weight="bold" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              <CalendarBlank weight="bold" />
            </Button>
          </div>
        </div>

        {filteredUpdates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <MagnifyingGlass size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No updates found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters or search query'
                    : 'No updates available at the moment'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} variant="outline" className="gap-2">
                    <X weight="bold" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredUpdates.map((update, index) => (
                <UpdateCard key={update.id} update={update} index={index} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByMonth).map(([month, monthUpdates]) => (
              <div key={month}>
                <div className="sticky top-28 z-10 backdrop-blur-sm bg-background/80 py-2 mb-4">
                  <div className="flex items-center gap-3">
                    <CalendarBlank weight="bold" className="text-primary" size={20} />
                    <h2 className="text-2xl font-bold tracking-tight">{month}</h2>
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {monthUpdates.length} update{monthUpdates.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {monthUpdates.map((update, index) => (
                      <UpdateCard key={update.id} update={update} index={index} timeline />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Azure Updates Hub • Last updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </footer>
    </div>
  );
}

function UpdateCard({ update, index, timeline = false }: { update: AzureUpdate; index: number; timeline?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[update.status];
  const StatusIcon = statusConfig.icon;
  
  const truncatedDescription = update.description.length > 180 
    ? update.description.substring(0, 180) + '...'
    : update.description;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card 
        className={`group p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 hover:-translate-y-1 border-2 hover:border-primary/30 cursor-pointer ${
          timeline ? '' : 'h-full'
        } flex flex-col`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusConfig.color} ${update.status === 'New' ? 'animate-pulse' : ''}`} />
            <Badge variant="secondary" className="gap-1.5 font-medium">
              <StatusIcon weight="bold" size={14} />
              {statusConfig.label}
            </Badge>
          </div>
          <span className="text-xs font-mono text-muted-foreground font-medium">
            {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {update.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
          {expanded ? update.description : truncatedDescription}
          {!expanded && update.description.length > 180 && (
            <span className="text-primary font-medium ml-1">Read more</span>
          )}
        </p>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
          {update.domain.map((domain) => {
            const Icon = DOMAIN_ICONS[domain];
            return (
              <Badge key={domain} variant="outline" className="gap-1.5">
                <Icon weight="bold" size={12} />
                {domain}
              </Badge>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

export default App;
