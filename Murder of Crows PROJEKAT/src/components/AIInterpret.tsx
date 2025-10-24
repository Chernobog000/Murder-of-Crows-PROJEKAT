import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkle } from "lucide-react";

const AIInterpret = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Molim te unesi tekst za interpretaciju");
      return;
    }

    setLoading(true);
    setInterpretation("");

    try {
      const response = await fetch("http://localhost:8000/ai-interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          toast.error("Ollama nije dostupan. Pokreni ga komandom: ollama run llama3");
        } else {
          throw new Error("API greška");
        }
        return;
      }

      const data = await response.json();
      setInterpretation(data.interpretation);
      toast.success("AI interpretacija uspešna!");
    } catch (error) {
      toast.error("Greška pri povezivanju sa API-jem. Proveri da li su backend i Ollama pokrenuti");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exampleText = `The First Feather – The Fool
Text: The Fool represents new beginnings, innocence, and spontaneity...
Keywords: new beginnings, innocence, spontaneity

The Second Feather – The Magician
Text: The Magician symbolizes manifestation, resourcefulness, and power...
Keywords: manifestation, willpower, skill`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-primary" />
              AI Interpretacija
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Zahteva lokalni Ollama model na http://localhost:11434
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setText(exampleText)}
          >
            Koristi primer
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Tekst za interpretaciju (YAML + keywords)
          </label>
          <Textarea
            placeholder="Unesi YAML tekst i keywords iz prethodnog očitavanja..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="bg-background/50 font-mono text-sm"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI procesira...
            </>
          ) : (
            "Interpretiraj pomoću AI"
          )}
        </Button>
      </div>

      {interpretation && (
        <Card className="p-6 bg-card/80 space-y-3 border-primary/20">
          <h4 className="text-xl font-bold text-primary flex items-center gap-2">
            <Sparkle className="w-5 h-5" />
            AI Interpretacija
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {interpretation}
          </p>
        </Card>
      )}

      <Card className="p-4 bg-accent/5 border-accent/20">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Napomena:</strong> Ovaj endpoint koristi lokalni Ollama model. 
          Ako nije pokrenut, instaliraj ga sa <code className="bg-muted px-1 rounded">https://ollama.ai</code> i 
          pokreni komandom <code className="bg-muted px-1 rounded">ollama run llama3</code>
        </p>
      </Card>
    </div>
  );
};

export default AIInterpret;
