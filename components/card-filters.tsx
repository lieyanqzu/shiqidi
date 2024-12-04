'use client';

import { Select } from "@/components/ui/select";
import { DatePicker } from "antd";
import type { CardDataParams } from "@/lib/api";
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

// 系列选项
const sets = [
  { label: "FDN", value: "FDN" },
  { label: "DSK", value: "DSK" },
  { label: "Y25DSK", value: "Y25DSK" },
  { label: "BLB", value: "BLB" },
  { label: "Y25BLB", value: "Y25BLB" },
  { label: "MH3", value: "MH3" },
  { label: "OTJ", value: "OTJ" },
  { label: "Y24OTJ", value: "Y24OTJ" },
  { label: "MKM", value: "MKM" },
  { label: "Y24MKM", value: "Y24MKM" },
  { label: "LCI", value: "LCI" },
  { label: "Y24LCI", value: "Y24LCI" },
  { label: "WOE", value: "WOE" },
  { label: "Y24WOE", value: "Y24WOE" },
  { label: "LTR", value: "LTR" },
  { label: "MOM", value: "MOM" },
  { label: "MAT", value: "MAT" },
  { label: "SIR", value: "SIR" },
  { label: "ONE", value: "ONE" },
  { label: "Y23ONE", value: "Y23ONE" },
  { label: "BRO", value: "BRO" },
  { label: "Y23BRO", value: "Y23BRO" },
  { label: "DMU", value: "DMU" },
  { label: "Y23DMU", value: "Y23DMU" },
  { label: "HBG", value: "HBG" },
  { label: "SNC", value: "SNC" },
  { label: "Y22SNC", value: "Y22SNC" },
  { label: "NEO", value: "NEO" },
  { label: "DBL", value: "DBL" },
  { label: "VOW", value: "VOW" },
  { label: "RAVM", value: "RAVM" },
  { label: "MID", value: "MID" },
  { label: "AFR", value: "AFR" },
  { label: "STX", value: "STX" },
  { label: "CORE", value: "CORE" },
  { label: "KHM", value: "KHM" },
  { label: "KLR", value: "KLR" },
  { label: "ZNR", value: "ZNR" },
  { label: "AKR", value: "AKR" },
  { label: "M21", value: "M21" },
  { label: "IKO", value: "IKO" },
  { label: "THB", value: "THB" },
  { label: "ELD", value: "ELD" },
  { label: "Ravnica", value: "Ravnica" },
  { label: "M20", value: "M20" },
  { label: "WAR", value: "WAR" },
  { label: "M19", value: "M19" },
  { label: "DOM", value: "DOM" },
  { label: "RIX", value: "RIX" },
  { label: "GRN", value: "GRN" },
  { label: "RNA", value: "RNA" },
  { label: "KTK", value: "KTK" },
  { label: "XLN", value: "XLN" },
  { label: "Cube", value: "Cube" },
  { label: "Chaos", value: "Chaos" },
];

// 游戏模式
const formats = [
  { label: "真人轮抽", value: "PremierDraft" },
  { label: "真人轮抽BO3", value: "TradDraft" },
  { label: "快速轮抽", value: "QuickDraft" },
  { label: "现开赛", value: "Sealed" },
  { label: "现开赛BO3", value: "TradSealed" },
  { label: "竞技场直邮赛现开", value: "ArenaDirect_Sealed" },
  { label: "公开赛第一日现开BO1", value: "OpenSealed_D1_Bo1" },
  { label: "公开赛第一日现开BO3", value: "OpenSealed_D1_Bo3" },
  { label: "资格赛预选现开", value: "QualifierPlayInSealed" },
];

// 玩家分组
const userGroups = [
  { label: "所有用户", value: "" },
  { label: "低级", value: "bottom" },
  { label: "中级", value: "middle" },
  { label: "顶级", value: "top" },
];

// 套牌颜色
const deckColors = [
  { label: "全部套牌", value: "" },
  // 单色
  { label: "W", value: "W" },
  { label: "U", value: "U" },
  { label: "B", value: "B" },
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  // 双色
  { label: "WU", value: "WU" },
  { label: "WB", value: "WB" },
  { label: "WR", value: "WR" },
  { label: "WG", value: "WG" },
  { label: "UB", value: "UB" },
  { label: "UR", value: "UR" },
  { label: "UG", value: "UG" },
  { label: "BR", value: "BR" },
  { label: "BG", value: "BG" },
  { label: "RG", value: "RG" },
  // 三色
  { label: "WUB", value: "WUB" },
  { label: "WUR", value: "WUR" },
  { label: "WUG", value: "WUG" },
  { label: "WBR", value: "WBR" },
  { label: "WBG", value: "WBG" },
  { label: "WRG", value: "WRG" },
  { label: "UBR", value: "UBR" },
  { label: "UBG", value: "UBG" },
  { label: "URG", value: "URG" },
  { label: "BRG", value: "BRG" },
  // 四色
  { label: "WUBR", value: "WUBR" },
  { label: "WUBG", value: "WUBG" },
  { label: "WURG", value: "WURG" },
  { label: "WBRG", value: "WBRG" },
  { label: "UBRG", value: "UBRG" },
  // 五色
  { label: "WUBRG", value: "WUBRG" },
];

interface CardFiltersProps {
  params: CardDataParams;
  onParamsChange: (params: Partial<CardDataParams>) => void;
}

export function CardFilters({ 
  params, 
  onParamsChange,
}: CardFiltersProps) {
  const startDate = params.start_date ? new Date(params.start_date) : null;
  const endDate = params.end_date ? new Date(params.end_date) : null;

  return (
    <div className="space-y-4">
      {/* 第一行：只保留时间范围 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <ConfigProvider locale={zhCN}>
            <DatePicker
              placeholder="开始日期"
              value={startDate ? dayjs(startDate) : null}
              onChange={(date: Dayjs | null) => 
                onParamsChange({ 
                  start_date: date ? date.format('YYYY-MM-DD') : '' 
                })
              }
              className="w-full sm:w-[160px]"
            />
            <DatePicker
              placeholder="结束日期"
              value={endDate ? dayjs(endDate) : null}
              onChange={(date: Dayjs | null) => 
                onParamsChange({ 
                  end_date: date ? date.format('YYYY-MM-DD') : '' 
                })
              }
              className="w-full sm:w-[160px]"
            />
          </ConfigProvider>
        </div>
      </div>

      {/* 第二行：其他筛选项 */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
        <Select
          options={sets}
          value={params.expansion}
          onChange={(e) => onParamsChange({ expansion: e.target.value })}
          title="系列"
          className="w-full sm:w-auto sm:min-w-[120px]"
        />
        <Select
          options={formats}
          value={params.format}
          onChange={(e) => onParamsChange({ format: e.target.value })}
          title="模式"
          className="w-full sm:w-auto sm:min-w-[140px]"
        />
        <Select
          options={userGroups}
          value={params.user_group}
          onChange={(e) => onParamsChange({ user_group: e.target.value })}
          title="用户组"
          className="w-full sm:w-auto sm:min-w-[100px]"
        />
        <Select
          options={deckColors}
          value={params.colors || ""}
          onChange={(e) => onParamsChange({ colors: e.target.value })}
          title="套牌颜色"
          className="w-full sm:w-auto sm:min-w-[120px]"
        />
      </div>
    </div>
  );
} 