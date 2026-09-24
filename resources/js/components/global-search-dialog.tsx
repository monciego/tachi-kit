import * as React from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

type SearchItem = NavItem;

interface SearchDialogProps {
    items: SearchItem[];
    onSelect?: (item: SearchItem) => void;
    placeholder?: string;
}

export function GlobalSearchDialog({
    items,
    onSelect,
    placeholder = 'Search...',
}: SearchDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const filteredItems = React.useMemo(() => {
        if (!search) return items;
        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.category?.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, items]);

    // Handle keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredItems.length - 1 ? prev + 1 : 0,
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredItems.length - 1,
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    handleSelect(filteredItems[selectedIndex]);
                }
                break;
            case 'Escape':
                setOpen(false);
                break;
        }
    };

    const handleSelect = (item: SearchItem) => {
        onSelect?.(item);
        if (item.href) {
            router.visit(toUrl(item.href));
        }
        setOpen(false);
        setSearch('');
        setSelectedIndex(0);
    };

    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    'text-muted-foreground relative w-full justify-start text-sm sm:pr-12 md:w-64',
                    'hidden sm:flex',
                )}
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">{placeholder}</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="border-border bg-muted pointer-events-none absolute right-1.5 hidden h-6 items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100 select-none sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden bg-[#f1f1f1] p-0 shadow-lg dark:bg-[#0d0f0f] [&>button]:hidden">
                    <DialogTitle className="hidden"></DialogTitle>
                    <div className="bg-background border-border m-2 flex flex-col rounded-lg">
                        <div className="border-border flex items-center border-b px-4 py-3">
                            <Search className="text-muted-foreground mr-3 h-4 w-4" />
                            <Input
                                placeholder={placeholder}
                                className="placeholder:text-muted-foreground border-0 bg-transparent outline-none focus-visible:ring-0"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-12">
                                <Search className="text-muted-foreground mb-4 h-8 w-8 opacity-50" />
                                <p className="text-muted-foreground text-center text-sm">
                                    No results found for &apos;{search}&apos;
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-75 overflow-y-auto py-2">
                                {/* Group by category if available */}
                                {Object.entries(
                                    filteredItems.reduce(
                                        (acc, item) => {
                                            const category =
                                                item.category || 'Other';
                                            if (!acc[category])
                                                acc[category] = [];
                                            acc[category].push(item);
                                            return acc;
                                        },
                                        {} as Record<string, SearchItem[]>,
                                    ),
                                ).map(([category, categoryItems]) => (
                                    <div key={category}>
                                        {category !== 'Other' && (
                                            <div className="text-muted-foreground px-4 py-2 text-xs font-medium">
                                                {category}
                                            </div>
                                        )}
                                        {categoryItems.map((item) => {
                                            const globalIndex =
                                                filteredItems.findIndex(
                                                    (i) => i.id === item.id,
                                                );
                                            return (
                                                <button
                                                    key={item.id}
                                                    className={cn(
                                                        'hover:bg-accent mx-1 block w-[calc(100%-0.5rem)] rounded-md px-4 py-2.5 text-left transition-colors',
                                                        selectedIndex ===
                                                            globalIndex &&
                                                            'bg-accent',
                                                    )}
                                                    onClick={() =>
                                                        handleSelect(item)
                                                    }
                                                    onMouseEnter={() =>
                                                        setSelectedIndex(
                                                            globalIndex,
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {item.icon && (
                                                            <div className="shrink-0">
                                                                <item.icon className="text-muted-foreground h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <div className="text-sm font-medium">
                                                            {item.title}
                                                        </div>
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-muted-foreground text-xs">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-xs">
                            <div className="flex items-center gap-2">
                                <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono">
                                    ↑↓
                                </kbd>
                                <span>Navigate</span>
                                <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono">
                                    ↵
                                </kbd>
                                <span>Select</span>
                                <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono">
                                    esc
                                </kbd>
                                <span>Close</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
