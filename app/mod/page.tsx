import { ModDownloadButton } from '@/components/mod/mod-download-button';
import { GeiliRedeemPanel } from '@/components/mod/geili-redeem-panel';
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "十七地 - MTGA汉化MOD",
  "下载并安装MTGA游戏界面汉化MOD，让游戏界面完全中文化。包含安装教程和使用说明，支持最新版本。",
  "/mod",
  {
    keywords: ["MTGA", "万智牌", "汉化MOD", "中文化", "游戏界面", "汉化补丁", "中文界面", "汉化工具"],
  }
);

export default function ModPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">MTGA 汉化MOD</h1>
        
        {/* 重要声明 */}
        <div className="bg-red-500/10 text-red-500 rounded-lg p-4 mb-8 border-2 border-red-500">
          <p className="font-bold mb-2">重要声明</p>
          <p className="text-sm leading-relaxed">
            所有MOD都在事实上修改了游戏文件或游戏运行逻辑，使用需谨慎，不对所造成的后果负责！
          </p>
        </div>

        {/* 说明 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <div className="space-y-4">
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              本汉化MOD只适用于Windows，基于晨曦之光大佬开发的汉化MOD进行修改，感谢原作者。
            </p>
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              MOD使用了BepInEx框架制作，所以不需要修改任何游戏原文件，使得理论上MOD本体可以避免更新导致的失效。
            </p>
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              如果您不确定如何使用MOD或担心可能的风险，请勿下载使用本程序。
            </p>
          </div>
        </div>

        {/* 给梨加速器广告 */}
        <div className="relative overflow-hidden rounded-lg border border-[--border] bg-[linear-gradient(135deg,_#0f172a,_#111827)] text-slate-100 p-4 mb-8 dark:border-slate-700/80 dark:bg-[linear-gradient(135deg,_#1f2937,_#0b1220)] dark:shadow-[0_18px_40px_rgba(2,6,23,0.55)]">
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.25),_transparent_55%)] dark:opacity-70 dark:bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_60%)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <img src="/geili-logo.svg" alt="给梨加速器" className="h-7 w-auto" />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#facc15] text-black font-medium">永久免费</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e] text-black font-medium">电竞级专线</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed max-w-md">
                  专为游戏玩家打造的稳定加速服务，动态多线智能选路，降低延迟与丢包，让您轮抽手更稳，打牌不掉线。
                </p>
              </div>
            </div>

            <GeiliRedeemPanel />
          </div>
        </div>

        {/* 下载区域 */}
        <div className="bg-[--card] rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[--foreground]">汉化MOD更新器 v0.4</h3>
              </div>
              <ModDownloadButton />
            </div>

            <div className="border-t border-[--border] pt-4">
              <h3 className="font-medium text-[--foreground] mb-2">安装说明</h3>
              <ol className="text-sm text-[--muted-foreground] space-y-2 list-decimal list-inside">
                <li>下载更新器程序。</li>
                <li>将更新器放到MTGA游戏根目录下运行。</li>
                <li>在更新器中选择 安装MOD 即可完成安装。</li>
              </ol>
              <p className="text-sm text-yellow-500 mt-2">
                提示：由于更新器需要修改游戏文件，Windows Defender 可能会误报为病毒。
              </p>
            </div>

            <div className="border-t border-[--border] pt-4">
              <h3 className="font-medium text-[--foreground] mb-2">最新MOD版本：v2.8</h3>
              <div className="text-sm text-[--muted-foreground]">
                <p className="mb-2">更新内容：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>给FCA和japan showcase牌框文本增加描边防止看不清</li>
                  <li>修复别名卡的原名看不见的问题</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-2 text-[11px] text-[--muted-foreground] leading-snug opacity-70">
          <p>
            * 推广内容仅用于支持开发维护，本站与相关服务商无隶属或合作关系。您可自由选择下载/加速服务，相关服务问题请联系对应服务商，本站不对其负责。
          </p>
        </div>
      </div>
    </div>
  )
} 
