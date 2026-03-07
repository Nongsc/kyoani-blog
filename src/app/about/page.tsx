import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Twitter, 
  Mail, 
  MapPin, 
  Calendar,
  Linkedin,
  Youtube,
  Instagram,
  Globe,
  Link as LinkIcon,
  Heart,
  LucideIcon
} from "lucide-react";
import { getSiteSettings } from "@/lib/articles";
import Image from "next/image";

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

export const metadata: Metadata = {
  title: "关于 - Kyoani Blog",
  description: "了解博主和这个博客的故事",
};

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Github,
  Twitter,
  Mail,
  Linkedin,
  Youtube,
  Instagram,
  Globe,
  Link: LinkIcon,
  Heart,
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  // Parse skills from settings
  const skills = settings.about_skills.length > 0 
    ? settings.about_skills 
    : [
        { name: "TypeScript", color: "bg-blue-100 text-blue-700" },
        { name: "React", color: "bg-cyan-100 text-cyan-700" },
        { name: "Next.js", color: "bg-slate-100 text-slate-700" },
      ];

  // Parse social links from settings
  const socialLinks = settings.about_social_links.length > 0 
    ? settings.about_social_links 
    : [
        { icon: "Github", url: "https://github.com", label: "GitHub" },
        { icon: "Twitter", url: "https://twitter.com", label: "Twitter" },
        { icon: "Mail", url: "mailto:hello@example.com", label: "Email" },
      ];

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                {settings.about_avatar ? (
                  <div className="w-full h-full rounded-full bg-background overflow-hidden relative">
                    <Image
                      src={settings.about_avatar}
                      alt={settings.site_author}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <span className="text-4xl font-light text-primary">
                      {settings.site_author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-primary-foreground">✓</span>
              </div>
            </div>

            {/* Name & Title */}
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {settings.site_author}
            </h1>
            <p className="text-muted-foreground mb-4">
              {settings.about_title}
            </p>

            {/* Location & Date */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {settings.about_location}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {settings.about_join_date} 年加入
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  关于我
                </h2>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                  {settings.about_bio || `你好，我是 ${settings.site_author}，欢迎来到我的博客。`}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  技术栈
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.name}
                      variant="secondary"
                      className={`${skill.color} border-0 px-3 py-1`}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Social Links */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  社交链接
                </h2>
                <div className="space-y-2">
                  {socialLinks.map((link) => {
                    const Icon = iconMap[link.icon] || LinkIcon;
                    return (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {link.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
