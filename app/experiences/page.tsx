import { getExperiences } from "@/lib/sanity/queries";
import Link from "next/link";
import { Clock, MapPin, Compass } from "lucide-react";

export const metadata = {
  title: "Varkala Experiences",
  description: "Explore cliffside walks, backwater kayaking, and authentic Malabar dining at Royal Palace Varkala.",
};

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
            CURATED EXPERIENCES
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            Discover Varkala & Beyond
          </h1>
          <p className="text-xs md:text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
            From dawn backwater kayaking to cliffside golden hour walks, we curate quiet, authentic journeys into Southern Kerala’s coastal culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-[#12100E] border border-[#B89A62]/20 flex flex-col justify-between group hover:border-[#B89A62]/50 transition-all shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={exp.heroImage as string}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-[#171513]/90 text-[#B89A62] text-[10px] px-3 py-1 uppercase tracking-wider border border-[#B89A62]/30">
                    {exp.category}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="font-serif-editorial text-2xl font-light text-[#F5F1E8]">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                    {exp.shortDescription}
                  </p>

                  <div className="flex flex-col space-y-1.5 text-[11px] text-[#D8C7AD] pt-2 border-t border-[#B89A62]/10 font-light">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#B89A62]" />
                      Duration: {exp.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#B89A62]" />
                      Location: {exp.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/experiences/${exp.slug.current}`}
                  className="w-full py-3 border border-[#B89A62]/40 text-[#F5F1E8] text-center text-xs font-semibold tracking-[0.18em] uppercase block hover:bg-[#B89A62] hover:text-[#171513] transition-all"
                >
                  Explore Journey
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
