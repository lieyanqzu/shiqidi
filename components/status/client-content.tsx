'use client';

import { Activity, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useStatusStore } from '@/lib/store';
import { ComponentGroup, StatusIcon, StatusText } from "@/components/status";
import statusText from '@/data/status-text.json';

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ClientStatusContent() {
  const { data, isLoading, error, fetchStatus } = useStatusStore();

  useEffect(() => {
    fetchStatus(true); // 强制刷新
  }, [fetchStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="w-6 h-6 animate-spin text-[--muted-foreground]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <XCircle className="w-6 h-6 mr-2" />
        <span>{error || '加载失败'}</span>
      </div>
    );
  }

  // 获取平台组和其他主要组件
  const platformGroup = data.components.find(c => c.name === 'Platform');
  const mainComponents = data.components.filter(c => !c.group_id && c.name !== 'Platform');
  const hasScheduledMaintenance = data.scheduled_maintenances.length > 0;

  // 翻译组件名称和描述
  const translateComponent = (component: typeof data.components[0]) => {
    return {
      ...component,
      name: statusText.componentNames[component.name as keyof typeof statusText.componentNames] || component.name,
      description: statusText.componentDescriptions[component.name as keyof typeof statusText.componentDescriptions] || component.description
    };
  };

  // 翻译组件映射表
  const componentsMap = data.components.reduce((acc, component) => {
    acc[component.id] = translateComponent(component);
    return acc;
  }, {} as { [key: string]: typeof data.components[0] });

  const translatedPlatformGroup = platformGroup ? translateComponent(platformGroup) : null;
  const translatedMainComponents = mainComponents.map(translateComponent);

  return (
    <>
      {/* 总体状态 */}
      <div className="bg-[--card] rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 text-lg font-medium mb-2">
          <StatusIcon status={data.status.indicator === 'none' ? 'operational' : 'major_outage'} />
          <span>
            {data.status.indicator === 'none' ? '所有服务正常运行' : '部分服务出现问题'}
          </span>
        </div>
        {data.status.indicator !== 'none' && (
          <p className="text-[--muted-foreground]">
            {data.status.description}
          </p>
        )}
      </div>

      {/* 计划维护 */}
      {hasScheduledMaintenance && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">计划维护</h2>
          <div className="space-y-4">
            {data.scheduled_maintenances.map(maintenance => (
              <div key={maintenance.id} className="bg-[--card] rounded-lg p-6 border border-[--border]">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{maintenance.name}</span>
                </div>
                <div className="space-y-2 text-sm text-[--muted-foreground] mb-4">
                  <div>开始时间：{formatDateTime(maintenance.scheduled_for)}</div>
                  <div>结束时间：{formatDateTime(maintenance.scheduled_until)}</div>
                </div>
                {maintenance.incident_updates.map((update, index) => (
                  <div key={index} className="text-sm mt-2 whitespace-pre-wrap">
                    {update.body}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 组件状态 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">服务状态</h2>
        <div className="divide-y divide-[--border] border border-[--border] rounded-lg overflow-hidden">
          {/* 平台状态 */}
          {translatedPlatformGroup && (
            <ComponentGroup 
              group={translatedPlatformGroup} 
              components={componentsMap}
            />
          )}
          
          {/* 其他服务状态 */}
          {translatedMainComponents.map(component => (
            <div key={component.id} className="bg-[--card] flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <StatusIcon status={component.status} />
                <div>
                  <div className="font-medium">{component.name}</div>
                  {component.description && (
                    <div className="text-sm text-[--muted-foreground]">{component.description}</div>
                  )}
                </div>
              </div>
              <div className="text-sm">
                <StatusText status={component.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 