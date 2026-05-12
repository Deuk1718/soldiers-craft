import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

type FAQ = { q: string; a: string };

const faqs: Record<string, { title: string; subtitle: string; items: FAQ[] }> = {
  ko: {
    title: "자주 묻는 질문",
    subtitle: "전우찾기 서비스에 대해 가장 많이 문의주시는 내용입니다.",
    items: [
      { q: "전우찾기 서비스는 어떤 서비스인가요?", a: "군 생활 D-Day 계산, 동기·전우 찾기, 군 생활 케어 가이드 안내 등 군 생활 전반에 도움을 드리는 정보·연결 플랫폼입니다." },
      { q: "군 생활 케어 가이드는 어떤 분들인가요?", a: "법무·보훈·심리 등 각 분야의 자격과 경험을 갖춘 독립 안내 가이드로, 회사가 검증한 후 안내해 드립니다. 상담은 담당 가이드와 직접 진행됩니다." },
      { q: "이용료가 발생하나요?", a: "기본 정보 조회와 멤버증 발급은 무료입니다. 군 생활 케어 가이드와의 심층 상담은 안내 범위에 따라 비용이 발생할 수 있습니다." },
      { q: "전우 찾기 매칭 비용은 어떻게 되나요?", a: "등록자가 무료 또는 유료(원하는 금액)를 선택할 수 있습니다. 유료의 경우 장난 연락 방지를 위한 인증 비용 성격입니다." },
      { q: "개인정보는 안전한가요?", a: "AES-256 암호화로 보호되며, 본인이 동의한 경우에만 군 생활 케어 가이드에게 상담 목적으로 제공됩니다. 자세한 내용은 개인정보처리방침을 참고하세요." },
      { q: "전역일 D-Day 계산은 정확한가요?", a: "입대일 기준 표준 복무기간으로 계산하며, 군별·휴가·조기전역 등 변수는 반영되지 않을 수 있습니다. 정확한 전역일은 부대 행정관에게 확인하세요." },
      { q: "외국어를 지원하나요?", a: "한국어, 영어, 일본어, 중국어 4개 언어를 지원합니다. 우측 상단 언어 선택기에서 변경하실 수 있습니다." },
      { q: "고객센터 연락처는?", a: "이메일: support@soldiers-craft.com / 운영시간: 평일 09:00~18:00 (KST)" },
    ],
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "The most common questions about ComradeFind.",
    items: [
      { q: "What is ComradeFind?", a: "It is an information & referral platform that helps with all stages of military life — D-Day calculation, comrade search, military life guide introductions, and more." },
      { q: "Who are the military life guides?", a: "They are independent qualified providers in legal, veterans-affairs, psychology, and related fields. We vet them before introduction. Consultations happen directly with the assigned guide." },
      { q: "Is there a fee?", a: "Basic info lookup and member-card issuance are free. In-depth consultations with military life guides may incur fees based on the guide scope." },
      { q: "How does the comrade-match fee work?", a: "Registrants choose free or paid (set their own amount). Paid is essentially a verification fee to deter prank contacts." },
      { q: "Is my personal data safe?", a: "It is protected with AES-256 encryption and shared with military life guides only with your explicit consent. See our Privacy Policy for details." },
      { q: "Is the discharge D-Day accurate?", a: "It uses standard service periods from the enlistment date and may not reflect branch-specific or leave-related variations. Confirm with your unit administrator." },
      { q: "What languages are supported?", a: "Korean, English, Japanese, and Chinese — switch from the language selector at the top right." },
      { q: "Customer support?", a: "Email: support@soldiers-craft.com / Hours: Weekdays 09:00–18:00 (KST)" },
    ],
  },
  ja: {
    title: "よくある質問",
    subtitle: "「戦友探し」についてよくいただくご質問です。",
    items: [
      { q: "「戦友探し」とは？", a: "D-Day計算、戦友検索、軍生活ケアガイド紹介など、軍生活全般を支援する情報・連結プラットフォームです。" },
      { q: "軍生活ケアガイドとは？", a: "法務・援護・心理など各分野の有資格独立ガイドで、当社が検証のうえご案内します。相談はガイドと直接行います。" },
      { q: "利用料金はかかりますか？", a: "基本情報閲覧とメンバー証発行は無料です。軍生活ケアガイドとの本格相談はガイドの案内により費用が発生する場合があります。" },
      { q: "戦友マッチングの費用は？", a: "登録者が無料または有料（任意金額）を選択できます。有料はいたずら防止の認証費用です。" },
      { q: "個人情報は安全ですか？", a: "AES-256で暗号化し、ご同意がある場合に限り相談目的でガイドに提供します。詳細はプライバシーポリシーをご確認ください。" },
      { q: "D-Day計算は正確ですか？", a: "入隊日基準の標準服務期間で計算するため、軍種・休暇等は反映されない場合があります。正確な除隊日は所属部隊の行政官にご確認ください。" },
      { q: "対応言語は？", a: "韓国語、英語、日本語、中国語の4言語に対応。右上の言語切替で変更できます。" },
      { q: "サポート連絡先", a: "Email: support@soldiers-craft.com / 平日 09:00〜18:00 (KST)" },
    ],
  },
  zh: {
    title: "常见问题",
    subtitle: "关于「找战友」服务最常见的问题。",
    items: [
      { q: "「找战友」是什么服务？", a: "提供D-Day计算、战友查找、军旅生活关怀指南介绍等军旅生活全方位的信息与对接平台。" },
      { q: "军旅生活关怀指南是谁？", a: "他们是法律、退伍军人事务、心理等各领域具备资质的独立指引人员，经我方审核后介绍。咨询直接由指引人员进行。" },
      { q: "是否收费？", a: "基本信息查询和会员证发放免费。与军旅生活关怀指南的深度咨询可能根据指引范围收费。" },
      { q: "战友匹配费用如何？", a: "登记者可选择免费或付费（自定金额）。付费主要是防恶意联系的验证费用。" },
      { q: "个人信息是否安全？", a: "采用AES-256加密，仅在您明确同意下，为咨询目的提供给军旅生活关怀指南。详见隐私政策。" },
      { q: "D-Day计算准确吗？", a: "基于入伍日的标准服役期计算，可能未反映军种、休假等变量。准确退伍日期请与所属部队行政官确认。" },
      { q: "支持哪些语言？", a: "支持韩语、英语、日语、中文4种语言，可在右上角语言切换。" },
      { q: "客服联系方式？", a: "Email: support@soldiers-craft.com / 工作日 09:00–18:00 (KST)" },
    ],
  },
};

const FAQ = () => {
  const { lang } = useLanguage();
  const langKey = (["ko", "en", "ja", "zh"].includes(lang) ? lang : "ko") as keyof typeof faqs;
  const data = faqs[langKey];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="font-serif-legal text-xl font-bold text-foreground">{data.title}</h1>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <p className="mb-8 text-center text-muted-foreground">{data.subtitle}</p>
        <Accordion type="single" collapsible className="space-y-3">
          {data.items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`q-${i}`}
              className="rounded-xl border border-border bg-card px-4 shadow-card"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
};

export default FAQ;
