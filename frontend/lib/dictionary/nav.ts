import { useTranslations } from "next-intl";

export const useNavLink = () => {
    const t = useTranslations("Nav");

    return {
        navLinks: [
            { key: t("aboutUs"), href: "#" },
            { key: t("practiceAreas"), href: "#" },
            { key: t("attorneys"), href: "/team" },
            { key: t("insights"), href: "#" },
            { key: t("contact"), href: "/contact" },
        ]
    }
};