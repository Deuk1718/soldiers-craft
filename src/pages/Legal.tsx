import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Section = "terms" | "privacy" | "disclaimer";

const content: Record<string, Record<Section, { title: string; body: string }>> = {
  ko: {
    terms: {
      title: "이용약관",
      body: `제1조 (목적)
본 약관은 GJ Group(이하 "회사")이 운영하는 "전우찾기" 서비스(이하 "서비스")의 이용 조건과 절차, 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (서비스의 성격)
본 서비스는 군 생활 정보 제공, D-Day 계산, 동기·전우 찾기, GJ 그룹 전문 파트너 안내 등 정보·연결 서비스를 제공하는 플랫폼입니다. 회사는 직접 법률·의료·세무 자문을 제공하지 않으며, 전문 파트너의 상담 결과에 대해 책임지지 않습니다.

제3조 (회원가입 및 정보)
이용자는 정확한 정보를 제공해야 하며, 허위 정보로 인한 불이익은 이용자 본인이 부담합니다.

제4조 (서비스 이용)
이용자는 본 서비스를 정해진 목적 외 상업적·불법적 용도로 사용할 수 없습니다.

제5조 (개인정보 보호)
회사는 관련 법령에 따라 이용자의 개인정보를 보호하며, 자세한 사항은 개인정보처리방침을 따릅니다.

제6조 (책임 제한)
회사는 천재지변, 시스템 장애, 제3자 행위 등 불가항력으로 인한 서비스 중단·손해에 대해 책임지지 않습니다.

제7조 (분쟁 해결)
본 약관과 관련된 분쟁은 대한민국 법령에 따르며, 관할 법원은 회사 소재지 관할 법원으로 합니다.

부칙: 본 약관은 2026년 1월 1일부터 시행합니다.`,
    },
    privacy: {
      title: "개인정보처리방침",
      body: `1. 수집하는 개인정보 항목
- 필수: 이름, 연락처, 이메일
- 선택: 부대 정보, 기수, 복무기간

2. 수집·이용 목적
- 동기·전우 매칭 서비스 제공
- GJ 그룹 전문 파트너 연결 및 상담 안내
- 서비스 운영, 통계, 문의 응대

3. 보유 및 이용 기간
- 회원 탈퇴 시까지 또는 관련 법령에서 정한 기간 동안 보관 후 즉시 파기

4. 제3자 제공
- 이용자가 동의한 경우에 한해 GJ 그룹 전문 파트너에게 상담 목적으로 제공
- 법령에 의거 수사기관 요구가 있는 경우

5. 안전 조치
- 개인정보 암호화(AES-256)
- 접근권한 최소화 및 정기 접근 기록 관리

6. 이용자 권리
- 개인정보 열람·정정·삭제·처리 정지를 요구할 수 있습니다.

7. 개인정보 보호책임자
GJ Group 개인정보팀 (privacy@gjgroup.example)`,
    },
    disclaimer: {
      title: "면책조항",
      body: `본 서비스("전우찾기")는 정보 제공 및 GJ 그룹 전문 파트너 안내·연결을 목적으로 운영되며, 다음 사항을 명확히 고지합니다.

1. 본 서비스의 콘텐츠는 일반 정보 제공 목적이며, 법률 자문, 의료 진단, 세무 자문, 심리 치료를 대체하지 않습니다.

2. GJ 그룹 전문 파트너는 회사와 별도의 독립된 자격 소지자이며, 파트너의 상담 내용·결과·서비스 품질에 대한 최종 책임은 해당 파트너에게 있습니다.

3. 이용자는 본인의 판단과 책임 하에 서비스를 이용하며, 본 서비스 이용으로 인한 직·간접적 손해에 대해 회사는 책임지지 않습니다.

4. D-Day 계산기 등 자동 계산 기능은 참고용이며, 정확한 전역일 등은 소속 부대 행정관에게 확인하시기 바랍니다.

5. 본 서비스는 군 관련 법령(군인사법, 병역법 등)을 위반하는 어떠한 행위도 권유하지 않습니다.

문의: support@gjgroup.example`,
    },
  },
  en: {
    terms: {
      title: "Terms of Service",
      body: `Article 1 (Purpose)
These Terms govern the use of the "ComradeFind" service ("Service") operated by GJ Group ("Company"), including conditions, procedures, rights, and obligations.

Article 2 (Nature of the Service)
The Service is an information and referral platform offering military-life information, D-Day calculations, comrade search, and GJ Group partner introductions. The Company does not directly provide legal, medical, or tax advice and is not responsible for the outcomes of partner consultations.

Article 3 (Member Information)
Users must provide accurate information; consequences of false information rest with the user.

Article 4 (Use of Service)
Users may not use the Service for commercial or unlawful purposes outside its intended scope.

Article 5 (Privacy)
The Company protects user data per applicable law; details are in the Privacy Policy.

Article 6 (Limitation of Liability)
The Company is not liable for service interruptions or damages caused by force majeure, system failures, or third-party actions.

Article 7 (Dispute Resolution)
Disputes are governed by the laws of the Republic of Korea; jurisdiction is the court of the Company's location.

Effective Date: January 1, 2026.`,
    },
    privacy: {
      title: "Privacy Policy",
      body: `1. Information Collected
- Required: name, phone, email
- Optional: unit, class year, service period

2. Purpose
- Comrade matching
- Connecting users with GJ Group partners
- Service operation, statistics, inquiry response

3. Retention
- Until account deletion or as required by law

4. Sharing with Third Parties
- Only with user consent, shared with GJ Group partners for consultation
- When required by law enforcement

5. Security
- AES-256 encryption
- Minimum access privileges and access log management

6. User Rights
- You may request access, correction, deletion, or restriction of your data.

7. Data Protection Officer
GJ Group Privacy Team (privacy@gjgroup.example)`,
    },
    disclaimer: {
      title: "Disclaimer",
      body: `The "ComradeFind" Service is operated for the purpose of providing information and introducing/connecting users with GJ Group partners. The following is hereby disclosed:

1. Content is for general information only and does not substitute for legal, medical, tax, or psychological professional advice.

2. GJ Group partners are independent qualified providers; final responsibility for consultation content, outcomes, and service quality lies with the respective partner.

3. Users use the Service at their own discretion; the Company is not liable for direct or indirect damages.

4. Automated tools (e.g., D-Day calculator) are for reference; verify discharge dates with your unit administrator.

5. The Service does not encourage any conduct that violates military or related laws.

Contact: support@gjgroup.example`,
    },
  },
  ja: {
    terms: {
      title: "利用規約",
      body: `第1条（目的）
本規約は、GJ Group（以下「当社」）が運営する「戦友探し」サービス（以下「本サービス」）の利用条件、手続、権利義務を定めるものです。

第2条（サービスの性質）
本サービスは、軍生活情報、D-Day計算、戦友検索、GJグループ専門パートナー紹介などを提供する情報・連結プラットフォームです。当社は法律・医療・税務助言を直接提供せず、パートナー相談結果について責任を負いません。

第3条（会員情報）
利用者は正確な情報を提供しなければならず、虚偽情報による不利益は本人が負担します。

第4条（サービスの利用）
利用者は本サービスを商業的・違法な目的で利用することはできません。

第5条（個人情報保護）
当社は関連法令に従い個人情報を保護し、詳細はプライバシーポリシーに従います。

第6条（責任制限）
当社は不可抗力、システム障害、第三者行為によるサービス中断・損害について責任を負いません。

第7条（紛争解決）
本規約に関する紛争は大韓民国法令に従い、管轄裁判所は当社所在地の裁判所とします。

施行日：2026年1月1日`,
    },
    privacy: {
      title: "プライバシーポリシー",
      body: `1. 収集する個人情報
- 必須：氏名、連絡先、メール
- 任意：部隊情報、期、服務期間

2. 利用目的
- 戦友マッチングサービスの提供
- GJグループ専門パートナー紹介・相談案内
- サービス運営、統計、問合せ対応

3. 保有期間
- 退会時まで、または法令で定める期間後直ちに破棄

4. 第三者提供
- 同意がある場合に限り、相談目的でGJグループ専門パートナーに提供
- 法令に基づく要請がある場合

5. 安全措置
- 個人情報暗号化（AES-256）
- アクセス権限最小化と定期記録管理

6. 利用者の権利
- 個人情報の閲覧・訂正・削除・処理停止を要求できます。

7. 個人情報保護責任者
GJ Group プライバシーチーム（privacy@gjgroup.example）`,
    },
    disclaimer: {
      title: "免責事項",
      body: `本サービス（「戦友探し」）は情報提供およびGJグループ専門パートナー紹介・連結を目的とし、以下を明示します。

1. 本サービスのコンテンツは一般情報提供を目的とし、法律相談、医療診断、税務助言、心理治療に代わるものではありません。

2. GJグループ専門パートナーは独立した有資格者であり、相談内容・結果・サービス品質の最終責任は各パートナーにあります。

3. 利用者はご自身の判断と責任で本サービスを利用し、利用に起因する直接・間接損害について当社は責任を負いません。

4. D-Day計算機などの自動機能は参考用であり、正確な除隊日は所属部隊の行政官にご確認ください。

5. 本サービスは軍関連法令に違反する行為を推奨しません。

お問い合わせ：support@gjgroup.example`,
    },
  },
  zh: {
    terms: {
      title: "使用条款",
      body: `第1条（目的）
本条款规定GJ Group（以下简称"本公司"）运营的"找战友"服务（以下简称"本服务"）的使用条件、程序及权利义务。

第2条（服务性质）
本服务是提供军旅生活信息、D-Day计算、战友查找、GJ集团专业伙伴介绍的信息与对接平台。本公司不直接提供法律、医疗或税务咨询，对伙伴咨询结果不承担责任。

第3条（会员信息）
用户须提供准确信息，因虚假信息造成的不利后果由本人承担。

第4条（服务使用）
用户不得将本服务用于商业或非法用途。

第5条（个人信息保护）
本公司依据相关法律保护个人信息，详见隐私政策。

第6条（责任限制）
对不可抗力、系统故障、第三方行为造成的服务中断或损害，本公司不承担责任。

第7条（争议解决）
本条款相关争议适用大韩民国法律，管辖法院为本公司所在地法院。

生效日期：2026年1月1日`,
    },
    privacy: {
      title: "隐私政策",
      body: `1. 收集的个人信息
- 必填：姓名、电话、邮箱
- 选填：部队信息、期次、服役期间

2. 使用目的
- 提供战友匹配服务
- 对接GJ集团专业伙伴
- 服务运营、统计、咨询应答

3. 保存期限
- 至注销账户或法律规定期限届满后立即销毁

4. 第三方提供
- 经用户同意后，为咨询目的提供给GJ集团专业伙伴
- 依法律要求时

5. 安全措施
- 个人信息加密（AES-256）
- 最小权限与定期访问记录管理

6. 用户权利
- 可要求查阅、更正、删除或限制处理。

7. 个人信息保护负责人
GJ Group 隐私团队（privacy@gjgroup.example）`,
    },
    disclaimer: {
      title: "免责声明",
      body: `本服务（"找战友"）以提供信息及对接GJ集团专业伙伴为目的运营，特此声明：

1. 本服务内容仅供一般信息参考，不构成法律咨询、医疗诊断、税务建议或心理治疗。

2. GJ集团专业伙伴为独立有资质的提供者，咨询内容、结果及服务质量的最终责任由相应伙伴承担。

3. 用户自行判断使用本服务，本公司对因使用造成的直接或间接损害不承担责任。

4. D-Day计算器等自动工具仅供参考，准确退伍日期请与所属部队行政官确认。

5. 本服务不鼓励任何违反军事相关法律的行为。

联系方式：support@gjgroup.example`,
    },
  },
};

const Legal = () => {
  const { section } = useParams<{ section: Section }>();
  const { lang } = useLanguage();
  const sec = (section ?? "terms") as Section;
  const langKey = (["ko", "en", "ja", "zh"].includes(lang) ? lang : "ko") as keyof typeof content;
  const data = content[langKey][sec];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="font-serif-legal text-xl font-bold text-foreground">{data.title}</h1>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <article className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-card">
          <h2 className="mb-6 font-serif-legal text-2xl font-bold text-foreground">{data.title}</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {data.body}
          </pre>
        </article>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <Link to="/legal/terms" className="rounded-lg border border-border bg-card px-4 py-2 hover:bg-secondary">
            {content[langKey].terms.title}
          </Link>
          <Link to="/legal/privacy" className="rounded-lg border border-border bg-card px-4 py-2 hover:bg-secondary">
            {content[langKey].privacy.title}
          </Link>
          <Link to="/legal/disclaimer" className="rounded-lg border border-border bg-card px-4 py-2 hover:bg-secondary">
            {content[langKey].disclaimer.title}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Legal;
