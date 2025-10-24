import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Layers } from "lucide-react";

const ThreeCard = () => {
  const [cards, setCards] = useState<string[]>(["", "", ""]);
  const [format, setFormat] = useState("Past – Present – Future");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const formatPresets = [
    "Past – Present – Future",
    "Situation – Challenge – Solution",
    "Present situation – Choice 1 – Choice 2",
  ];

  const handleCardChange = (index: number, value: string) => {
    const newCards = [...cards];
    newCards[index] = value;
    setCards(newCards);
  };

  const handleSubmit = async () => {
    const filledCards = cards.filter((card) => card.trim() !== "");
    
    if (filledCards.length !== 3) {
      toast.error("Molim te unesi sve 3 karte");
      return;
    }

    if (!format.trim()) {
      toast.error("Molim te unesi format očitavanja");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/three-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: filledCards, format }),
      });

      if (!response.ok) {
        throw new Error("API greška");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Očitavanje uspešno!");
    } catch (error) {
      toast.error("Greška pri povezivanju sa API-jem. Proveri da li je backend pokrenut na http://localhost:8000");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Unesi 3 Karte
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Format očitavanja</label>
          <div className="flex flex-wrap gap-2">
            {formatPresets.map((preset) => (
              <Button
                key={preset}
                variant={format === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat(preset)}
                className={format === preset ? "bg-primary" : ""}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {cards.map((card, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Karta {index + 1}
              </label>
              <Input
                placeholder=""
                value={card}
                onChange={(e) => handleCardChange(index, e.target.value)}
                className="bg-background/50"
              />
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesiranje...
            </>
          ) : (
            "Pošalji na API"
          )}
        </Button>
      </div>

      {result && (
        <Card className="p-6 bg-card/80 space-y-4 border-primary/20">
          <h4 className="text-xl font-bold text-primary">{result.spread_type}</h4>
          {result.reading.map((reading: any, index: number) => (
            <Card key={index} className="p-4 bg-background/30 space-y-2">
              <h5 className="font-semibold text-accent">{reading.label}</h5>
              <p className="text-sm text-foreground/90">{reading.text}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {reading.keywords.map((keyword: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </Card>
      )}
    </div>
  );
};

export default ThreeCard;
