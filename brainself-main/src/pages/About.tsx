import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const About = () => {
  const { user } = useAuth();

  return (
    <div
      className="relative min-h-screen py-12 px-4 text-white"
      style={{
        fontFamily: "'Roboto', sans-serif",
        background: `linear-gradient(135deg, #050010 0%, #0d0d2e 50%, #050010 100%),
                     radial-gradient(circle at 30% 20%, rgba(0,255,255,0.08) 0%, transparent 70%),
                     radial-gradient(circle at 70% 80%, rgba(255,0,255,0.05) 0%, transparent 70%)`,
      }}
    >
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">

        
        <Card className="glass-effect neon-border text-center">
          <CardHeader>
            <CardTitle className="text-5xl font-extrabold drop-shadow-lg tracking-wider">
              <span style={{ color: "black" }}>🌌</span> Our Mission
            </CardTitle>
            <CardDescription className="mt-4 text-cyan-200 text-lg leading-relaxed">
              🌌 At BrainSelf, our mission is to empower students by making learning smarter, simpler, and more engaging. We aim to increase knowledge, improve exam readiness, and inspire self-learning through innovative digital tools tailored for school students. 🚀
            </CardDescription>
          </CardHeader>
        </Card>

        
        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="text-4xl gradient-text">
              <span style={{ color: "black" }}>👾</span> Creators
            </CardTitle>
            <CardDescription className="text-cyan-200">
              Meet the brilliant minds behind this futuristic project
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            
            
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl shadow-yellow-500/50 hover:scale-105 transition-all duration-300">
              <img
                src="public\image.png"
                alt="Chathurya"
                className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl shadow-yellow-500/70 mb-4"
              />
              <h3 className="text-3xl font-bold text-yellow-400 drop-shadow-md">N.I.N. Chathurya</h3>
              <p className="text-lg text-yellow-300 font-semibold">⭐ Main Developer & The Designer </p>
              <p className="text-sm text-yellow-200 mt-2 italic">"Crafting futuristic web experiences." 💻✨</p>
            </div>

            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-6 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 shadow-md shadow-cyan-400/30">
              <img
                src="public\WhatsApp Image 2025-09-19 at 6.41.31 PM.jpeg"
                alt="Ayesh"
                className="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg shadow-cyan-500/50 mb-4"
              />
              <h3 className="text-xl font-bold text-cyan-300">B.K.B.A. Nimsara</h3>
              <p className="text-sm text-cyan-200">Logo Designer</p>
              <p className="text-xs text-cyan-400 mt-2 italic">"BrainSelf LOGO" 💖</p>
            </div>

            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-6 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 shadow-md shadow-cyan-400/30">
              <img
                src="public\WhatsApp Image 2025-09-20 at 7.16.20 AM.png"
                alt="Savindu"
                className="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg shadow-cyan-500/50 mb-4"
              />
              <h3 className="text-xl font-bold text-cyan-300">C.K.Habaragamuwa</h3>
              <p className="text-sm text-cyan-200">Invester</p>
              <p className="text-xs text-cyan-400 mt-2 italic">"Here Comes the money " 💲</p>
            </div>

            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-6 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 shadow-md shadow-cyan-400/30">
              <img
                src="public\WhatsApp Image 2025-09-19 at 7.27.23 PM.png"
                alt="Nuwan"
                className="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg shadow-cyan-500/50 mb-4"
              />
              <h3 className="text-xl font-bold text-cyan-300">T.M.R.Dumidu</h3>
              <p className="text-sm text-cyan-200">Test Runner</p>
              <p className="text-xs text-cyan-400 mt-2 italic">"Arm,Theres a bug here " 🐞</p>
            </div>

          </CardContent>
        </Card>

        <Card className="glass-effect neon-border">
          <CardHeader>
            <CardTitle className="text-3xl gradient-text">
              <span style={{ color: "black" }}>💡</span> Supporters & Credits
            </CardTitle>
            <CardDescription className="text-cyan-200">
              A huge thanks to the supporters who made this possible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-cyan-300 text-lg">
            <p>📺 DP Education - Videos on Lessons</p>
            <p>📘 The Government of Education - Text Books</p>
            <p>📝 E-Thaksalawa - Past Papers</p>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default About;
