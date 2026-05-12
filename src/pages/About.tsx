import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Target, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  ko: {
    title: "전우찾기 소개",
    tagline: "군 생활의 모든 단계를 함께하는 신뢰의 동반자",
    mission: {
      title: "우리의 미션",
      body: "ComradeFind는 대한민국 군 장병과 가족들이 군 생활의 모든 단계를 안심하고 준비할 수 있도록, 검증된 분야별 안내 가이드를 연결하고 체계적인 정보를 제공하는 것을 사명으로 합니다.",
    },
    values: [
      { icon: Target, title: "정확성", body: "사실에 기반한 정보와 검증된 안내 채널만을 안내합니다." },
      { icon: Users, title: "고객중심", body: "장병과 가족의 입장에서 가장 필요한 것을 우선합니다." },
      { icon: Award, title: "신뢰", body: "투명한 운영과 강력한 개인정보 보호로 신뢰를 쌓습니다." },
    ],
    services: {
      title: "주요 서비스",
      list: [
        "전역일 D-Day 계산기 및 단계별 전역 준비 가이드",
        "동기·전우 찾기 매칭 플랫폼",
        "법무·보훈·심리 분야 군 생활 케어 가이드 안내",
        "Soldiers Craft 멤버증 발급",
        "다국어(한·영·일·중) 지원",
      ],
    },
    contact: {
      title: "회사 정보",
      lines: [
        "회사명: ComradeFind",
        "이메일: support@soldiers-craft.com",
        "운영시간: 평일 09:00~18:00 (KST)",
      ],
    },
  },
  en: {
    title: "About ComradeFind",
    tagline: "A trusted guide for every stage of military life",
    mission: {
      title: "Our Mission",
      body: "ComradeFind is committed to helping ROK service members and their families navigate every stage of military life — by connecting them with vetted guide channels and providing systematic, reliable information.",
    },
    values: [
      { icon: Target, title: "Accuracy", body: "Fact-based information and vetted guide channels only." },
      { icon: Users, title: "Client First", body: "We prioritize what soldiers and families truly need." },
      { icon: Award, title: "Trust", body: "Transparent operations and strong privacy protection." },
    ],
    services: {
      title: "Core Services",
      list: [
        "Discharge D-Day calculator and step-by-step preparation guide",
        "Comrade-finding matching platform",
        "military life guides in legal, veterans-affairs, and psychology",
        "Soldiers Craft membership card issuance",
        "Multilingual support (KO/EN/JA/ZH)",
      ],
    },
    contact: {
      title: "Company Information",
      lines: [
        "Company: ComradeFind",
        "Email: support@soldiers-craft.com",
        "Hours: Weekdays 09:00–18:00 (KST)",
      ],
    },
  },
  ja: {
    title: "戦友探し紹介",
    tagline: "軍生活のすべての段階に寄り添う信頼のガイド",
    mission: {
      title: "私たちのミッション",
      body: "戦友探しは、大韓民国の軍将兵とご家族が軍生活のあらゆる段階を安心して準備できるよう、検証済みの分野別ガイドをつなぎ、体系的な情報を提供することを使命としています。",
    },
    values: [
      { icon: Target, title: "正確性", body: "事実に基づく情報と検証済みガイドのみご案内します。" },
      { icon: Users, title: "顧客中心", body: "将兵とご家族の立場から最も必要なものを優先します。" },
      { icon: Award, title: "信頼", body: "透明な運営と強固な個人情報保護で信頼を築きます。" },
    ],
    services: {
      title: "主要サービス",
      list: [
        "除隊D-Day計算機・段階別準備ガイド",
        "戦友マッチングプラットフォーム",
        "法務・援護・心理分野の軍生活ケアガイド紹介",
        "Soldiers Craftメンバー証発行",
        "多言語対応（韓・英・日・中）",
      ],
    },
    contact: {
      title: "会社情報",
      lines: [
        "会社名：ComradeFind",
        "メール：support@soldiers-craft.com",
        "営業時間：平日 09:00〜18:00 (KST)",
      ],
    },
  },
  zh: {
    title: "找战友介绍",
    tagline: "陪伴军旅生活每一阶段的可信赖指南",
    mission: {
      title: "我们的使命",
      body: "找战友致力于帮助大韩民国军人及其家属安心规划军旅生活的每一阶段——对接经过审核的领域指引顾问，并提供系统、可靠的信息。",
    },
    values: [
      { icon: Target, title: "准确", body: "仅提供基于事实的信息与审核过的指引渠道。" },
      { icon: Users, title: "以客为本", body: "优先满足军人与家属真正所需。" },
      { icon: Award, title: "信赖", body: "透明运营、强力的个人信息保护。" },
    ],
    services: {
      title: "主要服务",
      list: [
        "退伍D-Day计算器与分阶段准备指南",
        "战友匹配平台",
        "法务、退伍军人事务、心理领域军旅生活关怀指南介绍",
        "Soldiers Craft 会员证发放",
        "多语言支持（韩/英/日/中）",
      ],
    },
    contact: {
      title: "公司信息",
      lines: [
        "公司名称：ComradeFind",
        "邮箱：support@soldiers-craft.com",
        "工作时间：工作日 09:00–18:00 (KST)",
      ],
    },
  },
};

const About = () => {
  const { lang } = useLanguage();
  const langKey = (["ko", "en", "ja", "zh"].includes(lang) ? lang : "ko") as keyof typeof content;
  const data = content[langKey];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="font-serif-legal text-xl font-bold text-foreground">{data.title}</h1>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <section className="mb-10 text-center">
          <h2 className="font-serif-legal text-3xl font-bold text-foreground md:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground">{data.tagline}</p>
        </section>

        <section className="mb-10 rounded-2xl border border-border bg-card p-8 shadow-card">
          <h3 className="mb-3 text-lg font-bold text-foreground">{data.mission.title}</h3>
          <p className="text-sm leading-relaxed text-foreground/90">{data.mission.body}</p>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {data.values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold text-foreground">{v.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            );
          })}
        </section>

        <section className="mb-10 rounded-2xl border border-border bg-card p-8 shadow-card">
          <h3 className="mb-4 text-lg font-bold text-foreground">{data.services.title}</h3>
          <ul className="space-y-2">
            {data.services.list.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/40 p-8">
          <h3 className="mb-4 text-lg font-bold text-foreground">{data.contact.title}</h3>
          <ul className="space-y-1 text-sm text-foreground/90">
            {data.contact.lines.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default About;
