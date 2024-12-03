import { Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'operational':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'degraded_performance':
    case 'partial_outage':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'major_outage':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Activity className="w-5 h-5 text-[--muted-foreground]" />;
  }
} 