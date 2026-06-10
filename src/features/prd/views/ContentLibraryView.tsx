'use client';

import { useMemo, useState } from 'react';
import { Archive, ChevronRight, Filter, Library, PenLine, Search } from 'lucide-react';
import { LibraryRow } from '@/features/prd/components/LibraryRow';
import { contentCategories, libraryItems } from '@/features/prd/config/content-library';

export function ContentLibraryView({ onNoopAction }: { onNoopAction: (message: string) => void }) {
  const [libraryQuery, setLibraryQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLibraryFilter, setActiveLibraryFilter] = useState<'All' | 'Needs update' | 'High reuse'>('All');
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<(typeof libraryItems)[number]>(libraryItems[0]);
  const [libraryAction, setLibraryAction] = useState('Edit text');
  const filteredLibraryItems = libraryItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesFilter =
      activeLibraryFilter === 'All' ||
      (activeLibraryFilter === 'Needs update' && item.status === 'Needs update') ||
      (activeLibraryFilter === 'High reuse' && item.reuse === 'High');
    const query = libraryQuery.trim().toLowerCase();
    const matchesQuery = !query || [item.id, item.title, item.category, item.language, item.status].some((value) => value.toLowerCase().includes(query));

    return matchesCategory && matchesFilter && matchesQuery;
  });
  const selectLibraryAction = (item: (typeof libraryItems)[number], action: string) => {
    setSelectedLibraryItem(item);
    setLibraryAction(action);
    onNoopAction(`${action}: ${item.id}`);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_1fr_320px]">
      <aside className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <h2 className="text-sm font-semibold text-[#171717]">Categories</h2>
        <div className="mt-3 space-y-1">
          {contentCategories.map((category) => {
            const active = category.name === activeCategory;

            return (
            <button
              key={category.name}
              aria-pressed={active}
              onClick={() => setActiveCategory(category.name)}
              className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm ${
                active ? 'border border-[#cfcfc8] bg-[#f6f6f2] font-semibold text-[#171717]' : 'text-[#5f5f58] hover:bg-[#f6f6f2]'
              }`}
              type="button"
            >
              <span>{category.name}</span>
              <span className="text-xs text-[#8a8a82]">{category.count}</span>
            </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
          <div className="text-xs font-semibold text-[#171717]">Recycle signal</div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e68]">3 older posts should be refreshed because laws or deadlines changed.</p>
        </div>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e4] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Content assets</h2>
            <p className="mt-0.5 text-xs text-[#6e6e68]">Search old posts, reuse assets, or update legal/accounting content.</p>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#deded8] bg-[#f6f6f2] px-3 text-sm text-[#6e6e68] sm:w-72 sm:flex-none">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search content library</span>
              <input
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#8a8a82]"
                placeholder="Search title, law, category..."
              />
            </label>
            {(['All', 'Needs update', 'High reuse'] as const).map((filter) => (
              <button
                key={filter}
                aria-pressed={activeLibraryFilter === filter}
                onClick={() => setActiveLibraryFilter(filter)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                  activeLibraryFilter === filter ? 'border-[#cfcfc8] bg-[#f6f6f2] text-[#171717]' : 'border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]'
                }`}
                type="button"
              >
                {filter === 'All' ? <Filter className="h-3.5 w-3.5" /> : null}
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#e8e8e4]">
          {filteredLibraryItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6e6e68]">No content matches the current search and filters.</div>
          ) : null}
          {filteredLibraryItems.map((item) => (
            <LibraryRow
              key={item.id}
              item={item}
              onEdit={(selected) => selectLibraryAction(selected, 'Edit text')}
              onRecycle={(selected) => selectLibraryAction(selected, 'Recycle as new post')}
              onSelect={setSelectedLibraryItem}
              selected={selectedLibraryItem.id === item.id}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#deded8] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,20,0.04)]">
          <h2 className="text-sm font-semibold text-[#171717]">Asset preview</h2>
          <p className="mt-1 text-xs text-[#6e6e68]">{selectedLibraryItem.title}</p>
          <div className="mt-3 rounded-xl border border-[#deded8] bg-[#fbfbfa] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{selectedLibraryItem.category}</span>
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">{selectedLibraryItem.language}</span>
              <span className="rounded-full border border-[#deded8] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4f4f49]">Reuse {selectedLibraryItem.reuse}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#6e6e68]">Selected action: {libraryAction}. This panel is ready to become an edit/recycle drawer when backend records are connected.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {['Cover', 'Carousel 1', 'Carousel 2', 'Infographic', 'Source PDF', 'Caption'].slice(0, Math.min(selectedLibraryItem.assets, 6)).map((asset, index) => (
              <button
                key={asset}
                onClick={() => onNoopAction(`Open content asset: ${asset}`)}
                className={`aspect-[4/3] rounded-xl border p-2 text-left text-[11px] font-semibold ${
                  index < 4 ? 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]' : 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]'
                }`}
                type="button"
              >
                <div className="flex h-full items-end rounded-lg bg-gradient-to-br from-white to-[#e8e8e4] p-2">{asset}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#deded8] bg-[#fbfbfa] p-4">
          <h2 className="text-sm font-semibold text-[#171717]">Available actions</h2>
          <div className="mt-3 space-y-2">
            {['Edit text', 'Replace image', 'Recycle as new post', 'Update legal reference'].map((action, index) => (
              <button
                key={action}
                onClick={() => {
                  setLibraryAction(action);
                  onNoopAction(`Action: ${action} for ${selectedLibraryItem.id}`);
                }}
                className={`flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold ${
                  index === 0 ? 'border-[#cfcfc8] bg-white text-[#171717]' : 'border-[#deded8] bg-white text-[#4f4f49] hover:bg-[#f6f6f2]'
                }`}
                type="button"
              >
                {action}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
