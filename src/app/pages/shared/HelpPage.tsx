import { HelpCircle, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useState } from "react";

const quickFaqCards = [
  {
    title: "How to invest?",
    answer: "Go to Marketplace, open any verified project, review risk/ROI details, then invest using your wallet or selected payment mode.",
  },
  {
    title: "How rewards work?",
    answer: "Rewards are granted automatically when project milestones are verified. You can view all points and reward details in your dashboard.",
  },
  {
    title: "How escrow works?",
    answer: "Investor funds stay locked in escrow and are released only after verified milestone completion, adding transparency and protection.",
  },
];

const faqs = [
  {
    q: "What is InfraBondX?",
    a: "InfraBondX is a government-backed infrastructure bond investment platform that tokenizes bonds for retail investors, enabling fractional ownership in large-scale infrastructure projects across India.",
  },
  {
    q: "How does the escrow system work?",
    a: "All invested funds are locked in smart contract escrow accounts. Funds are only released to issuers when project milestones are verified by authorized government bodies, ensuring full transparency and accountability.",
  },
  {
    q: "What returns can I expect?",
    a: "Returns vary by project and are clearly stated on each project page (typically 6-12% per annum). Additionally, investors earn civic rewards like toll discounts, travel credits, and utility benefits based on the project category.",
  },
  {
    q: "How are milestones verified?",
    a: "Issuers submit proof of work (photos, reports, certifications) for each milestone. These are reviewed by platform administrators and government auditors before escrow funds are released.",
  },
  {
    q: "Can I sell my bonds before maturity?",
    a: "Yes! InfraBondX features a secondary market where you can list your bond tokens for sale. Other investors can purchase them at market price.",
  },
  {
    q: "What is the minimum investment amount?",
    a: "The minimum investment is determined by the token price of each project, typically starting from ₹1,000 per token, making infrastructure investment accessible to all.",
  },
  {
    q: "How is KYC verification done?",
    a: "We use DigiLocker integration for seamless Aadhaar-based eKYC verification. The process is instant, paperless, and compliant with RBI guidelines.",
  },
  {
    q: "What happens if a project fails?",
    a: "Unreleased escrow funds are protected. If a project is flagged for fraud or failure, remaining locked funds can be refunded to investors through the platform's dispute resolution mechanism.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <span className="text-sm font-medium pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground text-sm mt-1">Find answers or contact our team</p>
      </div>

      {/* Quick Help */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-default">
          <CardContent className="p-5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-sm font-semibold">Live Chat</p>
            <p className="text-xs text-muted-foreground">Available 9 AM – 6 PM IST</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-default">
          <CardContent className="p-5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold">Email Support</p>
            <p className="text-xs text-muted-foreground">support@infrabondx.com</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-default">
          <CardContent className="p-5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-semibold">Helpline</p>
            <p className="text-xs text-muted-foreground">1800-XXX-XXXX (Toll Free)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {quickFaqCards.map((item) => (
              <div key={item.title} className="p-4 rounded-xl border bg-card hover:bg-accent/30 hover:shadow-sm transition-all duration-200">
                <p className="text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="w-5 h-5" /> Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Useful Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Investment Guide", desc: "Step-by-step guide for new investors" },
            { label: "Issuer Handbook", desc: "How to list and manage bond projects" },
            { label: "Escrow & Security Whitepaper", desc: "Technical details of our escrow system" },
            { label: "Regulatory Compliance", desc: "SEBI & RBI compliance documentation" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent/50 hover:scale-[1.005] transition-all duration-200 cursor-default">
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-4 rounded-xl border bg-primary/5">
            <p className="text-sm font-medium">Email: support@infrabondx.com</p>
            <p className="text-xs text-muted-foreground mt-1">Typical response time: within 24 business hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
