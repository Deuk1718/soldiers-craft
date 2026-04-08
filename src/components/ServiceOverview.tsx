import { motion } from "framer-motion";
import { FileText, Calendar, Users, Search, Heart, FileCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceOverview = () => {
  const { t } = useLanguage();

  const services = [
    { icon: FileText, number: "01", title: t("services.s1.title"), desc: t("services.s1.desc") },
    { icon: Calendar, number: "02", title: t("services.s2.title"), desc: t("services.s2.desc") },
    { icon: Search, number: "03", title: t("services.s3.title"), desc: t("services.s3.desc") },
    { icon: Users, number: "04", title: t("services.s4.title"), desc: t("services.s4.desc") },
    { icon: Heart, number: "05", title: t("services.s5.title"), desc: t("services.s5.desc") },
    { icon: FileCheck, number: "06", title: t("services.s6.title"), desc: t("services.s6.desc") },
  ];

  return (
    <section className="bg-background py-20" id="services">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">{t("services.label")}</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("services.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t("services.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-mono-num text-2xl font-bold text-border">{s.number}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
