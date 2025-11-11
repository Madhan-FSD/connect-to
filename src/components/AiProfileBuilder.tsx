import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Copy,
  Check,
  Info,
  FileText,
  Download,
  X,
} from "lucide-react";
import HTMLDocx from "html-docx-js-typescript";
import { saveAs } from "file-saver";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const AIProfileBuilder = ({ profileData }) => {
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = getAuth();

  const resumeRef = useRef(null);

  const handleGenerate = async () => {
    if (!user || !profileData || !Object.keys(profileData).length) {
      toast.error("User profile data is required to generate a resume.");
      return;
    }

    setIsGenerating(true);
    setGeneratedHtml("");
    try {
      const response = await aiApi.buildProfile(profileData, user.token);

      const rawResponseText = response.resume_html || "";
      const htmlContent = rawResponseText
        .replace("```html", "")
        .replace("```", "")
        .trim();

      if (htmlContent.startsWith("<div")) {
        setGeneratedHtml(htmlContent);
        toast.success("Resume generated successfully!");
      } else {
        toast.error("AI returned malformed HTML. Try again.");
        setGeneratedHtml("");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(error.error || "Failed to generate resume");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedHtml || !resumeRef.current) return;

    if (typeof html2canvas === "undefined" || typeof jsPDF === "undefined") {
      toast.error(
        "PDF requires external libraries (html2canvas, jspdf). Please install them."
      );
      return;
    }

    toast.info("Generating PDF... This may take a moment.");

    try {
      const input = resumeRef.current;
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("AI_Generated_Resume.pdf");
      toast.success("PDF download complete.");
    } catch (e) {
      console.error("PDF generation failed:", e);
      toast.error("PDF generation failed.");
    }
  };

  const handleDownloadDOC = () => {
    if (!generatedHtml) return;

    const content = `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>AI Resume</title>
        </head>
        <body>
            ${generatedHtml}
        </body>
        </html>
    `;

    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download = "AI_Generated_Resume.docx";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedHtml) return;
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    toast.success("HTML Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setGeneratedHtml("");
    toast.info("Cleared generated resume.");
  };

  const isProfileEmpty =
    !profileData ||
    (!profileData.core &&
      (!profileData.skills || profileData.skills.length === 0) &&
      (!profileData.achievements || profileData.achievements.length === 0));

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Resume Generator</CardTitle>
          </div>
          <CardDescription>
            Analyze your profile to create a complete, Tailwind-styled resume
            ready for review and download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProfileEmpty ? (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md">
              <Info className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                No profile data found. Please complete your core, skills, or
                achievements sections first.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !profileData}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating
                ? "Analyzing & Generating...."
                : "Generate Resume With AI"}
            </Button>
          )}
        </CardContent>
      </Card>

      {generatedHtml && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Generated Resume</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadDOC}
                  disabled={isGenerating}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  DOC
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isGenerating}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy HTML
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={isGenerating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={resumeRef}
              className="resume-display p-4 border border-gray-200 rounded-md bg-white"
              dangerouslySetInnerHTML={{ __html: generatedHtml }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
