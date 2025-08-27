"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Lock,
  Unlock
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { securityMonitor } from "@/lib/security-monitoring";
import { waf } from "@/middleware/waf";

interface SecurityStats {
  total_events: number;
  critical_events: number;
  high_events: number;
  medium_events: number;
  low_events: number;
  active_alerts: number;
  blocked_requests: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  severity: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, unknown>;
  resolved: boolean;
}

interface SecurityAlert {
  id: string;
  rule_id: string;
  rule_name: string;
  severity: string;
  timestamp: string;
  events: Record<string, unknown>[];
  resolved: boolean;
}

export default function SecurityDashboardPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wafEnabled, setWafEnabled] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setError("Acceso denegado. Solo administradores pueden ver este dashboard.");
      return;
    }

    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [user]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas
      const { data: statsData } = await supabase
        .rpc('get_security_stats', { hours_back: 24 });

      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Cargar eventos recientes
      const { data: eventsData } = await supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      setRecentEvents(eventsData || []);

      // Cargar alertas activas
      const { data: alertsData } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false })
        .limit(10);

      setActiveAlerts(alertsData || []);

    } catch (err) {
      console.error('Error loading security data:', err);
      setError('Error al cargar datos de seguridad');
    } finally {
      setLoading(false);
    }
  };

  const toggleWAF = async () => {
    try {
      if (wafEnabled) {
        waf.disable();
        setWafEnabled(false);
      } else {
        waf.enable();
        setWafEnabled(true);
      }
    } catch (err) {
      console.error('Error toggling WAF:', err);
    }
  };

  const toggleMonitoring = async () => {
    try {
      if (monitoringEnabled) {
        securityMonitor.stopMonitoring();
        setMonitoringEnabled(false);
      } else {
        securityMonitor.startMonitoring();
        setMonitoringEnabled(true);
      }
    } catch (err) {
      console.error('Error toggling monitoring:', err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await securityMonitor.resolveAlert(alertId);
      await loadSecurityData(); // Recargar datos
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Seguridad</h1>
          <p className="text-muted-foreground">
            Monitoreo y control de seguridad del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSecurityData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Controles de Seguridad */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Web Application Firewall (WAF)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Estado: {wafEnabled ? 'Activo' : 'Inactivo'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Protege contra ataques web
                </p>
              </div>
              <Button
                variant={wafEnabled ? "default" : "outline"}
                onClick={toggleWAF}
                className="flex items-center gap-2"
              >
                {wafEnabled ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                {wafEnabled ? 'Activo' : 'Inactivo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoreo de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Estado: {monitoringEnabled ? 'Activo' : 'Inactivo'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Detecta amenazas en tiempo real
                </p>
              </div>
              <Button
                variant={monitoringEnabled ? "default" : "outline"}
                onClick={toggleMonitoring}
                className="flex items-center gap-2"
              >
                {monitoringEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {monitoringEnabled ? 'Activo' : 'Inactivo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_events}</div>
              <p className="text-xs text-muted-foreground">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.critical_events}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención inmediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.active_alerts}</div>
              <p className="text-xs text-muted-foreground">
                Sin resolver
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests Bloqueados</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.blocked_requests}</div>
              <p className="text-xs text-muted-foreground">
                Por el WAF
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas Activas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas Activas ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay alertas activas
            </p>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h4 className="font-medium">{alert.rule_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eventos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Eventos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay eventos recientes
            </p>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(event.severity)}
                    <div>
                      <h4 className="font-medium">{event.event_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.ip_address} • {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
