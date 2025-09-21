import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

const papers = [
  //Grade 6 :D

  { grade: "Grade 6", subject: "History", term: "Term 1", file: "/papers/Grade 6_History_Term 1.pdf" },
  { grade: "Grade 6", subject: "History", term: "Term 2", file: "/papers/Grade 6_History_Term 2.pdf" },
  { grade: "Grade 6", subject: "History", term: "Term 3", file: "/papers/Grade 6_History_Term 3.pdf" },

   { grade: "Grade 6", subject: "Maths", term: "Term 1", file: "/papers/Grade 6_Maths_Term 1.pdf" },
  { grade: "Grade 6", subject: "Maths", term: "Term 2", file: "/papers/Grade 6_Maths_Term 2.pdf" },
  { grade: "Grade 6", subject: "Maths", term: "Term 3", file: "/papers/Grade 6_Maths_Term 3.pdf" },

   { grade: "Grade 6", subject: "Science", term: "Term 1", file: "/papers/Grade 6_Science_Term 1.pdf" },
  { grade: "Grade 6", subject: "Science", term: "Term 2", file: "/papers/Grade 6_Science_Term 2.pdf" },

   { grade: "Grade 6", subject: "Sinhala", term: "Term 1", file: "/papers/Grade 6_Sinhala_Term 1.pdf" },
  { grade: "Grade 6", subject: "Sinhala", term: "Term 2", file: "/papers/Grade 6_Sinhala_Term 2.pdf" },
  { grade: "Grade 6", subject: "Sinhala", term: "Term 3", file: "/papers/Grade 6_Sinhala_Term 3.pdf" },

   { grade: "Grade 6", subject: "Art", term: "Term 1", file: "/papers/Grade 6_Art_Term 1.pdf" },
  { grade: "Grade 6", subject: "Art", term: "Term 2", file: "/papers/Grade 6_Art_Term 2.pdf" },
  { grade: "Grade 6", subject: "Art", term: "Term 3", file: "/papers/Grade 6_Art_Term 3.pdf" },

  { grade: "Grade 6", subject: "English", term: "Term 1", file: "/papers/Grade 6_English_Term 1.pdf" },
  { grade: "Grade 6", subject: "English", term: "Term 2", file: "/papers/Grade 6_English_Term 2.pdf" },
  { grade: "Grade 6", subject: "English", term: "Term 3", file: "/papers/Grade 6_English_Term 3.pdf" },

  { grade: "Grade 6", subject: "Geography", term: "Term 1", file: "/papers/Grade 6_Geography_Term 1.pdf" },
  { grade: "Grade 6", subject: "Geography", term: "Term 2", file: "/papers/Grade 6_Geography_Term 2.pdf" },
  { grade: "Grade 6", subject: "Geography", term: "Term 3", file: "/papers/Grade 6_Geography_Term 3.pdf" },

  { grade: "Grade 6", subject: "Civic", term: "Term 1", file: "/papers/Grade 6_Civic_Term 1.pdf" },
  
  { grade: "Grade 6", subject: "Civic", term: "Term 2", file: "/papers/Grade 6_Civic_Term 2.pdf" },


//Grade 7 :P

 { grade: "Grade 7", subject: "History", term: "Term 1", file: "/papers/Grade 7_History_Term 1.pdf" },
  { grade: "Grade 7", subject: "History", term: "Term 2", file: "/papers/Grade 7_History_Term 2.pdf" },
  { grade: "Grade 7", subject: "History", term: "Term 3", file: "/papers/Grade 7_History_Term 3.pdf" },

   { grade: "Grade 7", subject: "Maths", term: "Term 1", file: "/papers/Grade 7_Maths_Term 1.pdf" },
  { grade: "Grade 7", subject: "Maths", term: "Term 2", file: "/papers/Grade 7_Maths_Term 2.pdf" },

   { grade: "Grade 7", subject: "Science", term: "Term 1", file: "/papers/Grade 7_Science_Term 1.pdf" },
  { grade: "Grade 7", subject: "Science", term: "Term 2", file: "/papers/Grade 7_Science_Term 2.pdf" },

   { grade: "Grade 7", subject: "Sinhala", term: "Term 1", file: "/papers/Grade 7_Sinhala_Term 1.pdf" },
  { grade: "Grade 7", subject: "Sinhala", term: "Term 2", file: "/papers/Grade 7_Sinhala_Term 2.pdf" },

   { grade: "Grade 7", subject: "Art", term: "Term 1", file: "/papers/Grade 7_Art_Term 1.pdf" },
  { grade: "Grade 7", subject: "Art", term: "Term 2", file: "/papers/Grade 7_Art_Term 2.pdf" },
  { grade: "Grade 7", subject: "Art", term: "Term 3", file: "/papers/Grade 7_Art_Term 3.pdf" },

  { grade: "Grade 7", subject: "English", term: "Term 1", file: "/papers/Grade 7_English_Term 1.pdf" },
  { grade: "Grade 7", subject: "English", term: "Term 2", file: "/papers/Grade 7_English_Term 2.pdf" },
  { grade: "Grade 7", subject: "English", term: "Term 3", file: "/papers/Grade 7_English_Term 3.pdf" },

  { grade: "Grade 7", subject: "Geography", term: "Term 1", file: "/papers/Grade 7_Geography_Term 1.pdf" },
 
  { grade: "Grade 7", subject: "Civic", term: "Term 1", file: "/papers/Grade 7_Civic_Term 1.pdf" },
  
  { grade: "Grade 7", subject: "Civic", term: "Term 2", file: "/papers/Grade 7_Civic_Term 2.pdf" },

//grade 8 :O


 { grade: "Grade 8", subject: "History", term: "Term 1", file: "/papers/Grade 8_History_Term 1.pdf" },
  { grade: "Grade 8", subject: "History", term: "Term 2", file: "/papers/Grade 8_History_Term 2.pdf" },
  { grade: "Grade 8", subject: "History", term: "Term 3", file: "/papers/Grade 8_History_Term 3.pdf" },

   { grade: "Grade 8", subject: "Maths", term: "Term 1", file: "/papers/Grade 8_Maths_Term 1.pdf" },
  { grade: "Grade 8", subject: "Maths", term: "Term 2", file: "/papers/Grade 8_Maths_Term 2.pdf" },
  { grade: "Grade 8", subject: "Maths", term: "Term 3", file: "/papers/Grade 8_Maths_Term 3.pdf" },

   { grade: "Grade 8", subject: "Science", term: "Term 1", file: "/papers/Grade 8_Science_Term 1.pdf" },
  { grade: "Grade 8", subject: "Science", term: "Term 2", file: "/papers/Grade 8_Science_Term 2.pdf" },
  { grade: "Grade 8", subject: "Science", term: "Term 3", file: "/papers/Grade 8_Science_Term 3.pdf" },

   { grade: "Grade 8", subject: "Sinhala", term: "Term 1", file: "/papers/Grade 7_Sinhala_Term 1.pdf" },
  { grade: "Grade 8", subject: "Sinhala", term: "Term 2", file: "/papers/Grade 7_Sinhala_Term 2.pdf" },
  { grade: "Grade 8", subject: "Sinhala", term: "Term 3", file: "/papers/Grade 7_Sinhala_Term 3.pdf" },



   
  { grade: "Grade 8", subject: "English", term: "Term 2", file: "/papers/Grade 8_English_Term 2.pdf" },
  { grade: "Grade 8", subject: "English", term: "Term 3", file: "/papers/Grade 8_English_Term 3.pdf" },

  { grade: "Grade 8", subject: "Geography", term: "Term 1", file: "/papers/Grade 8_Geography_Term 1.pdf" },
   { grade: "Grade 8", subject: "Geography", term: "Term 2", file: "/papers/Grade 8_Geography_Term 2.pdf" },
  { grade: "Grade 8", subject: "Geography", term: "Term 2", file: "/papers/Grade 8_Geography_Term 3.pdf" },

  
  { grade: "Grade 8", subject: "Civic", term: "Term 1", file: "/papers/Grade 7_Civic_Term 1.pdf" },
    { grade: "Grade 8", subject: "Civic", term: "Term 2", file: "/papers/Grade 7_Civic_Term 2.pdf" },

  { grade: "Grade 8", subject: "Civic", term: "Term 3", file: "/papers/Grade 7_Civic_Term 3.pdf" },

//Grade 9 ")


 { grade: "Grade 9", subject: "History", term: "Term 1", file: "/papers/Grade 9_History_Term 1.pdf" },
  { grade: "Grade 9", subject: "History", term: "Term 2", file: "/papers/Grade 9_History_Term 2.pdf" },
  { grade: "Grade 9", subject: "History", term: "Term 3", file: "/papers/Grade 9_History_Term 3.pdf" },

   { grade: "Grade 9", subject: "Maths", term: "Term 1", file: "/papers/Grade 9_Maths_Term 1.pdf" },
  { grade: "Grade 9", subject: "Maths", term: "Term 2", file: "/papers/Grade 9_Maths_Term 2.pdf" },
  { grade: "Grade 9", subject: "Maths", term: "Term 3", file: "/papers/Grade 9_Maths_Term 3.pdf" },

   { grade: "Grade 9", subject: "Science", term: "Term 2", file: "/papers/Grade 9_Science_Term 1.pdf" },
  { grade: "Grade 9", subject: "Science", term: "Term 3", file: "/papers/Grade 9_Science_Term 3.pdf" },

   { grade: "Grade 9", subject: "Sinhala", term: "Term 1", file: "/papers/Grade 9_Sinhala_Term 2.pdf" },
  { grade: "Grade 9", subject: "Sinhala", term: "Term 2", file: "/papers/Grade 9_Sinhala_Term 3.pdf" },

  
  { grade: "Grade 9", subject: "English", term: "Term 1", file: "/papers/Grade 9_English_Term 1.pdf" },
  { grade: "Grade 9", subject: "English", term: "Term 2", file: "/papers/Grade 9_English_Term 2.pdf" },



];


