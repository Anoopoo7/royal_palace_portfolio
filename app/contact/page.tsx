import { getContactPageData, getSiteSettings } from "@/lib/sanity/queries";
import { MapPin, Phone, Mail, MessageSquare, Navigation } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getContactPageData();
  return {
    title: pageData.seoTitle || "Contact & Location",
    description:
      pageData.seoDescription ||
      "Get in touch with Royal Palace Varkala concierge for reservations and directions.",
  };
}

export default async function ContactPage() {
  const [pageData, siteSettings] = await Promise.all([
    getContactPageData(),
    getSiteSettings(),
  ]);

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          {pageData.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
              {pageData.eyebrow}
            </span>
          )}
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            {pageData.heading || "We Are Here to Welcome You"}
          </h1>
          {pageData.subtitle && (
            <p className="text-xs md:text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
              {pageData.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Left */}
          <div className="lg:col-span-5 space-y-8 bg-[#12100E] border border-[#B89A62]/20 p-8">
            <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] border-b border-[#B89A62]/20 pb-4">
              Direct Channels
            </h3>

            <div className="space-y-6 text-xs font-light">
              {siteSettings.address && (
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-[#B89A62] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#F5F1E8] uppercase tracking-wider text-[10px]">Property Address</h4>
                    <p className="text-[#F5F1E8]/80 mt-1">{siteSettings.address}</p>
                  </div>
                </div>
              )}

              {siteSettings.phone && (
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-[#B89A62] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#F5F1E8] uppercase tracking-wider text-[10px]">Reservations Hotline</h4>
                    <a href={`tel:${siteSettings.phone}`} className="text-[#B89A62] hover:underline mt-1 block">
                      {siteSettings.phone}
                    </a>
                  </div>
                </div>
              )}

              {siteSettings.email && (
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-[#B89A62] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#F5F1E8] uppercase tracking-wider text-[10px]">Email Concierge</h4>
                    <a href={`mailto:${siteSettings.email}`} className="text-[#B89A62] hover:underline mt-1 block">
                      {siteSettings.email}
                    </a>
                  </div>
                </div>
              )}

              {siteSettings.whatsapp && (
                <div className="flex items-start space-x-4">
                  <MessageSquare className="w-5 h-5 text-[#B89A62] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#F5F1E8] uppercase tracking-wider text-[10px]">WhatsApp Concierge</h4>
                    <a
                      href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B89A62] hover:underline mt-1 block"
                    >
                      Start WhatsApp Chat
                    </a>
                  </div>
                </div>
              )}
            </div>

            {siteSettings.googleMapsUrl && (
              <div className="pt-4">
                <a
                  href={siteSettings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border border-[#B89A62]/40 text-[#F5F1E8] text-xs font-semibold tracking-[0.2em] uppercase text-center block hover:bg-[#B89A62] hover:text-[#171513] transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Google Maps</span>
                </a>
              </div>
            )}
          </div>

          {/* Contact Inquiry Form Right */}
          <div className="lg:col-span-7 bg-[#1C1A17] border border-[#B89A62]/30 p-8 space-y-6 shadow-2xl">
            <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] border-b border-[#B89A62]/20 pb-4">
              {pageData.formTitle || "Send an Inquiry"}
            </h3>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Your Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Phone Number</label>
                <input
                  type="tel"
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Message / Special Requests</label>
                <textarea
                  rows={4}
                  required
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all cursor-pointer"
              >
                {pageData.formSubmitText || "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

