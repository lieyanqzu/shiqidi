'use client';

import { useEffect, useState } from "react";
import { ColorFilters } from "@/components/color/color-filters";
import { ColorGroups } from "@/components/color/color-groups";
import { SetSymbol } from "@/components/logo/set-symbol";
import { fetchColorRatings, type ColorRatingParams } from "@/lib/api";
import { buildColorGroups, type ColorGroup } from "@/lib/colors";
import { getStartDateForExpansion, loadExpansionMetadata } from "@/lib/filter";
import { loadPublicOptions, type PublicOptionsData } from "@/lib/options";
import { BackToTop } from "@/components/common/back-to-top";

// 获取今天日期 YYYY-MM-DD
function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ColorsPage() {
  const [params, setParams] = useState<ColorRatingParams>({
    expansion: '',
    event_type: '',
    start_date: '2016-01-01',
    end_date: today(),
    user_group: '',
    combine_splash: true,
  });
  const [separateSplash, setSeparateSplash] = useState(false);
  const [groups, setGroups] = useState<ColorGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<PublicOptionsData | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const titleExpansion = params.expansion || options?.cardDataDefaults?.expansion || '';

  // 加载共享筛选配置
  useEffect(() => {
    let cancelled = false;

    loadPublicOptions()
      .then((data) => {
        if (cancelled) return;
        setOptions(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('加载筛选配置失败:', error);
        setOptionsError('筛选配置加载失败，请稍后重试');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 从共享配置应用默认筛选条件
  useEffect(() => {
    if (!options || defaultsApplied) return;

    let cancelled = false;

    async function applyDefaults() {
      const defaults = options?.cardDataDefaults;
      if (!defaults) {
        setDefaultsApplied(true);
        return;
      }

      const expansion = defaults.expansion ?? params.expansion;
      let startDate = params.start_date;

      try {
        await loadExpansionMetadata();
        startDate = getStartDateForExpansion(expansion)?.split('T')[0] ?? startDate;
      } catch (error) {
        console.error('加载系列起始日期失败:', error);
      }

      if (cancelled) return;

      setParams((prev) => ({
        ...prev,
        expansion,
        event_type: defaults.event_type ?? prev.event_type,
        start_date: startDate,
      }));
      setDefaultsApplied(true);
    }

    applyDefaults();

    return () => {
      cancelled = true;
    };
  }, [defaultsApplied, options, params.expansion, params.start_date]);

  // 加载色组数据
  useEffect(() => {
    if (!options || !defaultsApplied) return;
    if (!params.expansion || !params.event_type) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchColorRatings({
          ...params,
          combine_splash: !separateSplash,
        }, signal);
        if (signal.aborted) return;
        setGroups(buildColorGroups(data));
        setIsLoading(false);
      } catch (err) {
        if (signal.aborted) return;
        setError((err as Error).message || '色组数据加载失败');
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [defaultsApplied, options, params, separateSplash]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-3 mb-8">
          {titleExpansion ? <SetSymbol set={titleExpansion} /> : null}
          <h1 className="text-2xl font-semibold">
            {titleExpansion ? `${titleExpansion} ` : ''}色组数据
          </h1>
          <a
            href="https://www.17lands.com/color_ratings?utm_source=shiqidi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[--accent]/10 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--accent]/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
            17Lands
          </a>
        </div>
        {options ? (
          <ColorFilters
            params={params}
            onParamsChange={(partial) => setParams((prev) => ({ ...prev, ...partial }))}
            separateSplash={separateSplash}
            onSeparateSplashChange={setSeparateSplash}
            options={options}
          />
        ) : (
          <div className="rounded-lg border border-[--border] bg-[--component-background] p-4 text-sm text-[--muted-foreground]">
            {optionsError ?? '正在加载筛选配置...'}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        <ColorGroups
          groups={groups}
          isLoading={isLoading}
          error={error}
          expansion={params.expansion}
        />
      </div>
      <BackToTop />
    </div>
  );
}
