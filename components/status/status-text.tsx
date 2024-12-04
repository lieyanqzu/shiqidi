export function StatusText({ status }: { status: string }) {
  const statusText: { [key: string]: string } = {
    operational: '正常',
    degraded_performance: '性能下降',
    partial_outage: '部分中断',
    major_outage: '主要中断',
    under_maintenance: '维护中'
  };
  return <span>{statusText[status] || status}</span>;
} 