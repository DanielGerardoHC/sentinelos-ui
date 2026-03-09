'use client';

import Orb from '@/components/ui/Orb/Orb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
      <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center">

        {/* Fondo Interactivo: El Orbe de React Bits */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-90">
          <div className="w-full h-full max-w-4xl max-h-[800px]">
            <Orb
                hoverIntensity={3}
                rotateOnHover={true}
                hue={140}
                forceHoverState={false}
                backgroundColor="#000000"
            />
          </div>
        </div>

        {/* Tarjeta de Login Frontal */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10 w-full max-w-md p-4"
        >
          {/* Usamos bg-black/60 y backdrop-blur para que el Orbe se vea difuminado a través de la tarjeta */}
          <Card className="border-zinc-800 bg-black/60 backdrop-blur-xl shadow-2xl shadow-emerald-900/20">

            <CardHeader className="space-y-4 text-center pb-6">
              <div className="mx-auto bg-zinc-900/80 p-3 rounded-full border border-zinc-800 w-fit shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="space-y-1">
                <CardTitle className="text-3xl font-bold tracking-tighter text-zinc-100">
                  SentinelOS
                </CardTitle>
                <CardDescription className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
                  {'>'} Initializing Secure Gateway
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin_id" className="text-zinc-300 font-mono text-xs uppercase tracking-wider">
                  Username
                </Label>
                <Input
                    id="admin_id"
                    placeholder="root"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500/50 font-mono h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passphrase" className="text-zinc-300 font-mono text-xs uppercase tracking-wider">
                  Secret
                </Label>
                <Input
                    id="passphrase"
                    type="password"
                    placeholder="••••••••"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500/50 font-mono h-11"
                />
              </div>
              <Button
                  onClick={() => router.push('/system')}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                AUTHORIZE ACCESS
              </Button>
            </CardContent>

          </Card>
        </motion.div>
      </div>
  );
}