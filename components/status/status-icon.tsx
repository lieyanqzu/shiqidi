import { Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'operational':
    case 'none':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'degraded_performance':
    case 'partial_outage':
    case 'minor':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'major_outage':
    case 'major':
    case 'critical':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'under_maintenance': 
    case 'maintenance':
      return <Activity className="w-5 h-5 text-blue-500" />;
    default:
      return <Activity className="w-5 h-5 text-[--muted-foreground]" />;
  }
} 