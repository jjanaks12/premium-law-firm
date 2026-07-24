"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const matterTypes = [
  "Corporate & Business Law",
  "Criminal Defense",
  "Civil Litigation",
  "Family & Matrimonial Law",
  "Real Estate & Property",
  "Intellectual Property",
  "Other",
];

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const [submitted, setSubmitted] = useState(false);

  // Defining schema inside component to use translations for errors
  const schema = yup.object({
    name: yup.string().required(t("validation.required")),
    email: yup.string().email(t("validation.email")).required(t("validation.required")),
    phone: yup.string().optional(),
    matter: yup.string().required(t("validation.required")),
    message: yup.string().required(t("validation.required")),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      matter: "",
      message: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      setSubmitted(true);
    },
  });

  const cards = t.raw("cards") as { title: string; lines: string[] }[];
  // Mapping icons manually since JSON can't store components
  const icons = [MapPin, Phone, Mail, Clock];

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-deep text-cream overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-gold) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-gold) 0, transparent 40%)",
          }}
        />
        <div className="container-x relative">
          <div className="max-w-3xl">
            <span className="eyebrow">{t("heroEyebrow")}</span>
            <h1 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-cream">
              {t.rich("heroTitle", {
                br: () => <br />,
                highlight: (chunks) => <span className="italic text-gold">{chunks}</span>
              })}
            </h1>
            <p className="mt-6 text-lg text-cream/75 max-w-2xl leading-relaxed">
              {t("heroDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 md:py-20 relative z-10">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={card.title}
                  className="bg-card border border-border p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 grid place-items-center bg-navy-deep text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 font-serif text-xl text-navy-deep">{card.title}</h3>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {card.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Details */}
      <section className="pb-16 md:pb-24">
        <div className="container-x">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <span className="eyebrow">{t("formEyebrow")}</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif text-navy-deep leading-tight">
                {t("formTitle")}
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl">
                {t("formDesc")}
              </p>

              {submitted ? (
                <div className="mt-10 p-8 border border-gold/30 bg-gold/5 text-navy-deep">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-serif text-2xl">{t("successTitle")}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {t("successDesc")}{" "}
                        <a href="tel:+97714441122" className="text-gold hover:underline">
                          +977 1 444 1122
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit} className="mt-10 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-navy-deep">{t("nameLabel")}</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t("namePlaceholder")}
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-6 bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-gold/50 focus-visible:border-gold transition-colors ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-input'}`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <div className="text-red-500 text-xs">{formik.errors.name as string}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-navy-deep">{t("emailLabel")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-6 bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-gold/50 focus-visible:border-gold transition-colors ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-input'}`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="text-red-500 text-xs">{formik.errors.email as string}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-navy-deep">{t("phoneLabel")}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-6 bg-background border-input text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-gold/50 focus-visible:border-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="matter" className="text-navy-deep">{t("matterLabel")}</Label>
                      <Select 
                        value={formik.values.matter} 
                        onValueChange={(val) => {
                          formik.setFieldValue("matter", val);
                          formik.setFieldTouched("matter", true, false);
                        }}
                      >
                        <SelectTrigger 
                          id="matter"
                          className={`w-full px-4 py-6 bg-background text-foreground focus:ring-gold/50 focus:border-gold transition-colors ${formik.touched.matter && formik.errors.matter ? 'border-red-500' : 'border-input'}`}
                        >
                          <SelectValue placeholder={t("matterPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {matterTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formik.touched.matter && formik.errors.matter && (
                        <div className="text-red-500 text-xs">{formik.errors.matter as string}</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-navy-deep">{t("messageLabel")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder={t("messagePlaceholder")}
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-gold/50 focus-visible:border-gold transition-colors resize-y ${formik.touched.message && formik.errors.message ? 'border-red-500' : 'border-input'}`}
                    />
                    {formik.touched.message && formik.errors.message && (
                      <div className="text-red-500 text-xs">{formik.errors.message as string}</div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="bg-gold hover:bg-gold/90 text-navy-deep px-8 py-6 rounded-none font-medium h-auto uppercase tracking-wide text-sm flex items-center gap-2">
                      {t("submitBtn")} <Send className="h-4 w-4" />
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {t("disclaimer")}
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-navy-deep text-cream p-8 md:p-10 sticky top-28">
                <span className="eyebrow">{t("sidebarEyebrow")}</span>
                <h3 className="mt-4 font-serif text-2xl text-cream">
                  {t("sidebarTitle")}
                </h3>
                <ul className="mt-8 space-y-5">
                  {(t.raw("sidebarList") as string[]).map((item) => (
                    <li key={item} className="flex items-start gap-3 text-cream/85">
                      <CheckCircle2
                        className="h-5 w-5 text-gold shrink-0 mt-0.5"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 pt-8 border-t border-cream/15">
                  <h4 className="font-serif text-lg text-cream">{t("urgentTitle")}</h4>
                  <p className="mt-2 text-sm text-cream/70 leading-relaxed">
                    {t("urgentDesc")}
                  </p>
                  <a
                    href="tel:+97714441122"
                    className="mt-5 inline-flex items-center gap-2 text-gold text-sm tracking-wide hover:underline"
                  >
                    <Phone className="h-4 w-4" /> +977 1 444 1122
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map / Directions */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="eyebrow">{t("directionsEyebrow")}</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif text-navy-deep leading-tight">
                {t("directionsTitle")}
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
                {t("directionsDesc")}
              </p>
              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="text-navy-deep">
                    <strong>{t("directionsAddress")}</strong>
                    <br />
                    <span className="text-muted-foreground">{t("directionsCity")}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="text-navy-deep">
                    <strong>{t("directionsDays")}</strong>
                    <br />
                    <span className="text-muted-foreground">{t("directionsHours")}</span>
                  </div>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Bhagawati+Marg+Naxal+Kathmandu"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-navy hover:text-gold transition-colors"
              >
                {t("directionsBtn")} <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="aspect-4/3 bg-navy-deep border border-border overflow-hidden">
              <iframe
                title="Premium Law Firm Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.1234567890123!2d85.33000000000001!3d27.71000000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzM2LjAiTiA4NcKwMTknNDguMCJF!5e0!3m2!1sen!2snp!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(100%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
