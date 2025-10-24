import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, History as HistoryIcon, RefreshCw } from "lucide-react";

interface Session {
  filename: string;
  timestamp: string;
  reading_count: number;
}

const History = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/history");
      
      if (!response.ok) {
        throw new Error("API greška");
      }

      const data = await response.json();
      setSessions(data.sessions);
      
      if (data.sessions.length === 0) {
        toast.info("Još uvek nema arhiviranih sesija");
      } else {
        toast.success(`Učitano ${data.sessions.length} sesija`);
      }
    } catch (error) {
      toast.error("Greška pri povezivanju sa API-jem. Proveri da li je backend pokrenut na http://localhost:8000");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('sr-RS', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-primary" />
          Istorija Sesija
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {sessions.length === 0 && !loading && (
        <Card className="p-8 text-center bg-card/50">
          <HistoryIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Nema arhiviranih sesija. Koristi <code className="bg-muted px-2 py-1 rounded text-xs">/archive-session</code> endpoint da sačuvaš očitavanja.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {sessions.map((session, index) => (
          <Card key={index} className="p-4 bg-card/80 hover:bg-card/90 transition-colors border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">{session.filename}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(session.timestamp)}
                </p>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {session.reading_count} očitavanja
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-accent/5 border-accent/20">
        <p className="text-xs text-muted-foreground">
          📁 Sesije se arhiviraju u <code className="bg-muted px-1 rounded">backend/sessions/</code> folder. 
          Koristi <code className="bg-muted px-1 rounded">POST /archive-session</code> endpoint za čuvanje novih očitavanja.
        </p>
      </Card>
    </div>
  );
};

export default History;
