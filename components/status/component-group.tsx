'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusIcon, StatusText } from "@/components/status";

interface ComponentGroupProps {
  group: {
    id: string;
    name: string;
    status: string;
    components?: string[];
  };
  components: { [key: string]: { id: string; name: string; status: string; description: string | null } };
}

export function ComponentGroup({ group, components }: ComponentGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 如果没有子组件，不显示组
  if (!group.components || group.components.length === 0) return null;

  return (
    <div>
      <button 
        className="w-full flex items-center justify-between p-4 bg-[--card] hover:bg-[--accent] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <StatusIcon status={group.status} />
          <div>
            <div className="font-medium text-left">{group.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusText status={group.status} />
          <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isExpanded && (
        <div className="divide-y divide-[--border] bg-[--card]">
          {group.components.map(componentId => {
            const component = components[componentId];
            if (!component) return null;
            return (
              <div key={component.id} className="flex items-center justify-between p-4 pl-12 hover:bg-[--accent] transition-colors">
                <div className="flex items-center gap-3">
                  <StatusIcon status={component.status} />
                  <div>
                    <div className="font-medium">{component.name}</div>
                  </div>
                </div>
                <div className="text-sm">
                  <StatusText status={component.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 