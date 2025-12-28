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
  Sparkle,
  Rocket,
  TrendUp,
  CaretDown
} from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STATUS_CONFIG: Record<UpdateStatus, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
  GA: { color: 'bg-emerald-500', bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Generally Available' },
  Preview: { color: 'bg-blue-500', bgColor: 'bg-blue-50 text-blue-700 border-blue-200', icon: Flask, label: 'Preview' },
  Deprecated: { color: 'bg-amber-500', bgColor: 'bg-amber-50 text-amber-700 border-amber-200', icon: Warning, label: 'Deprecated' },
  Retired: { color: 'bg-rose-500', bgColor: 'bg-rose-50 text-rose-700 border-rose-200', icon: Archive, label: 'Retired' },
  New: { color: 'bg-purple-500', bgColor: 'bg-purple-50 text-purple-700 border-purple-200', icon: Sparkle, label: 'New' },
};

function getWeekRange(date: Date): { start: Date; end: Date; label: string } {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return { start, end, label: `${startStr} - ${endStr}` };
}

function App() {
  const [updates] = useKV<AzureUpdate[]>('azure-updates', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [viewMode, setViewMode] = useKV<ViewMode>('view-mode', 'grid');
  const [showFilters, setShowFilters] = useState(true);

  const allDomains = useMemo(() => {
    const domains = new Set<DomainCategory>();
    (updates || []).forEach(update => {
      update.domain.forEach(d => domains.add(d));
    });
    return Array.from(domains).sort();
  }, [updates]);

  const availableWeeks = useMemo(() => {
    const weeks = new Map<string, { start: Date; end: Date; label: string }>();
    
    (updates || []).forEach(update => {
      const date = new Date(update.date);
      const week = getWeekRange(date);
      const weekKey = week.start.toISOString();
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, week);
      }
    });
    
    return Array.from(weeks.entries())
      .sort((a, b) => b[1].start.getTime() - a[1].start.getTime())
      .map(([key, week]) => ({ key, ...week }));
  }, [updates]);

  const filteredUpdates = useMemo(() => {
    return (updates || []).filter(update => {
      const matchesSearch = searchQuery.trim() === '' || 
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = !selectedDomain || update.domain.includes(selectedDomain);
      
      let matchesWeek = true;
      if (selectedWeek !== 'all') {
        const updateDate = new Date(update.date);
        const selectedWeekData = availableWeeks.find(w => w.key === selectedWeek);
        if (selectedWeekData) {
          matchesWeek = updateDate >= selectedWeekData.start && updateDate <= selectedWeekData.end;
        }
      }
      
      return matchesSearch && matchesDomain && matchesWeek;
    });
  }, [updates, searchQuery, selectedDomain, selectedWeek, availableWeeks]);

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
    setSelectedWeek('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedDomain !== null || selectedWeek !== 'all';

  const statistics = useMemo(() => {
    const total = (updates || []).length;
    const launched = (updates || []).filter(u => u.status === 'GA').length;
    const preview = (updates || []).filter(u => u.status === 'Preview').length;
    const inDevelopment = (updates || []).filter(u => u.status === 'New').length;
    
    return { total, launched, preview, inDevelopment };
  }, [updates]);

  return (
    <div className="min-h-screen mesh-background grid-pattern">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <CloudArrowUp weight="bold" className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
                    {(searchQuery ? 1 : 0) + (selectedDomain ? 1 : 0) + (selectedWeek !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <Card className="p-6 border-2 bg-gradient-to-br from-white to-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <TrendUp weight="bold" className="text-white" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Updates</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {statistics.total}
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6 border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle weight="bold" className="text-white" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-700 uppercase tracking-wide">Launched</p>
                <p className="text-4xl font-bold text-emerald-600">
                  {statistics.launched}
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Flask weight="bold" className="text-white" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">In Preview</p>
                <p className="text-4xl font-bold text-blue-600">
                  {statistics.preview}
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Rocket weight="bold" className="text-white" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">In Development</p>
                <p className="text-4xl font-bold text-purple-600">
                  {statistics.inDevelopment}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="p-6 mb-6 border-2 bg-gradient-to-br from-white to-secondary/10 shadow-lg shadow-secondary/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Funnel weight="bold" className="text-primary" />
                    Filters
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
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarBlank weight="bold" className="text-secondary" size={18} />
                      <h4 className="text-sm font-semibold text-foreground">Filter by Week</h4>
                    </div>
                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                      <SelectTrigger className="w-full h-11 bg-white border-2">
                        <SelectValue placeholder="All weeks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All weeks</SelectItem>
                        {availableWeeks.map((week) => (
                          <SelectItem key={week.key} value={week.key}>
                            {week.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <SquaresFour weight="bold" className="text-accent" size={18} />
                      <h4 className="text-sm font-semibold text-foreground">Filter by Domain</h4>
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
                            className={`gap-2 transition-all ${isActive ? 'shadow-lg shadow-primary/30' : 'hover:border-primary/50'}`}
                          >
                            <Icon weight="bold" size={16} />
                            {domain}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground font-medium">
            <p>
              Showing <span className="text-foreground font-semibold">{filteredUpdates.length}</span> update{filteredUpdates.length !== 1 ? 's' : ''}
              {selectedDomain && <span> in <span className="text-primary font-semibold">{selectedDomain}</span></span>}
              {selectedWeek !== 'all' && (
                <span> for <span className="text-secondary font-semibold">
                  {availableWeeks.find(w => w.key === selectedWeek)?.label}
                </span></span>
              )}
            </p>
          </div>
          
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
                <div className="sticky top-28 z-10 backdrop-blur-sm bg-gradient-to-r from-background/90 via-primary/10 to-background/90 py-2 mb-4 rounded-lg px-3">
                  <div className="flex items-center gap-3">
                    <CalendarBlank weight="bold" className="text-primary" size={20} />
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{month}</h2>
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
        className={`group p-6 hover:shadow-xl hover:shadow-primary/20 transition-all duration-200 hover:-translate-y-1 border-2 hover:border-primary/50 cursor-pointer bg-gradient-to-br from-white to-primary/5 ${
          timeline ? '' : 'h-full'
        } flex flex-col`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusConfig.color} shadow-lg ${statusConfig.color.replace('bg-', 'shadow-')}/50 ${update.status === 'New' ? 'animate-pulse' : ''}`} />
            <Badge className={`gap-1.5 font-medium border ${statusConfig.bgColor}`}>
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
          {update.domain.map((domain, idx) => {
            const Icon = DOMAIN_ICONS[domain];
            const colors = [
              'bg-violet-50 text-violet-700 border-violet-200',
              'bg-cyan-50 text-cyan-700 border-cyan-200',
              'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
              'bg-indigo-50 text-indigo-700 border-indigo-200',
              'bg-teal-50 text-teal-700 border-teal-200',
            ];
            return (
              <Badge key={domain} className={`gap-1.5 border ${colors[idx % colors.length]}`}>
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
