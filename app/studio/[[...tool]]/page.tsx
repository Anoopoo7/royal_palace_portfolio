import Link from "next/link";
import { ShieldCheck, Database, Compass, CheckCircle2 } from "lucide-react";
import { isSanityConfigured } from "@/lib/sanity/client";

export const metadata = {
  title: "Sanity Studio CMS Portal",
  description: "Manage content for Royal Palace Varkala",
};

export default function StudioPortalPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  return (
    <div className="min-h-screen bg-[#171513] text-[#F5F1E8] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
            ROYAL PALACE CONTENT MANAGEMENT
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            Sanity Studio CMS
          </h1>
          <p className="text-xs md:text-sm text-[#F5F1E8]/70 max-w-xl mx-auto font-light leading-relaxed">
            Sanity controls website copy, room content, experiences, section reordering, promotions, and visual assets without modifying code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#12100E] border border-[#B89A62]/30 p-8 space-y-4">
            <div className="flex items-center space-x-3 text-[#B89A62]">
              <Database className="w-6 h-6" />
              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">Sanity CMS Status</h3>
            </div>
            <div className="text-xs space-y-2 font-light text-[#F5F1E8]/80">
              <p>
                • Configuration Status:{" "}
                <span className={isSanityConfigured ? "text-green-400 font-bold" : "text-amber-400 font-bold"}>
                  {isSanityConfigured ? "Connected" : "Fallback Mock System Active"}
                </span>
              </p>
              <p>• Project ID: <code className="text-[#B89A62]">{projectId || "Not set in .env"}</code></p>
              <p>• Dataset: <code className="text-[#B89A62]">{dataset}</code></p>
            </div>
          </div>

          <div className="bg-[#12100E] border border-[#B89A62]/30 p-8 space-y-4">
            <div className="flex items-center space-x-3 text-[#B89A62]">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">CMS Control Surfaces</h3>
            </div>
            <ul className="text-xs space-y-1.5 font-light text-[#F5F1E8]/80">
              <li>✓ Hero headlines & background videos</li>
              <li>✓ Reordering homepage sections</li>
              <li>✓ Room descriptions & base display prices</li>
              <li>✓ Curated Varkala experiences & guides</li>
              <li>✓ Seasonal promotion validity dates</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#1C1A17] border border-[#B89A62]/40 p-8 text-center space-y-4">
          <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
            External Sanity Manage Console
          </h3>
          <p className="text-xs text-[#D8C7AD] max-w-lg mx-auto font-light">
            Property owners can edit documents directly via Sanity Manage or deploy studio schemas using `npx sanity deploy`.
          </p>
          {projectId && (
            <a
              href={`https://www.sanity.io/manage/project/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all"
            >
              Open Sanity Manage Console
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
