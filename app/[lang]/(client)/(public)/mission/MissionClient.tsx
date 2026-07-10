"use client";

import { motion } from "framer-motion";
import {
  Heart,
  HandHelping,
  Users,
  Coffee,
  GraduationCap,
  Leaf,
} from "lucide-react";

import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import Image from "next/image";

const MISSION_IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80",
  missionMain:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80",
  missionCare:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  missionCommunity:
    "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?auto=format&fit=crop&w=1200&q=80",
  farmMain:
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
  farmPractice:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  farmHeritage:
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
  foundation:
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80",
  impactCare:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80",
  impactEducation:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  impactSustainable:
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
} as const;

interface MissionClientProps {
  dictionary: any;
}

const MissionClient = ({ dictionary }: MissionClientProps) => {
  const toLocalizedPath = useLocalizedPath();
  const page = dictionary?.missionPage ?? {};
  const homeMission = dictionary?.home?.mission ?? {};
  const hero = page.hero ?? {};
  const mission = page.mission ?? {};
  const vision = page.vision ?? {};
  const impact = page.impact ?? {};
  const foundation = page.foundation ?? {};
  const cta = page.cta ?? {};
  const missionTags = mission.tags ?? [];
  const impactCards = impact.cards ?? [];
  const visionBadges = vision.badges ?? [];
  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      {/* HERO SECTION - Behind the Coffee / Our Mission */}
      <section className="py-32 bg-stone-950 text-white relative overflow-hidden">
        <Image
          src={MISSION_IMAGES.hero}
          alt={homeMission.imageAlt ?? "Sheba Cup Coffee - Coffee with a Purpose"}
          fill
          priority
          className="object-cover opacity-40"
        />
        <Container className="max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-amber-600/20 border-amber-600/50 text-amber-500 hover:bg-amber-600/30 transition-colors">
              {homeMission.eyebrow ?? "Behind the Coffee"}
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              {hero.titleLine1 ?? homeMission.title ?? "Coffee With"}{" "}
              <br />{" "}
              <span className="text-amber-500">
                {hero.titleAccent ?? homeMission.titleAccent ?? "A Purpose"}
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light">
              {homeMission.description ??
                "At Sheba Cup Coffee, our mission goes beyond coffee. Every bag you buy supports lifesaving care for children battling cancer in Ethiopia."}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* OUR MISSION SECTION - Mathiwos Wondu Foundation */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={MISSION_IMAGES.missionMain}
                  alt={mission.imageAlts?.main ?? "Supporting childhood cancer care in Ethiopia"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={MISSION_IMAGES.missionCare}
                  alt={mission.imageAlts?.care ?? "Fresh roasted coffee supporting our mission"}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={MISSION_IMAGES.missionCommunity}
                  alt={mission.imageAlts?.community ?? "Community and care through every purchase"}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-8 leading-tight">
                {mission.title ?? "Our Mission:"} <br />
                <span className="text-amber-700">
                  {mission.titleAccent ?? "Lifesaving Care"}
                </span>
              </h2>
              <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
                <p>
                  {mission.paragraph1Before ??
                    "Every bag you buy supports lifesaving care. A portion of each sale goes to the"}
                  <Link href="#" className="text-amber-700 font-medium hover:underline mx-1">
                    {mission.foundationName ?? "Mathiwos Wondu Foundation Ethiopia"}
                  </Link>
                  {mission.paragraph1After ??
                    ", an organization focused on childhood cancer care."}
                </p>
                <p>
                  {mission.paragraph2 ??
                    "Your purchase helps provide screenings, treatment support, and care for families."}
                </p>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 my-6">
                  <p className="text-amber-800 font-serif text-xl italic text-center">
                    &quot;{homeMission.quote ?? mission.quote ?? "One bag of coffee helps fund lifesaving support."}&quot;
                  </p>
                </div>
                <p className="font-medium text-stone-800">
                  {mission.closing ?? "Sheba Cup Coffee stands for great coffee with a purpose."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: Heart, text: homeMission.pillars?.cancerCare?.title ?? missionTags[0]?.text ?? "Childhood Cancer Care" },
                    { icon: HandHelping, text: homeMission.pillars?.treatment?.title ?? missionTags[1]?.text ?? "Treatment Support" },
                    { icon: Users, text: missionTags[2]?.text ?? "Family Care" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl">
                      <item.icon className="w-5 h-5 text-amber-600" />
                      <span className="text-stone-800 font-medium text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* OUR VISION SECTION - Farm to Cup + 30 Years Experience */}
      <section className="py-24 bg-stone-900 text-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <Badge className="mb-6 bg-amber-600/20 border-amber-600/50 text-amber-400 hover:bg-amber-600/30">
                {vision.badge ?? "Behind the Name"}
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                {vision.title ?? "Our Vision:"} <br />
                <span className="text-amber-400">
                  {vision.titleAccent ?? "From Farm to Cup"}
                </span>
              </h2>
              <div className="space-y-6 text-lg text-stone-300 leading-relaxed">
                <p>
                  {vision.paragraph1 ??
                    "Sheba Cup Coffee brings authentic organic Ethiopian specialty Arabica coffee from farm to cup across the world."}
                </p>
                <p>
                  {vision.paragraph2Before ??
                    "Our family holds more than 30 years of coffee farming experience. We work directly with"}{" "}
                  <span className="text-amber-400 font-medium">
                    {vision.birbirsaFarm ?? "Birbirsa Coffee Farm"}
                  </span>{" "}
                  {vision.and ?? "and"}{" "}
                  <span className="text-amber-400 font-medium">
                    {vision.shakichaFarm ?? "Shakicha Coffee Farm"}
                  </span>
                  . {vision.paragraph2After ??
                    "These partnerships support quality, sustainable farming, and Ethiopia's coffee heritage."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-700">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Coffee className="text-amber-400" size={28} />
                      <h3 className="font-serif text-xl">
                        {vision.organicTitle ?? "Organic & Sustainable"}
                      </h3>
                    </div>
                    <p className="text-sm text-stone-400 pl-11">
                      {vision.organicDescription ??
                        "Authentic Ethiopian specialty Arabica"}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-amber-400" size={28} />
                      <h3 className="font-serif text-xl">
                        {homeMission.pillars?.community?.title ??
                          vision.communityTitle ??
                          "Community Growth"}
                      </h3>
                    </div>
                    <p className="text-sm text-stone-400 pl-11">
                      {homeMission.pillars?.community?.description ??
                        vision.communityDescription ??
                        "Education & development programs"}
                    </p>
                  </div>
                </div>
                <div className="bg-stone-800/50 p-6 rounded-2xl border border-stone-700 mt-6">
                  <p className="text-stone-200 italic leading-relaxed">
                    {vision.quote ??
                      "Our goal reaches beyond coffee. Growth from our business supports education and development programs for women and children, helping build stronger communities for the next generation."}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 order-1 lg:order-2"
            >
              <div className="col-span-2 relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={MISSION_IMAGES.farmMain}
                  alt={vision.imageAlts?.farm ?? "Birbirsa Coffee Farm - Ethiopian coffee farming"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                  {visionBadges.map((badge: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={MISSION_IMAGES.farmPractice}
                  alt={vision.imageAlts?.practice ?? "Sustainable coffee farming practices"}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={MISSION_IMAGES.farmHeritage}
                  alt={vision.imageAlts?.heritage ?? "Ethiopian coffee heritage"}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* IMPACT HIGHLIGHTS */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
              {impact.badge ?? "Our Impact"}
            </Badge>
            <h2 className="text-4xl font-bold text-stone-900">
              {impact.title ?? "Making a Difference Together"}
            </h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              {impact.description ??
                "Every purchase directly supports vital programs in Ethiopia"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactCards.map((card: { title: string; description: string; imageAlt: string }, index: number) => {
              const icons = [Heart, GraduationCap, Leaf];
              const CardIcon = icons[index] ?? Heart;
              const images = [MISSION_IMAGES.impactCare, MISSION_IMAGES.impactEducation, MISSION_IMAGES.impactSustainable];
              return (
            <Card key={index} className="border-none shadow-xl bg-white overflow-hidden group">
              <motion.div className="h-48 relative overflow-hidden">
                <Image
                  src={images[index]}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${index === 1 ? "from-stone-900/70 to-stone-700/30" : index === 2 ? "from-amber-900/60 to-stone-900/50" : "from-amber-900/70 to-amber-700/30"}`} />
                <CardIcon className="absolute top-4 right-4 w-10 h-10 text-white/40" />
              </motion.div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">{card.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
            );
            })}
          </div>
        </Container>
      </section>

      {/* Mathiwos Wondu Foundation Info Section */}
      <section className="py-24 bg-stone-50">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              {foundation.title ?? "About Mathiwos Wondu Foundation"}
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto"></div>
          </div>
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-64 relative">
              <Image
                src={MISSION_IMAGES.foundation}
                alt={foundation.imageAlt ?? "Mathiwos Wondu Foundation Ethiopia"}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white">
                  {foundation.overlayTitle ?? "Mathiwos Wondu Foundation Ethiopia"}
                </h3>
              </div>
            </div>
            <CardContent className="p-8">
              <p className="text-stone-700 leading-relaxed mb-4">
                {foundation.paragraph1 ??
                  "The Mathiwos Wondu Foundation is dedicated to improving childhood cancer care in Ethiopia. Through screenings, treatment support, and family care programs, they provide critical assistance to children and families battling cancer."}
              </p>
              <p className="text-stone-700 leading-relaxed">
                {foundation.paragraph2 ??
                  "Sheba Cup Coffee is proud to partner with this incredible organization, donating a portion of every sale to support their lifesaving work."}
              </p>
              <div className="mt-6 text-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50 rounded-full"
                >
                  <Link href="#">
                    {foundation.cta ?? "Learn More About Mathiwos Wondu Foundation"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* CALL TO ACTION - Link to Roasting Page */}
      <section className="py-24 text-center bg-gradient-to-r from-amber-50 to-stone-100">
        <Container className="max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
            {cta.titleLine1 ?? "Great Coffee"} <br />{" "}
            {cta.titleLine2 ?? "With an Even Greater Purpose"}
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed mb-10">
            {cta.description ??
              "Every cup you enjoy helps provide lifesaving care, education, and hope for communities in Ethiopia. Join us in making a difference, one bag at a time."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-12 h-14 text-lg"
            >
              <Link href={toLocalizedPath("/shop")}>
                {cta.shopCoffee ?? "Shop Coffee, Make an Impact"}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-12 h-14 text-lg"
            >
              <Link href={toLocalizedPath("/education")}>
                {cta.discoverRoasting ?? "Discover Our Roasting Process →"}
              </Link>
            </Button>
          </div>
          <p className="mt-8 text-stone-500 text-sm">
            {cta.footnote ??
              "Learn how we bring authentic Ethiopian farm flavor into every cup"}
          </p>
        </Container>
      </section>
    </div>
  );
};

export default MissionClient;