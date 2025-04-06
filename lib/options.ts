export interface Option {
  label: string;
  value: string;
}

export const formatOptions: Option[] = [
  { label: "真人轮抽", value: "PremierDraft" },
  { label: "真人轮抽BO3", value: "TradDraft" },
  { label: "快速轮抽", value: "QuickDraft" },
  { label: "现开赛", value: "Sealed" },
  { label: "现开赛BO3", value: "TradSealed" },
  { label: "竞技场直邮赛现开", value: "ArenaDirect_Sealed" },
  { label: "公开赛第二日轮抽BO3", value: "OpenDraft_D2_Draft1_Bo3" },
  { label: "公开赛第二日轮抽2B BO3", value: "OpenDraft_D2_Draft2B_Bo3" },
  { label: "公开赛第二日轮抽2 BO3", value: "OpenDraft_D2_Draft2_Bo3" },
  { label: "公开赛第一日现开BO1", value: "OpenSealed_D1_Bo1" },
  { label: "公开赛第一日现开BO3", value: "OpenSealed_D1_Bo3" },
  { label: "资格赛预选现开", value: "QualifierPlayInSealed" },
];

// 赛制选项
export const formatSpeedOptions: Option[] = [
  { label: "真人轮抽", value: "PremierDraft" },
  { label: "快速轮抽", value: "QuickDraft" },
  { label: "现开赛", value: "Sealed" },
  { label: "真人轮抽BO3", value: "TradDraft" },
  { label: "现开赛BO3", value: "TradSealed" },
  { label: "神器混合真人轮抽", value: "PremierDraftRemixArtifacts" },
  { label: "公开赛第二日现开BO3", value: "OpenSealed_D2_Bo3" },
  { label: "公开赛第二日轮抽BO3", value: "OpenDraft_D2_Bo3" },
  { label: "公开赛第一日轮抽BO1", value: "OpenDraft_D1_Bo1" },
  { label: "公开赛第二日轮抽BO3", value: "OpenDraft_D2_Draft1_Bo3" },
  { label: "全知轮抽", value: "Omniscience_Draft" },
  { label: "中周现开", value: "MidWeekSealed" },
  { label: "中周轮抽", value: "MidWeekQuickDraft" },
  { label: "轮抽挑战赛", value: "DraftChallenge" },
  { label: "十项全能真人轮抽", value: "DecathlonTradDraft" },
  { label: "十项全能快速轮抽", value: "DecathlonQuickDraft" },
  { label: "十项全能决赛2022", value: "DecathlonFinals2022" },
  { label: "混沌轮抽", value: "CubeDraft" },
  { label: "资格赛预选现开", value: "QualifierPlayInSealed" },
  { label: "资格赛预选现开BO3", value: "QualifierPlayInTradSealed" },
  { label: "资格赛第一日现开", value: "Qualifier_D1_Sealed" },
  { label: "公开赛第一日现开BO3", value: "OpenSealed_D1_Bo3" },
  { label: "公开赛第一日现开BO1", value: "OpenSealed_D1_Bo1" },
  { label: "竞技场直邮赛现开", value: "ArenaDirect_Sealed" },
];

// 系列选项
export const expansionOptions: Option[] = [
  { label: "TDM", value: "TDM" },
  { label: "DFT", value: "DFT" },
  { label: "Y25DFT", value: "Y25DFT" },
  { label: "PIO", value: "PIO" },
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
  { label: "M20", value: "M20" },
  { label: "WAR", value: "WAR" },
  { label: "RNA", value: "RNA" },
  { label: "GRN", value: "GRN" },
  { label: "DOM", value: "DOM" },
  { label: "RIX", value: "RIX" },
  { label: "KTK", value: "KTK" },
  { label: "Cube", value: "Cube" },
  { label: "Chaos", value: "Chaos" }
];

// 玩家分组选项
export const userGroupOptions: Option[] = [
  { label: "所有用户", value: "" },
  { label: "低级", value: "bottom" },
  { label: "中级", value: "middle" },
  { label: "顶级", value: "top" },
];

// 套牌颜色选项
export const deckColorOptions: Option[] = [
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

// 卡牌颜色选项
export const cardColorOptions: Option[] = [
  { label: "W", value: "W" },
  { label: "U", value: "U" },
  { label: "B", value: "B" },
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  { label: "M", value: "M" },
  { label: "C", value: "C" },
];

// 稀有度选项
export const rarityOptions: Option[] = [
  { label: "普通", value: "common" },
  { label: "非普通", value: "uncommon" },
  { label: "稀有", value: "rare" },
  { label: "秘稀", value: "mythic" },
];

// 创建赛制名称映射
export const formatLabels = Object.fromEntries(
  formatOptions.map(option => [option.value, option.label])
) as Record<string, string>; 