'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const privacyItems = [
  '本站是静态信息展示网站，不提供注册、登录、评论、支付、下单等功能。',
  '本站不主动收集姓名、手机号、身份证号、地址等身份信息。',
  '本站使用百度统计和 Microsoft Clarity 进行访问分析。',
  '可能收集的信息包括 IP 地址、浏览器类型、设备信息、访问页面、来源页面、点击、滚动、停留时间、Cookie/类似标识符。',
  '使用目的：统计访问量、分析页面体验、改进内容和排查异常。',
  '用户可以通过浏览器设置禁用 Cookie，或联系站长咨询、撤回授权、请求删除相关信息。',
  '不要在页面里提交敏感个人信息，因为本站没有提供收集渠道。'
];

export function PrivacyNotice() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[--card] rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">隐私提示</h2>
      <p className="text-sm text-[--muted-foreground] leading-relaxed">
        本站使用百度统计和 Microsoft Clarity 进行访问分析和页面体验优化，可能使用 Cookie/类似技术记录页面浏览、点击、滚动等行为数据。详见
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[--primary] hover:opacity-80 mx-1 underline-offset-4 hover:underline"
        >
          《隐私政策》
        </button>
        。
      </p>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-[--component-background] shadow-xl sm:max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-[--border] p-4">
              <h2 className="text-lg font-semibold text-[--foreground]">隐私政策</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[--foreground-muted] transition-colors hover:text-[--foreground]"
                aria-label="关闭隐私政策"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-[--foreground-muted]">
                {privacyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end border-t border-[--border] px-4 py-3">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                我知道了
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
