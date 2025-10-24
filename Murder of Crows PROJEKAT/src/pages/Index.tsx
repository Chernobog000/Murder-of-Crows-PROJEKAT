import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import CountingCrow from "@/components/CountingCrow";
import ThreeCard from "@/components/ThreeCard";
import AIInterpret from "@/components/AIInterpret";
import History from "@/components/History";

const Index = () => {
  const [activeTab, setActiveTab] = useState("counting-crow");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-glow)] pointer-events-none" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Murder of Crows Tarot
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              FastAPI backend za modularnu tarot aplikaciju sa ručnim unosom karata
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Backend: localhost:8000</span>
              </div>
            </div>
          </div>

          <Card className="max-w-5xl mx-auto p-6 bg-[var(--gradient-card)] border-border/50 shadow-[var(--shadow-mystical)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="counting-crow">Counting Crow</TabsTrigger>
                <TabsTrigger value="three-card">Three Card</TabsTrigger>
                <TabsTrigger value="ai-interpret">AI Interpret</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="counting-crow">
                <CountingCrow />
              </TabsContent>

              <TabsContent value="three-card">
                <ThreeCard />
              </TabsContent>

              <TabsContent value="ai-interpret">
                <AIInterpret />
              </TabsContent>

              <TabsContent value="history">
                <History />
              </TabsContent>
            </Tabs>
          </Card>

          {/* API Info */}
          <div className="mt-12 max-w-5xl mx-auto">
            <Card className="p-6 bg-card/50 border-border/30">
              <h3 className="text-lg font-semibold mb-4 text-primary">Backend Endpoints</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="text-secondary">POST</span> /counting-crow</p>
                  <p><span className="text-secondary">POST</span> /three-card</p>
                  <p><span className="text-secondary">POST</span> /ai-interpret</p>
                </div>
                <div className="space-y-2">
                  <p><span className="text-secondary">POST</span> /translate</p>
                  <p><span className="text-secondary">POST</span> /archive-session</p>
                  <p><span className="text-accent">GET</span> /history</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                📖 Pogledaj <code className="bg-muted px-2 py-1 rounded">backend/README.md</code> za detaljnu dokumentaciju
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
