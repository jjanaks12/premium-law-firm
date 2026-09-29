import { useTranslations } from "next-intl";

export const useNavLink = () => {
    const t = useTranslations("Nav");

    return {
        navLinks: [
            { key: t("aboutUs"), href: "/about" },
            { key: t("practiceAreas"), href: "/practice-areas" },
            { key: t("attorneys"), href: "/team" },
            { key: t("insights"), href: "/insight" },
            { key: t("contact"), href: "/contact" },
        ]
    }
};