const PastPapersPage = () => {
  const [selectedGrade, setSelectedGrade] = useState("Any");
  const [selectedSubject, setSelectedSubject] = useState("Any");
  const [selectedTerm, setSelectedTerm] = useState("Any");
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const [successIdx, setSuccessIdx] = useState<number | null>(null);

  const grades = ["Any", ...Array.from(new Set(papers.map((p) => p.grade)))];
  const subjects = ["Any", ...Array.from(new Set(papers.map((p) => p.subject)))];
  const terms = ["Any", ...Array.from(new Set(papers.map((p) => p.term)))];

  const filteredPapers = papers.filter(
    (p) =>
      (selectedGrade === "Any" || p.grade === selectedGrade) &&
      (selectedSubject === "Any" || p.subject === selectedSubject) &&
      (selectedTerm === "Any" || p.term === selectedTerm)
  );

  const handleDownload = (p: any, idx: number) => {
    setClickedIdx(idx);

    // Download trigger
    const link = document.createElement("a");
    link.href = p.file;
    link.setAttribute("download", `${p.grade}_${p.subject}_${p.term}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Success icon
    setSuccessIdx(idx);
    setTimeout(() => setSuccessIdx(null), 1200);

    // Reset click animation
    setTimeout(() => setClickedIdx(null), 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative overflow-hidden">
      
      <Card className="w-full max-w-5xl glass-effect neon-border p-6 mb-8 relative z-10">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center tracking-widest bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            🚀 Past Papers Portal
          </CardTitle>
        </CardHeader>

        {/* Filters */}
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block mb-1 text-sm text-cyan-300">Grade</label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full bg-black/40 text-white neon-border">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-cyan-300">Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full bg-black/40 text-white neon-border">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-cyan-300">Term</label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-full bg-black/40 text-white neon-border">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="w-full max-w-5xl grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {filteredPapers.map((p, idx) => (
          <Card
            key={idx}
            className="glass-effect neon-border p-4 hover:scale-105 transform transition duration-300 shadow-xl bg-black/30 relative overflow-hidden"
          >
            <CardContent>
              <div className="text-lg font-semibold text-cyan-300">{p.subject}</div>
              <div className="text-sm text-purple-300">{p.grade} | {p.term}</div>
              
              <div className="relative mt-3 group">
                <Button
                  onClick={() => handleDownload(p, idx)}
                  className={`w-full neon-glow hover-glow flex items-center justify-center gap-2 relative overflow-hidden transform transition-all duration-300 ${
                    clickedIdx === idx ? "scale-105 shadow-[0_0_15px_#0ff]" : ""
                  }`}
                >
                  {successIdx === idx ? (
                    <Check className="w-4 h-4 text-green-400 animate-pulse" />
                  ) : (
                    <Download className="w-4 h-4 transition-transform duration-300" />
                  )}
                  {successIdx === idx ? "Downloaded" : "Download"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <p className="text-cyan-400 mt-8 text-lg relative z-10">⚠️ No papers found for your filters.</p>
      )}
    </div>
  );
};

export default PastPapersPage;
